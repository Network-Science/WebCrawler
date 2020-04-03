//
// Watch browser history to determine if a YouTube video is being watched
//
browser.webNavigation.onHistoryStateUpdated.addListener(
  history => {
    const url = new URL(history.url);
    if (!url.searchParams.get('v')) {
      // Not a video
      return;
    }
    // Send message to content script telling it a new video is being played
    browser.tabs.sendMessage(history.tabId, { videoChanged: true });
  },
  { url: [{ urlMatches: '^https://www.youtube.com/watch?' }] }
);

//
// Receive video information from content script to fetch relevant lyrics
//
// TODO: Add crawler here to get lyrics

function getCrawling(url) {
  return Promise.resolve(crawlUrl(url));
}

let lyrics;
let result;

function setLyrics(title) {
  let converted = convertLyrics(title);
  console.log('Converted', converted);
  let googleUrl = google(converted);
  console.log('google', googleUrl);
  getCrawling(googleUrl).then(res => {
    result = res;
    lyrics = title + ' | Blah Blah Blah';
  });
}

// Listen to message from content script for YouTube video details
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message from the content script: ' + request.title);
  setLyrics(request.title);
});

//
// Listen to popup being opened and forward current lyrics
//
browser.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(function(m) {
    console.log('Got connection from popup');
    // If port is ready, respond with lyrics
    if (m.ready) {
      port.postMessage({ lyrics: lyrics });
    }
  });
});
