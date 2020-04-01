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
function crawling() {
  fetch(
    'https://www.google.com/search?q=take+me+home+country+road+lyrics&rlz=1C5CHFA_enUS870US870&oq=take+me&aqs=chrome.0.69i59l2j69i57j69i60.1837j0j7&sourceid=chrome&ie=UTF-8'
  )
    .then(response => {
      return response.text();
    })
    .then(data => {
      console.log('This is crawled html in string', data);
      // let domparser = new DOMParser()​​
      // let doc = domparser.parseFromString(data, "text/html")
      console.log('Type of doc', typeof doc);
      return doc;
    });
}

let lyrics;
function setLyrics(title) {
  // crawling();
  lyrics = title + ' | Blah Blah Blah';
}

// Listen to message from content script for YouTube video details
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message from the content script: ' + request.title);
  console.log('This is lyrics doc parsed', crawling());
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
