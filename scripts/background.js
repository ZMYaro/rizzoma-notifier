

function makeIFrame() {
	removeIFrame();
	
	var iframe = document.createElement('iframe');
	iframe.src = 'https://rizzoma.com/topic/';
	iframe.id = 'rizNotifIFrame';
	iframe.name = 'rizNotifIFrame';
	document.body.appendChild(iframe);
}
function removeIFrame() {
	// Remove existing iframes.
	var iframes = document.getElementsByTagName('iframe');
	while(iframes.length > 0) {
		iframes[0].parentElement.removeChild(iframes[0]);
	}
}


function notifUnreadWaves(waves) {
	// If waves were fetched, the iframe is no longer necessary.
	removeIFrame();
	
	console.log('Checking which waves are unread.');
	
	// Create arrays for the unread wave objects and the notification items.
	var unreadWaves = [];
	var notifItems = [];
	// For each wave object...
	for(var i = 0; i < waves.length; i++) {
		// If this wave is unread,
		if(waves[i].totalUnreadBlipCount > 0) {
			// Add it to the array of unread waves,
			unreadWaves.push(waves[i]);
			// And add its title and snippet to the array of notification items.
			notifItems.push({
				title: waves[i].title,
				message: waves[i].snippet
			});
		}
	}
	
	console.log(notifItems.length + ' waves are unread.');
	
	if(notifItems.length === 1) {
		// If there is only one unread wave, display its data as a basic notification.
		chrome.notifications.create(unreadWaves[0].waveId, {
			type: 'basic',
			title: unreadWaves[0].title,
			message: unreadWaves[0].snippet,
			iconUrl: chrome.extension.getURL('/images/riz_icon_128.png')
		}, function(notifId) {
			if(chrome.runtime.lastError) {
				console.error('Error creating notification \"' + notifId + '\": ');
				console.error(chrome.runtime.lastError);
			} else {
				console.log('Notification \"' + notifId + '\" successfully created.');
			}
		});
	} else if(notifItems.length > 1) {
		// If there are multiple unread waves, display their data as a list notification.
		chrome.notifications.create('multi', {
			type: 'list',
			title: notifItems.length + ' new messages',
			message: '',
			iconUrl: chrome.extension.getURL('/images/riz_icon_128.png'),
			items: notifItems
		}, function(notifId) {
			if(chrome.runtime.lastError) {
				console.error('Error creating notification \"' + notifId + '\": ');
				console.error(chrome.runtime.lastError);
			} else {
				console.log('Notification \"' + notifId + '\" successfully created.');
			}
		});
	}
}

chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name === REFRESH_ALARM_NAME) {
		console.log('Refresh alarm fired.');
		fetchNewUnreadWaves(notifUnreadWaves, makeIFrame);
	}
});
chrome.notifications.onClicked.addListener(function(notificationId) {
	if(notificationId === 'multi') {
		loadRizTab('');
	} else {
		loadRizTab(notificationId);
	}
	// Clear the notification that was clicked.
	chrome.notifications.clear(notificationId, function(){});
});

window.addEventListener('load', function() {
	console.log('Extension started.');
	makeIFrame();
	fetchNewUnreadWaves(notifUnreadWaves, makeIFrame);
	updateAlarm();
}, false);

/*chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(message === 'GET_ACCESS_TOKEN') {
		chrome.tabs.query({
			url: '*://rizzoma.com/topic/*'
		}, function(tabs) {
			if(tabs.length > 0) {
				chrome.tabs.sendMessage(tabs[0].id, 'GET_ACCESS_TOKEN', function(response) {
					sendResponse(response);
				});
			}
		});
	}
});*/
