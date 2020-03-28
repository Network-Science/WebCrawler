// Watch browser history to determine if a youtube video is being watched
browser.webNavigation.onHistoryStateUpdated.addListener(history => {
  const url = new URL(history.url);
  if (!url.searchParams.get('v')) {
      // not a video
      return;
  }
  // Send message to content script telling it a new video is being played
  browser.tabs.sendMessage(history.tabId, {videoChanged: true});
},
  {url: [{urlMatches: '^https://www.youtube.com/watch\?'}]}
);

// TODO: Get lyrics here
function getLyrics() {
  return " | Blah Blah Blah"
}

// Based on details from content script, get lyrics
function handleMessage(request, sender, sendResponse) {
  console.log("Message from the content script: " + request.title);
  let lyrics = getLyrics()
  sendResponse({response: "Response from background script | " + request.title + lyrics});
}

// Listen to message from content script for YouTube video details
browser.runtime.onMessage.addListener(handleMessage);