import ActionCable from 'actioncable'

function ChatConnection(ws_url, senderId, callback) {
  this.senderId = senderId;
  this.callback = callback;

  this.connection = ActionCable.createConsumer(ws_url);
  this.notifChannel = this.createNotifConnection();
  this.roomChannel = null;
  this.receiverId = null;
}

ChatConnection.prototype.talk = function(message, receiverId) {
  this.notifChannel.speak(message, receiverId);
}

ChatConnection.prototype.createNotifConnection = function() {
  var scope = this;
  return this.connection.subscriptions.create({
      channel: 'ChatNotifChannel'
    }, {
    connected: function() {
      console.log('connected to chat notification channel!');
    },
    disconnected: function() {},
    // receiver receives a broadcast signal from sender with a roomCode 123
    // Receiver checks to see if that's for him
    // If it's for him, Receiver then "gets on line 123" to talk to Sender
    received: function(data) {
      var theirReceiverId = data.receiver.username;
      var roomCode        = null;

      // compares sender to self by guid or username
      // if they match, it means the message is for this user
      if (theirReceiverId == scope.senderId) {
        if (scope.roomChannel == null) {
          roomCode = data.room_code;
          scope.roomChannel = scope.createRoomConnection(roomCode);
        }

        // this is so that after user refreshed the page, roomCode is still there. So she won't lose "the line".
        // see line 28 if (roomCode)
        localStorage.setItem('roomCode', roomCode);
      }
    },
    // broadcast a signal to all listeners on this notif channel
    // that a sender (this user) wants to talk to the receiver
    // and the room code is 123, telling receiver, please "get on line" 123 to talk to me
    speak: function(message, receiverId) {
      scope.receiverId = receiverId;
      var roomCode = null;

      if (scope.roomChannel == null) {
        roomCode = ChatConnection.generateRoomCode();
        scope.roomChannel = scope.createRoomConnection(roomCode);

        // not sending the first message yet, just pinging
        localStorage.setItem('firstMessage', message);

        return this.perform('speak', {
          sender:    scope.senderId,
          receiver:  receiverId,
          room_code: roomCode
        });
      } else {
        scope.roomChannel.speak(message);
      }
    }
  });
}

ChatConnection.prototype.createRoomConnection = function(roomCode) {
  var scope = this;
  return this.connection.subscriptions.create({channel: 'RoomChannel', room_code: roomCode, sender: scope.senderId, receiver: scope.receiverId}, {
    connected: function() {
      console.log('connected to RoomChannel. Room code: ' + roomCode + '. Pinging the other end of the line...');
      this.speak('ping');
    },
    disconnected: function() {},
    received: function(data) {
      if (data.receiver.username == scope.senderId) {
        scope.receiverId = data.sender.username;
        if (data.content == 'ping') {
          this.speak('ping-back');
        }
        else if (data.content == 'ping-back') {
          console.log('ping-back received, sending the first message now');
          this.speak(localStorage.getItem('firstMessage'));
        } else {
          return scope.callback(data);
        }
      }
    },
    speak: function(message) {
      return this.perform('speak', {
        room_code: roomCode,
        message:   message,
        sender:    scope.senderId,
        receiver:  scope.receiverId
      });
    }
  });
}

ChatConnection.generateRoomCode = function() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export default ChatConnection;