import ActionCable from 'actioncable'

function ChatConnection(ws_url, senderId, receiverId, callback) {
  this.senderId   = senderId;
  this.receiverId = receiverId;
  this.roomCode   = localStorage.getItem('roomCode');
  this.roomChannel = null;
  this.callback   = callback;

  this.connection   = ActionCable.createConsumer(ws_url);
  this.notifChannel = this.createNotifConnection();
  if (this.roomCode) { // in case user refreshes the page. roomCode has been saved in the cookies
    this.roomChannel = this.createRoomConnection(this.roomCode, senderId, receiverId, callback);
  }
}

ChatConnection.prototype.broadcast = function(message) {
  this.roomChannel.speak(message);
}

// builds the connection for notification
// receiverId is optional. It is provided when you know exactly the
// person to be notified, that this user will send a message to her/him.
// If receiverId is left blank, the connection is only for listening  which is by default
ChatConnection.prototype.createNotifConnection = function() {
  var scope = this;
  return this.connection.subscriptions.create({channel: 'ChatNotifChannel', sender: scope.senderId, receiver: scope.receiverId}, {
    connected: function() {
      console.log('connected to notification channel!');
      if (scope.receiverId) {
        this.speak(); // tells the receiver that we have a message for him
      }
    },
    disconnected: function() {},
    // receiver receives a broadcast signal from sender with a roomCode 123
    // Receiver checks to see if that's for him
    // If it's for him, Receiver then "gets on line 123" to talk to Sender
    received: function(data) {
      var theirReceiverId = data.receiver.guid;
      var theirSenderId   = data.sender.guid;
      var roomCode        = data.room_code;

      // compares their receiver to self guid (sender guid)
      // if they match, it means the message is for this user
      if (theirReceiverId == scope.senderId) {
        scope.roomChannel = scope.createRoomConnection(roomCode, scope.senderId, theirSenderId, scope.callback);

        // this is so that after user refreshed the page, roomCode is still there. So she won't lose "the line".
        // see line 28 if (roomCode)
        localStorage.setItem('roomCode', roomCode);

        console.log('About to receive a message from: ' + data.sender.guid + '. Room code: ' + roomCode + '. <br/>');
      }
    },
    // broadcast a signal to all listeners on this notif channel
    // that a sender (this user) wants to talk to the receiver
    // and the room code is 123, telling receiver, please "get on line" 123 to talk to me
    speak: function() {
      console.log('notifying user: ' + scope.receiverId);
      var roomCode = ChatConnection.generateRoomCode();
      scope.roomChannel = scope.createRoomConnection(roomCode, scope.senderId, scope.receiverId, scope.callback);

      return this.perform('speak', {
        sender:    scope.senderId,
        receiver:  scope.receiverId,
        room_code: roomCode
      });
    }
  });
}

// creates a connection to talk with receiver from sender
// ReceiverId CAN be blank, if roomCode is present, backend will lookup receiver.
ChatConnection.prototype.createRoomConnection = function(roomCode, myId, receiverId, callback) {
  return this.connection.subscriptions.create({channel: 'RoomChannel', room_code: roomCode, sender: myId, receiver: receiverId}, {
    connected: function() {
      console.log('connected to RoomChannel. Sender: ' + myId + ', Receiver: ' + receiverId);
    },
    disconnected: function() {},
    received: function(data) {
      return callback(data);
    },
    speak: function(message) {
      return this.perform('speak', {
        room_code: roomCode,
        message:   message,
        sender:    myId,
        receiver:  receiverId
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