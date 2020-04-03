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

let title = '';
let lyrics = '';

function setLyrics(songTitle) {
  // convert title in a string format we can put in as a url
  let converted = convertLyrics(songTitle);
  let googleUrl = google(converted);
  // run google results and extract hrefs
  crawlUrl(googleUrl).then(doc => {
    let refs = doc.querySelectorAll(
      'a[href^="http"], a[href^="//www"], a[href^="www"]'
    );
    let azUrl = '';
    for (let i = 0; i < refs.length; i++) {
      // check if hrefs string is azlyrics, I only store the first one found currently
      if (refs[i].href.includes('https://www.azlyrics.com/lyrics')) {
        azUrl = refs[i].href;
        break;
      }
    }
    // if we found search results
    if (azUrl !== '') {
      // crawl to azlyrics website url
      crawlUrl(azUrl)
        .then(doc => {
          // this part relies heavily on the html structure of the website
          // so far they all have same format
          let x = doc.getElementsByClassName('col-xs-12 col-lg-8 text-center');
          //// console.log('Grabbing by class name', x);
          //// console.log('lyrics?', x[0].children[7].innerText);
          let crawledLyrics = x[0].children[7].innerText;
          return crawledLyrics;
        })
        .then(crawledLyrics => {
          title = songTitle + '\n\n';
          lyrics = crawledLyrics;
        });
    }
    // lyrics = title + ' | Blah Blah Blah';
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
      port.postMessage({ title: title, lyrics: lyrics });
    }
  });
});
