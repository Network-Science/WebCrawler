// returns the fetch result of URL in document object
crawlUrl = async function (url) {
  const result = await fetch(url)
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(data, 'text/html');
      return doc;
    });
  return result;
};

// crawling for geniusLyrics website
geniusLyrics = function (doc) {
  try {
    let pTag = doc.getElementsByTagName('p');
    let content = pTag[0].innerText;
    return content;
  } catch {
    // if any error in try, return false
    return false;
  }
};

// crwaling for azLyrics website
azLyrics = function (doc) {
  try {
    let x = doc.getElementsByClassName('col-xs-12 col-lg-8 text-center');
    let crawledLyrics = x[0].children[7].innerText;
    return crawledLyrics;
  } catch {
    // if any error in try, return false
    return false;
  }
};

// crwaling for lyrics.com website
lyricsCom = function (doc) {
  try {
    let element = doc.getElementById('lyric-body-text');
    let text = element.innerText;
    return text;
  } catch {
    // if any error in try, return false
    return false;
  }
};

//crawling for meteorlyrics.com
metroLyrics = function (doc) {
  try {
    let element = doc.getElementById('lyrics-body-text');
    let text = element.innerText;
    return text;
  } catch {
    // if any error in try, return false
    return false;
  }
};

//converts DOM object to JSON
DOMtoJSON = function (element) {
  let result = {};
  console.log('Hi');
  result.name = element.localName;
  result.attributes = [];
  result.children = [];
  Array.from(element.attributes).forEach((a) => {
    result.attributes.push({ name: a.name, value: a.value });
  });
  Array.from(element.children).forEach((c) => {
    result.children.push(DOMtoJSON(c));
  });
  //console.log(result)
  return result;
};

JSONSearchForLinks = function (doc) {
  let links = [];
};

// add google search parameter
google = function (song) {
  return 'https://www.google.com/search?q=' + song;
};