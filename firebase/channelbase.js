// Add the client to the connections when connecting and remove when disconnecting
function connectClient(userId) {
  // since I can connect from multiple devices or browser tabs, we store each connection instance separately
  // any time that connectionsRef's value is null (i.e. has no children) I am offline
  var myConnectionsRef = new Firebase(getFirebaseAppURL() + 'users/' + userId + '/connections');
  // stores the timestamp of my last disconnect (the last time I was seen online)
  var lastOnlineRef = new Firebase(getFirebaseAppURL() + 'users/' + userId + '/lastOnline');
  var connectedRef = new Firebase(getFirebaseAppURL() + '.info/connected');
  connectedRef.on('value', function(snap) {
      if (snap.val() === true) {
          // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
          // add this device to my connections list
          // this value could contain info about the device or a timestamp too
          var con = myConnectionsRef.push(true);
          // when I disconnect, remove this device
          con.onDisconnect().remove();
          // when I disconnect, update the last time I was seen online
          lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
      }
  });
}

// =================================================================================
// ACTIONS =========================================================================
// =================================================================================

// Create a new channel if not exists
// If the channel exists, callBack function will be called
function createChannel(userId, channelId, channelName, channelDesc, callBack) {
  var channelRef = new Firebase(getChannelsURL() + channelId);
  channelRef.once('value', function (currentSnapshot) {
    if (!currentSnapshot.val()) {
      channelRef.set({creator: userId, name: channelName, desc: channelDesc});
    } else {
      callBack();
    }
  });
}

// Returns the base URL for the firebase application
function getFirebaseAppURL() {
  return 'https://channelsss.firebaseio.com/';
}

// Returns the URL for channels
function getChannelsURL() {
  return getFirebaseAppURL() + 'channels/';
}

// Returns URL for shows list of a given channel
function getShowsURL(channelId) {
  return getChannelsURL() + channelId + '/shows/';
}

// Returns URL for votes list of a given show of a given channel
function getVotesURL(channelId, showId) {
  return getShowsURL(channelId) + showId + '/votes/';
}

// Returns URL for audience of a given channel
function getAudienceURL(channelId) {
  return getChannelsURL() + channelId + '/audience/';
}

// Returns audience of a given channel
function getAudience(channel) {
  return channel.child('audience');
}

// Returns votes for a given channel
function getVotes(channel) {
  return channel.child('votes');
}

// Returns current show for a given channel
function getCurrentShow(channel) {
  return channel.child('currentShow');
}
        
// Add a given show to a given channel and vote it by the user id.
// If the show is already there, just vote it.
// Callback function will receive the show and the vote
// Note: if the userId, channelId, showId or showLink is null, the function will do nothing
function addOrVoteShow(userId, channelId, showId, showName, showLink, showDesc, callBack) {
  if (userId === '' || channelId === '' || showId === '' || showLink === '') {
    // Channel and Show ids are musts
    return;
  }
  
  var showRef = new Firebase(getShowsURL(channelId) + showId);
  showRef.once('value', function(currentSnapshot) {
    if (!currentSnapshot.val()) {
      showRef.set({name: showName, link: showLink, desc: showDesc});
    }
    var vote = voteToShow(showRef, userId);
    
    if (callBack) {
      callBack(vote);
    }
  });
  return showRef;
}

// vote a given show by given user
function voteToShow(showRef, userId) {
  var userRef = showRef.child('votes/' + userId);
  userRef.set(userId);
  return userRef;
}

// Removes the vote given by the given user for the given show in given channel
function unvoteShow(userId, channelId, showId) {
  alert(getVotesURL(channelId, showId));
  var voteRef = new Firebase(getVotesURL(channelId, showId) + userId);
  voteRef.once('value', function (vote) {
    voteRef.remove();
  });
}

// Notifies that the current show ended and the next one is starting
// Note: if the channelId or showLink is null, the method will do nothing
function startNewShow(channelId, showLink, showName, showDesc) {
  if (channelId === '' || showLink === '') {
    // ChannelId and showId are mandatory
    return;
  }
  
  var currentShowRef = new Firebase(getChannelsURL() + channelId + '/currentShow/');
  currentShowRef.set({link: showLink, name: showName, desc: showDesc, startTime: Firebase.ServerValue.TIMESTAMP});
}

// Removes a given show of a given channel
function removeShow(channelId, showId) {
  var showRef = new Firebase(getShowsURL(channelId) + showId);
  showRef.remove();
}

