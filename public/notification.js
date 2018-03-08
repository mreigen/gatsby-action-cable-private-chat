function Notification(paramsHash) {
  this.pusherKey = paramsHash.pusherKey;
  this.currentUserId = paramsHash.currentUserId;
  this.badgeHtmlClass = paramsHash.badgeHtmlClass;

  this.initialize();
}

Notification.prototype.initialize = function() {
  var pusher = new Pusher(this.pusherKey, {
    cluster: 'us2',
    encrypted: true
  });

  var channel = pusher.subscribe('requests-channel');
  var scope = this;
  channel.bind('user-sent-request', function(data) {
    if (data.receiver_id == scope.currentUserId) {
      Notification.display(data);
      Notification.updateBadge(scope.badgeHtmlClass);
    }
  });
}

// ============================================
// Class functions
// ============================================

Notification.display = function(data) {
  console.log(data.intro);
  $.notify(data.intro);
};

Notification.updateBadge = function(badgeHtmlClass) {
  // just increase by 1
  var badgeHtml = $('.' + badgeHtmlClass).html();
  if (badgeHtml == '') {
    badgeHtml = 0;
  }
  var count = parseInt(badgeHtml);
  count += 1;
  $('.' + badgeHtmlClass).html(count);
}