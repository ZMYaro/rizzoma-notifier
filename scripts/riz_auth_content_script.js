(function() {
	if(window.name !== 'rizNotifIFrame') {
		return;
	}

	var addAuthDiv = function() {
		if(!document.getElementById('expressSessionId')) {
			var tokenElem = document.createElement('div');
			tokenElem.id = 'expressSessionId';
			tokenElem.innerHTML = (window.expressSession ? window.expressSession.id : 'undefined');
			document.body.appendChild(tokenElem);
		}
	};

	var pgScript = document.createElement('script');
	pgScript.type = 'text/javascript';
	pgScript.innerText = pgScript.textContent = '(' + addAuthDiv + ')();';
	(document.head || document.documentElement).appendChild(pgScript);

	chrome.storage.local.set({
		expressSessionId: document.getElementById('expressSessionId').innerText
	}, function() {});

	/*chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if(message === 'GET_ACCESS_TOKEN') {
			sendResponse(document.getElementById('expressSessionId').dataset.token);
		}
	});*/
})();
