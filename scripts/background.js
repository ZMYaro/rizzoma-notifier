

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


function processUnreadWaves(waves) {
	// If waves were fetched, the iframe is no longer necessary.
	removeIFrame();
	
	console.log('Checking which waves are unread.');
	
	// Create an array for the unread wave objects.
	var unreadWaves = [];
	// For each wave object,
	for(var i = 0; i < waves.length; i++) {
		// If this wave is unread,
		if(waves[i].totalUnreadBlipCount > 0) {
			// Add it to the array of unread waves.
			unreadWaves.push(waves[i]);
		}
	}
	
	console.log(unreadWaves.length + ' waves are unread.');
	
	// Update the browser action with the new unread count.
	updateBrowserAction(unreadWaves.length);
	
	// If desktop notifications are enabled, display one.
	// Same for audio notifications.
	chrome.storage.local.get({
		enableNotifs: defaults.enableNotifs,
		enableSound: defaults.enableSound
	}, function(items) {
		if(items.enableNotifs) {
			notifUnreadWaves(unreadWaves);
		}
		if(items.enableSound && unreadWaves.length > 0) {
			document.getElementById('notifSound').play();
		}
	});
}

function notifUnreadWaves(unreadWaves) {
	if(unreadWaves.length === 1) {
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
	} else if(unreadWaves.length > 1) {
		// If there are multiple unread waves, display their data as a list notification.
		
		// Create an array for the notification items.
		var notifItems = [];
		// For each unread wave,
		for(var i = 0; i < unreadWaves.length; i++) {
			// Add its title and snippet to the array of notification items.
			notifItems.push({
				title: unreadWaves[i].title,
				message: unreadWaves[i].snippet
			});
		}
		
		// Select the icon with the current unread count (or “9+” if ≥ 9).
		var iconURL = '/images/unread_' +
			((unreadWaves.length < 9) ? unreadWaves.length : '9') + '_128.png';
		
		chrome.notifications.create('multi', {
			type: 'list',
			title: notifItems.length + ' new messages',
			message: '',
			iconUrl: chrome.extension.getURL(iconURL),
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

/**
 * Updates the browser action icon and unread count.  If the unread
 * count is null, it assumes an error state and displays a gray icon.
 * @param {Number} unreadCount - The number of unread waves
 */
function updateBrowserAction(unreadCount) {
	if(typeof unreadCount === 'underfined' || unreadCount === null) {
		chrome.browserAction.setIcon({path: RIZ_ICONS.gray});
		chrome.browserAction.setBadgeText({text: ''});
	} else {
		chrome.browserAction.setIcon({path: RIZ_ICONS.normal});
		chrome.browserAction.setBadgeBackgroundColor({color: COLORS.unreadGreen});
		chrome.browserAction.setBadgeText({text: '' + unreadCount});
	}
}

/**
 * Responds to an update failing (presumably due to an invalid expressSessionId)
 */
function updateFailed() {
	updateBrowserAction(null);
	makeIFrame();
}

chrome.alarms.onAlarm.addListener(function(alarm) {
	if(alarm.name === REFRESH_ALARM_NAME) {
		console.log('Refresh alarm fired.');
		fetchNewUnreadWaves(processUnreadWaves, updateFailed);
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
	chrome.browserAction.onClicked.addListener(function(tab) {
		fetchNewUnreadWaves(processUnreadWaves, updateFailed);
		loadRizTab('');
	});
	makeIFrame();
	fetchNewUnreadWaves(processUnreadWaves, updateFailed);
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
