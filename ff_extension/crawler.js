crawlUrl = function(url) {
  fetch(url)
    .then(response => {
      return response.text();
    })
    .then(data => {
      console.log('this is string response.text()', data);
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(data, 'text/html');
      console.log('type of doc', typeof doc);
      console.log('this is doc', doc);
      return doc;
    });
};

google = function(song) {
  let url = 'https://www.google.com/search?q=';
  url += song;
  return url;
};

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
