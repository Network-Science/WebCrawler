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
function crawling(title) {
  console.log('Title is ', title);
  fetch(
    'https://www.azlyrics.com/'
  )
    .then(response => {
      return response.text();
    })
    .then(data => {
      console.log('This is crawled html in string', data);
      console.log('Type of data', typeof data);
      return data;
    })
    .then(string => {
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(string, 'text/html');
      console.log('type of doc', typeof doc);
      console.log('this is doc', doc);

      let refs = doc.querySelectorAll('a[href^="http"], a[href^="//www"], a[href^="www"]');
      console.log(refs);
      let links = [];
      refs.forEach(tag => {
        links.push(tag.getAttribute('href'));
      })
      console.log(links);

      //calculate relevancy somehow
      links.forEach(link => {
        console.log(link);
        if(!/^(f|ht)tps?:\/\//i.test(link)){
          link = `http://` + link;
        }

        fetch(link)
        .then(response => {
          return response.text();
        })
        .then(data => {
          
          return data;
        })
        .then(string => {
          let parser = new DOMParser();
          let doc = parser.parseFromString(string, 'text/html');

          let everything = doc.querySelectorAll('body :not(style):not(script):not(section):not(nav):not(#cst)');
          //let everything = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, b, div')
          console.log(everything);

          let text = []
          everything.forEach(element => {
            if(element.textContent != "")
              text.push(element.innerText);
          });
          //output is still not that clean, but I don't think i can do any better
          console.log(text);

          //compare text to keywords?
        })
      })
      return doc;
    });
}


function getCrawling(title) {
  return Promise.resolve(crawling(title));
}

let lyrics;
let result;
function setLyrics(title) {
  getCrawling(title)
    .then(res => (result = res))
    .then(() => {
      console.log('this is result', result);
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
