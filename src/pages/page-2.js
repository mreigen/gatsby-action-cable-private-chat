import React from 'react'
import Link from 'gatsby-link'
import $ from 'jquery'

import RequestConnection from './request_notification.js'

// localhost data
//http://localhost:8000/page-2?myId=UaGDdy5IjoEvE6EQEceBjIrdj
//ws://localhost:3001/v1/request_notif

// production data
//http://localhost:8000/page-2?myId=UwkN4tZscQp6QpXQFosHwILPc
//ws://ewm-api.herokuapp.com/v1/request_notif

var query = getQueryParams(document.location.search);
var myId = query.myId;
console.log('sender id: ' + myId);
var count = 0;


// --------- BUILD CONNECTION FOR REQUEST NOTIFICATION ---------
// STEP 1: create a callback function
function callback(data) {
  count++;
  $('#request-count').html(count);
  $('#messages').append(data.sender.first_name + ' sent you a request: ' + data.request.intro + '. <br/>');
}
// STEP 2: initialize the RequestConnection class
var reqConn = new RequestConnection('ws://ewm-api.herokuapp.com/v1/request_notif', myId, callback);
// --------------------------- END -----------------------------


const RequestConnectionPage = () => (
  <div>
    <h4>Me: {myId}</h4>
    Number of requests received: <span id='request-count'>0</span>
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
