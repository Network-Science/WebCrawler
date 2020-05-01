// returns the fetch result of URL in document object
crawlUrl = async function (url) {
  const result = await fetch(url)
    .then((response) => {
      // console.log('url', url);
      return response.text();
    })
    .then((data) => {
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(data, 'text/html');
      return doc;
    });
  return result;
};

geniusLyrics = function (doc) {
  try {
    let pTag = doc.getElementsByTagName('p');
    let num = pTag.length;
    console.log('pTag', pTag, 'num', num);
    let content;
    if (num >= 0) {
      content = pTag[0].innerText;
      console.log('geniusLyrics');
    }
    return content;
  } catch {
    return false;
  }
};

azLyrics = function (doc) {
  try {
    console.log('inside azLyrics', doc);
    let x = doc.getElementsByClassName('col-xs-12 col-lg-8 text-center');
    let crawledLyrics = x[0].children[7].innerText;
    console.log('az rwaledLyrics');
    return crawledLyrics;
  } catch {
    return false;
  }
};

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
  let url = 'https://www.google.com/search?q=';
  url += song;
  //url += '+azlyrics';
  return url;
};

// change white space of a string to '+' to allow inserting the value into the url
convertLyrics = function (title) {
  let converted = '';
  for (let i = 0; i < title.length; i++) {
    if (title[i] === ' ') {
      converted += '+';
    } else {
      converted += title[i];
    }
  }
  return converted;
};
