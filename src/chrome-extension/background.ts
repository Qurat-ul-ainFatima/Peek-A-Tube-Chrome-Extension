// background.js

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      // Initialize some default state in local storage
      chrome.storage.local.set({ enabled: true }, () => {
        console.log("Extension installed. Storage initialized.");
      });
    }
  });
  
  // When the user clicks the extension’s toolbar icon
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        console.log("User clicked extension icon.");
        console.log(`Active Tab URL: ${tabs[0].url}`);
        console.log(`Active Tab Title: ${tabs[0].title}`);
      }
    });
  });
  
  // Example: listen for messages from the content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "logData") {
      // “logData” from contentScript: message.url, message.title
      console.log("Received from content script:", message.url, message.title);
    }
    // Must return true if you plan to send a response asynchronously
    // return true;
  });
  
  // (Optional) Periodic tasks
  chrome.alarms.create("periodicTask", { periodInMinutes: 5 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "periodicTask") {
      console.log("Running periodic task...");
      // do whatever you want here
    }
  });
  