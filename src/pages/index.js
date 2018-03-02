import React from 'react'
import Link from 'gatsby-link'
import ChatConnection from './connection.js'

// 'ws://localhost:3001/v1/chat'

// localhost data
//http://localhost:8000/?myId=UXtCx5p1mLv97azMrFpFKf3Rr&receiver=UvmXlTDzxqUSdY2mFSlvJPSez
//http://localhost:8000/?myId=UvmXlTDzxqUSdY2mFSlvJPSez

// production data
//http://localhost:8000/?myId=UgKMA2PvpgLUI4dDao0H8pVoJ&receiver=UlFDWkvb780PE9XNUHeQH45mg
//http://localhost:8000/?myId=UlFDWkvb780PE9XNUHeQH45mg

var query = getQueryParams(document.location.search);
var myId = query.myId;
var receiverId = query.receiver;
console.log('sender id: ' + myId);
console.log('receiver id: ' + receiverId);

function handleKeyPress(event) {
  if(event.key == 'Enter'){
    console.log('enter press here! ')

    event.target.value = '';
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
