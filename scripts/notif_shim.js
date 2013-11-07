(function() {
	if(!chrome.notifications && window.webkitNotifications) {
		/** {Array<Function>} An array of all click event callbacks. */
		var clickEventListeners = [];
		/** {Object<String,Notification>} A map of notification ids to Notifications. */
		var notifs = {};
		
		/**
		 * Call all click event listeners and pass them the id of
		 * the notification that was just clicked.
		 * @param {String} notifId - The id of the notification that was clicked
		 */
		function notifClicked(notifId) {
			for(var i = 0; i < clickEventListeners.length; i++) {
				clickEventListeners[i](notifId);
			}
		}
		
		chrome.notifications = {
			/**
			 * Creates and displays a notification.
			 * @param {String} notificationId - Identifier of the notification. If it is empty, this
			 *                                  method generates an id. If it matches an existing
			 *                                  notification, this method first clears that notification
			 *                                  before proceeding with the create operation.
			 * @param {Object} options - Contents of the notification.
			 * @param {Function} callback - Returns the notification id that represents the created notification.
			 */
			create: function(notifId, options, callback) {
				// Remove any notification that exists with the given id.
				if(notifId in notifs) {
					notifs[notifId].cancel();
				}
				// Create a new WebKit Notification.
				notifs[notifId] = window.webkitNotifications.createNotification(
					options.iconUrl,
					options.title,
					options.message
				);
				notifs[notifId].onclick = function() {
					notifClicked(notifId);
				};
				// If a callback was passed, set the callback to be
				// called when the notification is shown.
				if(callback) {
					notifs[notifId].ondisplay = function() {
						callback(notifId);
					};
				}
				// Display the new notification.
				notifs[notifId].show();
			},
			
			/**
			 * Clears the specified notification.
			 * @param {String} notifId - The id of the notification to be cleared.
			 * @param {Function} callback - Called to indicate whether a matching notification existed.
			 */
			clear: function(notifId, callback) {
				if(notifId in notifs) {
					notifs[notifId].cancel();
					callback(true);
				} else {
					callback(false);
				}
			},
			
			/**
			 * The user clicked in a non-button area of the notification.
			 */
			onClicked: {
				addListener: function(callback) {
					// Add the new event callback to the Array of event callbacks.
					clickEventListeners.push(callback);
				}
			}
		};
	}
})();