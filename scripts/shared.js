var RIZ_API_URL = "https://rizzoma.com/api/rest/1/wave/searchBlipContent/?queryString=&ptagNames=FOLLOW";
var REFRESH_ALARM_NAME = "refresh";
var defaults = {
	refreshTime: 1
};

function updateAlarm(mins) {
	chrome.storage.local.get({
		refreshTime: defaults.refreshTime
	}, function(items) {
		chrome.alarms.create(REFRESH_ALARM_NAME, {
			periodInMinutes: items.refreshTime
		});
		
		chrome.notifications.create('alarmset', {
			type: 'basic',
			title: 'Test',
			message: 'Alarm created.',
			iconUrl: chrome.extensions.getURL('/images/riz_icon_128.png')
		}, function(notifId) {
			if(chrome.runtime.lastError) {
				console.error('Error creating notification \"' + notifId + '\": ');
				console.error(chrome.runtime.lastError);
			} else {
				console.log('Notification \"' + notifId + '\" successfully created.');
			}
		});
	});
}
/**
 * Fetch waves that have been updated since the last refresh and pass them to the callback function
 * @param {Function} successCallback - The function to which the wave data should be sent
 */
function fetchNewUnreadWaves(successCallback, failureCallback) {
	console.log('Preparing to fetch new unread waves.');
	chrome.storage.local.get('lastRefreshTime', function(items) {
		var lastRefreshTime = items.lastRefreshTime || 0;
		chrome.storage.local.set({'lastRefreshTime': Math.floor(Date.now() / 1000)}, function() {});
		fetchUnreadWaves(lastRefreshTime, successCallback, failureCallback);
	});
}
/**
 * Fetch unread waves and pass them to the callback function
 * @param {Number} lastSearchDate - If specified, only waves changed since this timestamp will be returned
 * @param {Function} successCallback - The function to which the wave data should be sent
 */
function fetchUnreadWaves(lastSearchDate, successCallback, failureCallback) {
	console.log('Preparing to fetch waves changed since ' + lastSearchDate + '.');
	// If lastSearchDate has no value, set it to zero (fetch all waves).
	if(lastSearchDate === null || lastSearchDate === undefined) {
		lastSearchDate = 0;
	}
	// Fetch the saved expressSession id.
	chrome.storage.local.get("expressSessionId", function(items) {
		if(!items.expressSessionId) {
			makeIFrame();
		} else {
			var apiURL = RIZ_API_URL + '&lastSearchDate=' + lastSearchDate +
				'&ACCESS_TOKEN=' + encodeURIComponent(items.expressSessionId);
			var xhr = new XMLHttpRequest();
			xhr.open("GET", apiURL, true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState === 4) {
					if(xhr.status === 200) {
						var response = JSON.parse(xhr.responseText);
						// The presence of response.data.lastSearchDate is
						// an indicator that the user is signed in.
						if(response.data && response.data.lastSearchDate &&
								response.data.searchResults) {
							successCallback(response.data.searchResults);
						} else {
							failureCallback();
						}
					} else {
						failureCallback();
					}
				}
			};
			xhr.send();
		}
	});
}

function loadRizTab(waveId) {
	chrome.tabs.query({
		url: '*://*.rizzoma.com/topic/*'
	}, function(tabs) {
		// If a Rizzoma tab exists, update its URL and bring it to the front.
		if(tabs.length > 0) {
			chrome.tabs.update(tabs[0].id, {
				url: 'https://rizzoma.com/topic/' + waveId,
				active: true
			});
			chrome.windows.update(tabs[0].windowId, {
				focused: true
			});
		// If no Rizzoma tab exists, create one.
		} else {
			chrome.tabs.create({
				url: 'https://rizzoma.com/topic/' + waveId,
				active: true
			});
		}
	});
}
