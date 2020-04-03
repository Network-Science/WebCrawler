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

function AStar(title){

  //return as promise later
  console.log('Title is ', title);
  newTitle = title.replace(/[^A-Za-z0-9]/g, ' ').trim();
  console.log('New title is', newTitle);
  var tokens = newTitle.split(/[ ,]+/);
  console.log(tokens);

  let frontier = [{link:'https://www.azlyrics.com/', score: -1}]

  while(frontier.length != 0) {
    //last object in the list should have highest relevancy
    //the frontier list is like a priority queue, we examine the link with highest priority
    let obj = frontier.pop();
    console.log("Goddamit");

    let linkPromise = crawling(obj.link);
    linkPromise.then(links => {
      console.log("Links gotten!");
      console.log(links);

      //processLinks calculates relevancy scores
      //newScores returns an array of objects of the form {link: blah, score: blah}
      let newScores = processLinks(links, tokens);

      console.log(newScores);
      //frontier.concat(newScores);
      return newScores;
    });

    //sort frontier by relevancy score property, in ascending order. Highest value last

    //repeat until relevancy match found (need to define expected relevancy of match)
   
  }
}

function crawling(link) {
  return(fetch(
    link
  )
    .then(response => {
      return response.text();
    })
    .then(data => {
      return data;
    })
    .then(string => {
      let links = [];
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(string, 'text/html');

      let refs = doc.querySelectorAll('a[href^="http"], a[href^="//www"], a[href^="www"]');
      
      refs.forEach(tag => {
        links.push(tag.getAttribute('href'));
      })
      return links;  
    }));

    
}

function processLinks(links, tokens){
  let linkScores = []
  links.forEach(link => {
    //console.log(link);
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
      //console.log(everything);

      let text = []
      everything.forEach(element => {
        if(element.textContent != "")
          text.push(element.innerText);
      });
      //output is still not that clean, but I don't think i can do any better
      //console.log(text);
      let relevancy = calcRelevancy(tokens, text);

      //records link along with its relevancy score
      linkScores.push({link:link, score: relevancy})
    })
  });
  //console.log(linkScores);
  return linkScores;
}

//TODO : get this shit actually working
function calcRelevancy(title, text) {
  //title is an array of words
  let totalRelevancy = 0;
  for(let i = 0; i < text.length; i++){
    let score = 0;

    for(let j = 0; j < title.length; j++){
      if(text[i].includes(title[j])){
        score++;
      }
    }
    //should try to penalize score if words aren't next to each other
    totalRelevancy+= score/title.length
    //should also factor in text size too?
  }
  return totalRelevancy;
}

function getCrawling(title) {
  return Promise.resolve(AStar(title));
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
