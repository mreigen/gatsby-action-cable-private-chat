import ActionCable from 'actioncable'
import axios from 'axios'

function ChatConnection(baseUrl, senderId, callback) {
  var wsUrl = 'ws://' + baseUrl + '/v1/request_notif';
  this.baseUrl = baseUrl;

  this.roomId = null;
  this.senderId = senderId;
  this.callback = callback;

  this.connection = ActionCable.createConsumer(wsUrl);
  this.notifChannel = this.createNotifConnection();
  this.roomChannel = null;
  this.receiverId = null;
}

ChatConnection.prototype.getChatHistory = function(receiverId) {
  return new Promise((resolve, reject) => {
    let getRoomIdUrl = 'http://' + this.baseUrl + '/v1/users/' + this.senderId + '/conversations/get_info'
    getRoomIdUrl += '?receiver_id=' + receiverId;

    // TODO: authentication

    axios.get(getRoomIdUrl).then(res => {
      if (res.data) {
        resolve(res.data)
      }
    })
  });
}

ChatConnection.prototype.talk = function(message, roomId) {
  this.notifChannel.speak(message, roomId);
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
    received: function(data) {
      if (data.participants.indexOf(scope.senderId) != -1) {
        if (scope.roomChannel == null) {
          scope.roomId = data.room_id;
          scope.roomChannel = scope.createRoomConnection();
        }
      }
    },
    speak: function(message, roomId) {
      scope.roomId = roomId;

      if (scope.roomChannel == null) {
        scope.roomChannel = scope.createRoomConnection();

        // not sending the first message yet, just pinging
        localStorage.setItem('firstMessage', message);

        return this.perform('speak', {
          sender:    scope.senderId,
          room_id: scope.roomId
        });
      } else {
        scope.roomChannel.speak(message);
      }
    }
  });
}

ChatConnection.prototype.createRoomConnection = function() {
  var scope = this;
  return this.connection.subscriptions.create({channel: 'RoomChannel', room_id: scope.roomId, sender: scope.senderId, receiver: scope.receiverId}, {
    connected: function() {
      console.log('connected to RoomChannel. Room code: ' + scope.roomId + '. Pinging the other end of the line...');
      this.speak('ping');
    },
    disconnected: function() {},
    received: function(data) {
      if (data.participants.indexOf(scope.senderId) != -1) {
        scope.receiverId = data.sender.username;
        if (data.content == 'ping') {
          console.log('ping received, sending the first message now');
          var firstMessage = localStorage.getItem('firstMessage');
          if (firstMessage != 'null') {
            this.speak(firstMessage);
            localStorage.setItem('firstMessage', null);
          }
        } else {
          return scope.callback(data);
        }
      }
    },
    speak: function(message) {
      return this.perform('speak', {
        room_id: scope.roomId,
        message: message,
        sender:  scope.senderId
      });
    }
  });
}

export default ChatConnection;