import { Comlink } from './node_modules/comlinkjs/comlink.es6.js';

const w = new Worker('./node_modules/comlink-fetch/src/fetch.worker.js');
const proxy = Comlink.proxy(w);
let song = {
  artist: '',
  title: '',
  lyrics: '',
}
let lyricsFromWorkers = []; // lyricsFromWorkers contain crawled lyrics from each worker

// In Progress: Add crawler here to get lyrics "async function test" & "function setLyrics"

// Wrapper function to let worker thread "fetch"
async function test(link) {
  const API = await new proxy.Fetch();
  API.setBaseUrl(link);
  API.setDefaultHeaders('Content-Type', 'text/html');

  let please = API.get('');
  please
    .then((data) => {
      // returns the fetch result of link in document object
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(data, 'text/html');
      return doc;
    })
    .then((doc) => {
      // traverse the document object depending on the link type
      let result;
      if (link.toLowerCase().includes('azlyrics')) {
        result = azLyrics(doc);
      } else if (link.toLowerCase().includes('genius')) {
        result = geniusLyrics(doc);
      } else if (link.toLowerCase().includes('metrolyrics')) {
        result = metroLyrics(doc);
      } else {
        result = false;
      }
      return result;
    })
    .then((result) => {
      if (result !== undefined && result !== false) {
        return lyricsFromWorkers.push(result);
      }
    });
}

// Main Function to start crawling workers
function setLyrics() {
  // convert title in a string format we can put in as a url
  let converted = convertLyrics(song.artist + ' ' + song.title);
  converted += '+lyrics';
  let googleUrl = google(converted);

  // run google results and extract hrefs from search page
  crawlUrl(googleUrl).then((doc) => {
    let refs = Array.from(
      doc.querySelectorAll('a[href^="http"], a[href^="//www"], a[href^="www"]')
    );

    const visited = [];
    // Filter hrefs on whehter hrefs contain the word "azlyrics", "genius", "metrolyrics"
    for (let i = 0; i < refs.length; i++) {
      const temp = refs[i].href.toLowerCase();
      if (
        temp.includes('azlyrics') ||
        temp.includes('genius') ||
        temp.includes('metrolyrics')
      ) {
        visited.push(refs[i].href);
      }
    }

    console.log('visited after trying to filter', visited);
    lyricsFromWorkers = [];

    console.log(
      'lyricsFromWorkers <-- before promise.all should be empty ',
      lyricsFromWorkers.slice()
    );

    // Set lyricsFromWorkers empty to clear the previous lyric results;

    /* Promise.all 
    Start multiple workers in "parallel"  using Promise.all
    The parallelism appralletly depends on the host's CPU 
    Reference: https://anotherdev.xyz/promise-all-runs-in-parallel/ */
    Promise.all(
      visited.map((link) => {
        test(link);
      })
    ).then(() => {
      console.log(
        'lyricsFromWorkers <-- after Promise all, should contain all workers results',
        lyricsFromWorkers
      );
      return;
    });

    console.log(
      'OUTSIDE ASYNC lyricsFromWorkers <-- should be empty due to async',
      lyricsFromWorkers.slice()
    );

    // TODO : make multiple workers?
    //test worker thread that's a proxy
    // test(googleUrl);

    // TODO: Rewrite this loop for Comlink?
    // refs is sort of treated like a queue here with shift() and concat() in the worker.onmessage
    /*let counter = 0 // counter is to just break the while loop early
    while(refs && refs.length && counter != 10) {
      let link = refs[0].href
      if(!/^(f|ht)tps?:\/\//i.test(link)){
        link = `http://` + link;
      }
      if(!visited.includes(link)){
        crawlUrl(link).then(doc => {
          console.log("New link sent to worker");
          console.log(link);
          worker.postMessage(doc);
        })
        visited.push(link);
        refs.shift();
        counter++;
        
      }
      break;
    }*/

    // if we found search results
    /*if (azUrl !== '') {
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
    }*/
    // lyrics = title + ' | Blah Blah Blah';

    song.title = 'gee';
    song.lyrics = 'gee';
  });
}

//
// Receive video information from content script to fetch relevant lyrics
// Watch browser history to determine if a YouTube video is being watched
//
browser.webNavigation.onHistoryStateUpdated.addListener(
  (history) => {
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

// Listen to message from content script for YouTube video details
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  song.artist = request.artist
  song.title = request.title
  setLyrics();
});

//
// Listen to popup being opened and forward current lyrics
//
browser.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(function(m) {
    console.log('Got connection from popup');
    // If port is ready, respond with lyrics
    if (m.ready) {
      port.postMessage(song);
    }
  });
});