import ActionCable from 'actioncable'
import axios from 'axios'

function RequestConnection(baseUrl, senderId, callback) {
  var ws_url = 'ws://' + baseUrl + '/v1/request_notif';
  this.updateRequestUrl = 'http://' + baseUrl + '/v1/requests/'; // + requestId
  this.senderId = senderId;
  this.callback = callback;

  this.connection = ActionCable.createConsumer(ws_url);
  this.notifChannel = this.createNotifConnection(senderId);
}

RequestConnection.prototype.createNotifConnection = function(myId) {
  var scope = this;
  return this.connection.subscriptions.create({channel: 'RequestNotifChannel', sender: myId}, {
    connected: function() {
      console.log('connected to notification channel!');
    },
    disconnected: function() {},
    received: function(data) {
      var theirReceiverId = data.receiver.guid;

      // compares their receiver to self guid (sender guid)
      // if they match, it means the message is for this user
      if (theirReceiverId == myId) {
        return scope.callback(data);
      }
    },
    speak: function() {}
  });
}

export default RequestConnection;