

function init() {
	// Display the extension version number.
	document.getElementById("versionNumber").innerText =
		"Version " +
		chrome.runtime.getManifest().version;
	
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
	for(setting in defaults) {
		document.getElementById(setting).addEventListener('change', setSetting, false);
	}
}
function setSetting(e) {
	var newSetting = {};
	if(e.target.tagName.toLowerCase() === 'input' &&
			e.target.type.toLowerCase() === 'checkbox') {
		newSetting[e.target.id] = e.target.checked;
	} else {
		newSetting[e.target.id] = e.target.value;
	}
	chrome.storage.local.set(newSetting, function() {
		if(chrome.runtime.lastError) {
			alert("Something went wrong: " + chrome.runtime.lastError);
		}
	});
}

function loadSavedOptions() {
	chrome.storage.local.get(defaults, function(settings) {
		// For each setting,
		for(setting in settings) {
			// Get its form element.
			var formElem = document.getElementById(setting);
			
			// Set its form element's value.
			if(formElem.tagName.toLowerCase() === "input" &&
					formElem.type.toLowerCase() === "checkbox") {
				// Whether the element is checked (if it is a checkbox).
				formElem.checked = settings[setting];
			} else {
				// The element's value (if it is a normal form element).
				formElem.value = settings[setting];
			}
			
			// Enable its form element.
			formElem.disabled = false;
		}
	});
}

window.addEventListener('load', init, false);