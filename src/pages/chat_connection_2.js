// import ActionCable from 'actioncable'

// function ChatConnection(ws_url, senderId, callback) {
//   this.senderId = senderId;
//   this.callback = callback;

//   this.connection = ActionCable.createConsumer(ws_url);
//   this.notifChannel = this.createNotifConnection();
//   this.roomChannel = null;
//   this.receiverId = null;
// }

// ChatConnection.prototype.talk = function(message, receiverId) {
//   this.notifChannel.speak(message, receiverId);
// }

// ChatConnection.prototype.createNotifConnection = function() {
//   var scope = this;
//   return this.connection.subscriptions.create({
//       channel: 'ChatNotifChannel',
//       sender: scope.senderId
//     }, {
//     connected: function() {
//       console.log('connected to notification channel!');
//     },
//     disconnected: function() {},
//     // receiver receives a broadcast signal from sender with a roomCode 123
//     // Receiver checks to see if that's for him
//     // If it's for him, Receiver then "gets on line 123" to talk to Sender
//     received: function(data) {
//       var theirReceiverId = data.receiver.username;
//       var roomCode        = data.room_code;

//       // compares sender to self by guid or username
//       // if they match, it means the message is for this user
//       if (theirReceiverId == scope.senderId) {
//         scope.roomChannel = scope.createRoomConnection(roomCode);

//         // this is so that after user refreshed the page, roomCode is still there. So she won't lose "the line".
//         // see line 28 if (roomCode)
//         localStorage.setItem('roomCode', roomCode);
//       }
//     },
//     // broadcast a signal to all listeners on this notif channel
//     // that a sender (this user) wants to talk to the receiver
//     // and the room code is 123, telling receiver, please "get on line" 123 to talk to me
//     speak: function(message, receiverId) {
//       console.log("trying to get receiver's attention: " + receiverId);

//       scope.receiverId = receiverId;

//       var roomCode = ChatConnection.generateRoomCode();
//       scope.roomChannel = scope.createRoomConnection(roomCode);

//       localStorage.setItem('firstMessage', message);

//       return this.perform('speak', {
//         sender:    scope.senderId,
//         receiver:  receiverId,
//         room_code: roomCode
//       });
//     }
//   });
// }

// ChatConnection.prototype.createRoomConnection = function(roomCode) {
//   var scope = this;
//   return this.connection.subscriptions.create({channel: 'RoomChannel', room_code: scope.roomCode, sender: scope.senderId, receiver: scope.receiverId}, {
//     connected: function() {
//       console.log('connected to RoomChannel. Room code: ' + scope.roomCode);
//       this.speak('ping');
//     },
//     disconnected: function() {},
//     received: function(data) {
//       if ((data.content == 'ping') && (data.receiver.username == scope.senderId)) {
//         this.speak(localStorage.getItem('firstMessage'));
//       } else {
//         return scope.callback(data);
//       }
//     },
//     speak: function(message) {
//       return this.perform('speak', {
//         room_code: roomCode,
//         message:   message,
//         sender:    scope.senderId,
//         receiver:  scope.receiverId
//       });
//     }
//   });
// }

// ChatConnection.generateRoomCode = function() {
//   var length = 8,
//     charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
//     retVal = "";
//   for (var i = 0, n = charset.length; i < length; ++i) {
//     retVal += charset.charAt(Math.floor(Math.random() * n));
//   }
//   return retVal;
// }

// export default ChatConnection;