import ActionCable from 'actioncable'

function ChatConnection(ws_url, senderId, callback) {
  this.senderId = senderId;
  this.callback = callback;

  this.connection = ActionCable.createConsumer(ws_url);
  this.roomChannel = this.createRoomConnection();
}

ChatConnection.prototype.talk = function(message, receiverId) {
  this.roomChannel.speak(message, receiverId);
}

ChatConnection.prototype.createRoomConnection = function() {
  var scope = this;
  return this.connection.subscriptions.create({
      channel: 'RoomChannel'
    }, {
    connected: function() {
      console.log('connected to RoomChannel!');
    },
    disconnected: function() {},
    received: function(data) {
      var theirReceiverId = data.receiver.username;
      // compares their receiver to self guid (sender guid)
      // if they match, it means the message is for this user
      if (theirReceiverId == scope.senderId) {
        return scope.callback(data);
      }
    },
    speak: function(message, receiverId) {
      return this.perform('speak', {
        message:   message,
        sender:    scope.senderId,
        receiver:  receiverId
      });
    }
  });
}

export default ChatConnection;