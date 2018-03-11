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

var query = getQueryParams(document.location.search);
var myId = query.myId;
var receiverId = query.receiver;
console.log('sender id: ' + myId);
console.log('receiver id: ' + receiverId);

// STEP 1: set up a callback function
function callback(data) {
  console.log(data);
  $('#messages').append("<span class='my-name'>" + data.sender.first_name + '</span>: ' + data.content + '<br/>');
}

// STEP 2: initialize the ChatConnection class
var chatConn = new ChatConnection('ws://localhost:3001/v1/chat', myId, callback);

function handleKeyPress(event) {
  if(event.key == 'Enter'){
    console.log('enter press here! ')

    // STEP 3: broadcast the message

    var message = event.target.value;
    chatConn.talk(message, receiverId);
    event.target.value = '';

    $('#messages').append("<span class='my-name'>Me</span>: " + message + '<br/>');
    return event.preventDefault();
  }
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
