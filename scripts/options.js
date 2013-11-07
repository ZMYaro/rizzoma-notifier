

function init() {
	loadOSStyles();
	setUpChromeLinks();
	setUpEventListeners();
	loadSavedOptions();
}
function loadOSStyles() {
	var osStyle = document.createElement('link');
	osStyle.rel = 'stylesheet';
	osStyle.type = 'text/css';
	if(navigator.userAgent.indexOf('Windows') !== -1) {
		osStyle.href = 'styles/options-win.css';
	} else if(navigator.userAgent.indexOf('Macintosh') !== -1) {
		osStyle.href = 'styles/options-mac.css';
	} else if(navigator.userAgent.indexOf('CrOS') !== -1) {
		osStyle.href = 'styles/options-cros.css';
		// Change the “Chrome” label to “Chrome OS” on CrOS.
		document.querySelector('.sideBar h1').innerText = 'Chrome OS';
	} else {
		osStyle.href = 'styles/options-linux.css';
	}
	document.head.appendChild(osStyle);
}
function setUpChromeLinks() {
	// Get the list of <a>s.
	var links = document.getElementsByTagName('a');
	// For each link,
	for(var i = 0; i < links.length; i++) {
		// if the URL begins with “chrome://”,
		if(links[i].href.indexOf('chrome://') === 0) {
			// tell it to goToPage onclick.
			links[i].onclick = goToPage;
		}
	}
}
function goToPage(e) {
	// Prevent the browser from following the link.
	e.preventDefault();
	chrome.tabs.update({ url: e.target.href });
}

function setUpEventListeners() {
	document.getElementById('refreshInterval').addEventListener('change', function(e) {
		chrome.storage.local.set({
			refreshTime: e.target.value
		}, function() {
			updateAlarm();
		});
	}, false);
}
function loadSavedOptions() {
	chrome.storage.local.get({
		refreshTime: defaults.refreshTime
	}, function(items) {
		document.getElementById('refreshInterval').value = items.refreshTime;
		document.getElementById('refreshInterval').disabled = false;
	});
}

window.addEventListener('load', init, false);