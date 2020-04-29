// returns the fetch result of URL in document object
crawlUrl = async function(url) {
  console.log(url)
  const result = await fetch(url)
    .then(response => {
      // console.log('url', url);
      return response.text();
    })
    .then(data => {
      console.log(data)
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(data, 'text/html');
      return doc;
    });
  //return JSON.stringify(DOMtoJSON(result.body), null, ' ');
  return result;
};



//converts DOM object to JSON
DOMtoJSON = function(element) {
  let result = {};
  console.log("Hi");
  result.name = element.localName;
  result.attributes = [];
  result.children = [];
  Array.from(element.attributes).forEach(a => {
    result.attributes.push({name: a.name, value: a.value});
  });
  Array.from(element.children).forEach(c => {
    result.children.push(DOMtoJSON(c));
  });
  //console.log(result)
  return result;
};

JSONSearchForLinks = function(doc) {
  let links = []
  
}

// add google search parameter
google = function(song) {
  let url = 'https://www.google.com/search?q=';
  url += song;
  //url += '+azlyrics';
  return url;
};

// change white space of a string to '+' to allow inserting the value into the url
convertLyrics = function(title) {
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
