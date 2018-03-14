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
      var requestId = data.request.guid;
      scope.updateRequestUrl += requestId;

      // compares their receiver to self guid (sender guid)
      // if they match, it means the message is for this user
      if (theirReceiverId == myId) {
        // sends a read receipt
        scope.sendReadReceipt();
        return scope.callback(data);
      }
    },
    speak: function() {}
  });
}

RequestConnection.prototype.sendReadReceipt = function() {
  axios.put(this.updateRequestUrl, {
    read: true
  }).then(res => console.log(res));
}

export default RequestConnection;