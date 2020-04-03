crawlUrl = async function(url) {
  const result = await fetch(url)
    .then(response => {
      console.log('url', url);
      return response.text();
    })
    .then(data => {
      let domparser = new DOMParser();
      let doc = domparser.parseFromString(data, 'text/html');
      return doc;
    });
  return result;
};

google = function(song) {
  let url = 'https://www.google.com/search?q=';
  url += song;
  url += '+azlyrics';
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
