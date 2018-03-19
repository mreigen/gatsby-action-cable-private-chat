import React from 'react'
import Link from 'gatsby-link'
import ChatConnection from './chat_connection_2.js'
import $ from 'jquery'

// 'ws://localhost:3001/v1/chat'

// localhost data
//http://localhost:8000/chat?myId=parasect&receiver=porygon
//http://localhost:8000/chat?myId=porygon&receiver=parasect

// production data
//http://localhost:8000/chat?myId=UgKMA2PvpgLUI4dDao0H8pVoJ&receiver=UlFDWkvb780PE9XNUHeQH45mg
//http://localhost:8000/chat?myId=UlFDWkvb780PE9XNUHeQH45mg

var roomId = null;
var query = getQueryParams(document.location.search);
var myId = query.myId;
var receiverId = query.receiver;
console.log('sender id: ' + myId);
console.log('receiver id: ' + receiverId);

// ==============================================================
//  CHAT INTEGRATION: STARTS FROM HERE

// STEP 1: sets up a callback function
function callback(message) {
  displayMessage(message);
}

// STEP 2: initializes the ChatConnection class and start listening
var chatConn = new ChatConnection('localhost:3001', myId, callback);

// STEP 3: gets chat history between sender (already set in the constructor) and receiver.
// room id is also in the response
chatConn.getChatHistory(receiverId).then(result => {
  // saves RoomId to send messages to
  roomId = result.room_code;
  console.log(roomId);

  // displays the chat history
  $('#messages').html('')
  $.each(result.messages, function(index, message) {
    displayMessage(message);
  });
})

function handleKeyPress(event) {
  if(event.key == 'Enter'){
    var message = event.target.value;
    event.target.value = '';

    // STEP 4: broadcast the message to the room
    chatConn.talk(message, roomId);
//  CHAT INTEGRATION ENDS
// ============================================================

    return event.preventDefault();
  }
}

function displayMessage(message) {
  let sender;
  if (message.sender.username == myId) {
    sender = 'Me';
  } else {
    sender = message.sender.username;
  }
  $('#messages').append("<span class='my-name'>" + sender + "</span>: " + message.content + '<br/>');
}

const IndexPage = () => (
  <div>
    <h4>Me: {myId}</h4>
    <h4>Receiver: {receiverId}</h4>
    <pre id='messages'></pre>
    <input placeholder='please type something...' autoFocus onKeyPress={handleKeyPress}/>
  </div>
)

function getQueryParams(qs) {
  qs = qs.split('+').join(' ');

  var params = {},
      tokens,
      re = /[?&]?([^=]+)=([^&]*)/g;

  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }

  return params;
}

export default IndexPage
