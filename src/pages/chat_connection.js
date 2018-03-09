import ActionCable from 'actioncable'
import $ from 'jquery'

function ChatConnection(ws_url, senderId, receiverId) {
  this.senderId = senderId;
  this.receiverId = receiverId;
  this.roomCode = localStorage.getItem('roomCode');
  this.roomChannel = null;

  this.connection = ActionCable.createConsumer(ws_url);
  this.notifChannel = this.createNotifConnection(senderId, receiverId);
  if (this.roomCode) {
    this.roomChannel = this.createRoomConnection(this.roomCode, senderId, receiverId);
  }
}

ChatConnection.prototype.broadcast = function(message) {
  this.roomChannel.speak(message);
}

// builds the connection for notification
// receiverId is optional. It is provided when you know exactly the
// person to notified that this user will send a message to her/him.
// If receiverId is left blank, the connection is for listening  which is by default
ChatConnection.prototype.createNotifConnection = function(myId, receiverId) {
  var scope = this;
  return this.connection.subscriptions.create({channel: 'ChatNotifChannel', sender: myId, receiver: receiverId}, {
    connected: function() {
      console.log('connected to notification channel!');
      // call this.speak, this will broadcast the message to all the listeners
      if (receiverId) {
        this.speak(receiverId);
      }
    },
    disconnected: function() {},
    // receiver receives a broadcast signal from sender with a roomCode 123
    // Receiver checks to see if that's for her.
    // If it's for her, Receiver then "gets on line 123" to talk to Sender
    received: function(data) {
      var theirReceiverId = data.receiver.guid;
      var theirSenderId = data.sender.guid;
      var roomCode = data.room_code;

      // compares their receiver to self guid (sender guid)
      // if they match, it means the message is for this user
      if (theirReceiverId == myId) {
        scope.roomChannel = scope.createRoomConnection(roomCode, myId, theirSenderId);
        // this is so that after user refreshed the page, roomCode is still there. So she won't lose "the line".
        // see line 28 if (roomCode)
        localStorage.setItem('roomCode', roomCode);

        return $('#messages').append('About to receive a message from: ' + data.sender.guid + '. Room code: ' + roomCode + '. <br/>');
      }
    },
    // broadcast a signal to all listeners on this notif channel
    // that a sender (this user) wants to talk to the receiver
    // and the room code is 123, telling receiver, please "get on line" 123 to talk to me
    speak: function(receiverId) {
      console.log('notifying user: ' + receiverId);
      var roomCode = ChatConnection.generateRoomCode();
      // creates a room channel, ready to send/receive chat messages to/from receiver
      scope.roomChannel = scope.createRoomConnection(roomCode, myId, receiverId);

      // sends the broadcast message
      return this.perform('speak', {
        sender: myId,
        receiver: receiverId,
        room_code: roomCode
      });
    }
  });
}

// creates a connection to talk with receiver from sender
// ReceiverId arg CAN be blank, if roomCode is present, backend will lookup receiver.
ChatConnection.prototype.createRoomConnection = function(roomCode, myId, receiverId) {
  return this.connection.subscriptions.create({channel: 'RoomChannel', room_code: roomCode, sender: myId, receiver: receiverId}, {
    connected: function() {
      console.log('connected to RoomChannel. Sender: ' + myId + ', Receiver: ' + receiverId);
    },
    disconnected: function() {},
    received: function(data) {
      return $('#messages').append("<span class='my-name'>" + data['sender'] + '</span>: ' + data['content'] + '<br/>');
    },
    speak: function(message) {
      return this.perform('speak', {
        room_code: roomCode,
        message: message,
        sender: myId,
        receiver: receiverId
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