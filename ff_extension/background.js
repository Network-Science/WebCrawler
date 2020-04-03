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
  let converted = convertLyrics(songTitle);
  let googleUrl = google(converted);
  // let crawledElement = crawlUrl(googleUrl);
  // console.log('type of crawled', typeof crawledElement);
  // console.log('crawledElement', crawledElement);
  // var x = crawledElement.getElementByClassName('PZPZlf');
  // lyrics = title + ' | Blah Blah Blah';
  //////
  crawlUrl(googleUrl).then(doc => {
    // let temp = res.body.innerHTML;
    // let domparser = new DOMParser();
    // let doc = domparser.parseFromString(temp, 'text/html');
    let refs = doc.querySelectorAll(
      'a[href^="http"], a[href^="//www"], a[href^="www"]'
    );
    let temp = '';
    console.log('Refs', refs, typeof refs);
    for (let i = 0; i < refs.length; i++) {
      // console.log('ref i', refs[i].href);
      if (refs[i].href.includes('https://www.azlyrics.com/lyrics')) {
        temp = refs[i].href;
        break;
      }
    }
    if (temp !== '') {
      crawlUrl(temp)
        .then(doc => {
          console.log('Temp doc', doc);
          var x = doc.getElementsByClassName('col-xs-12 col-lg-8 text-center');
          console.log('Grabbing by class name', x);
          console.log('lyrics?', x[0].children[7].innerText);
          actualLyrics = x[0].children[7].innerText;
        })
        .then(() => {
          title = songTitle + '\n\n';
          lyrics = actualLyrics;
        });
    }
    // console.log('hello from the other side');
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
