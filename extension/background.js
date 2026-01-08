/* global chrome */

chrome.action.onClicked.addListener((tab) => {
	if (!tab.id) return;
	chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PANEL" });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === "GET_GOOGLE_TOKEN") {
		chrome.identity.getAuthToken({ interactive: true }, (token) => {
			if (chrome.runtime.lastError || !token) {
				sendResponse({ error: chrome.runtime.lastError });
			} else {
				sendResponse({ token });
			}
		});
		return true;
	}
});
