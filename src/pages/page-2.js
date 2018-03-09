import React from 'react'
import Link from 'gatsby-link'
import $ from 'jquery'

import RequestConnection from './request_notification.js'

// localhost data
//http://localhost:8000/page-2?myId=UaGDdy5IjoEvE6EQEceBjIrdj

// production data
//http://localhost:8000/?myId=UgKMA2PvpgLUI4dDao0H8pVoJ&receiver=UlFDWkvb780PE9XNUHeQH45mg
//http://localhost:8000/?myId=UlFDWkvb780PE9XNUHeQH45mg

var query = getQueryParams(document.location.search);
var myId = query.myId;
console.log('sender id: ' + myId);
var count = 0;

function callback(data) {
  count++;
  $('#request_count').html(count);
  $('#messages').append('Receive a request from: ' + data.sender.guid + '.<br/>');
}

// STEP 1: initialize the RequestConnection class
var reqConn = new RequestConnection('ws://localhost:3001/v1/requests', myId, callback);

const RequestConnectionPage = () => (
  <div>
    <h4>Me: {myId}</h4>
    Number of requests received: <span id='request_count'>0</span>
    <pre id='messages'></pre>
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

export default RequestConnectionPage