// Adds the given user to the given channel's audience
// Note: if the userId or channelId is null, the method will do nothing
function watchChannel(userId, channelId) {
  if (userId === '' || channelId === '') {
    // UserId and channelId are mandatory
    return;
  }
  
  var audienceRef = new Firebase(getAudienceURL(channelId) + userId);
  audienceRef.set(userId);
  return audienceRef;
}

// Removes the given user from a given channel's audience
// Note: if the userId or channelId is null, the method will do nothing
function leaveChannel(userId, channelId) {
  if (userId === '' || channelId === '') {
    // UserId and channelId are mandatory
    return;
  }
  
  var audienceRef = new Firebase(getAudienceURL(channelId) + userId);
  audienceRef.remove();
}

// =================================================================================
// CALLBACKS =======================================================================
// =================================================================================

// Gets called when a new channel added
// Call back method will receive the added channel
function onChannelAdd(callBack) {
  var channelsRef = new Firebase(getChannelsURL());
  channelsRef.on('child_added', function (channel) {
    callBack(channel);
  });
  return channelsRef;
}

// Gets called when a channel removed
// Call back method will receive the removed channel
function onChannelRemove(callBack) {
  var channelsRef = new Firebase(getChannelsURL());
  channelsRef.on('child_added', function (channel) {
    callBack(channel);
  });
  return channelsRef;
}

// Gets called when a channel changed
// Call back method will receive the changed channel
function onChannelChange(callBack) {
  var channelsRef = new Firebase(getChannelsURL());
  channelsRef.on('child_changed', function (channel) {
    callBack(channel);
  });
  return channelsRef;
}

// Gets called when one or more channels changed
// Callback method will receive all the channels
function onChannelsChange(callBack) {
  var channelsRef = new Firebase(getChannelsURL());
  channelsRef.on('value', function (channels) {
    callBack(channel);
  });
  return channelsRef;
}

// Gets called when a new show added to a given channel
// Call back method will receive the added show
function onShowAdd(channelId, callBack) {
  var showsRef = new Firebase(getChannelsURL() + channelId + '/shows');
  showsRef.on('child_added', function (show) {
    callBack(show);
  });
  return showsRef;
}

// Gets called when a show removed from a given channel
// Call back method will receive the removed show
function onShowRemove(channelId, callBack) {
  var showsRef = new Firebase(getChannelsURL() + channelId + '/shows');
  showsRef.on('child_removed', function (show) {
    callBack(show);
  });
  return showsRef;
}

// Gets called when a show cahnged
// Call back method will receive the changed show
function onShowChange(channelId, callBack) {
  var showsRef = new Firebase(getChannelsURL() + channelId + '/shows');
  showsRef.on('child_changed', function (show) {
    callBack(show);
  });
  return showsRef;
}

// Gets called when one or more shows changed
// Call back method will receive all the shows
function onShowsChange(channelId, callBack) {
  var showsRef = new Firebase(getChannelsURL() + channelId + '/shows');
  showsRef.on('value', function (shows) {
    callBack(shows);
  });
  return showsRef;
}

// Gets called when a vote added to a given show of a given channel
// CallBack method will receive the added vote
function onVoteAdd(channelId, showId, callBack) {
  var votesRef = new Firebase(getChannelsURL() + channelId + '/shows/' + showId + '/votes');
  votesRef.on('child_added', function (vote) {
    callBack(vote);
  });
  return votesRef;
}

// Gets called when a vote removed from a given show of a given channel
// CallBack method will receive the removed vote
function onVoteRemove(channelId, showId, callBack) {
  var votesRef = new Firebase(getChannelsURL() + channelId + '/shows/' + showId + '/votes');
  votesRef.on('child_removed', function (vote) {
    callBack(vote);
  });
  return votesRef;
}

// Gets called when a vote added or removed
// Callback function will get all the votes
function onVotesChange(channelId, showId, callBack) {
  var votesRef = new Firebase(getChannelsURL() + channelId + '/shows/' + showId + '/votes');
  votesRef.on('value', function (votes) {
    var voteCount = 0;
    votes.forEach(function () {
      voteCount++;
    });
    callBack(voteCount);
  });
  return votesRef;
}

// Gets called when the current show of the channel changed
// Call back method will be passed the new show's details
function onCurrentShowChange(channelId, callBack) {
  var currentShowRef = new Firebase(getChannelsURL() + channelId + '/currentShow/');
  currentShowRef.on('value', function (snapshot) {
    callBack(snapshot.child('link').val(), snapshot.child('name').val(), snapshot.child('desc').val(), snapshot.child('startTime').val());
  });
  return currentShowRef;
}