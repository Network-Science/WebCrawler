//
// Send message to background script to make it aware that popup is open
// Background responds with current lyrics
////
// Send message to background script to make it aware that popup is open
// Background responds with current lyrics
//

// Attempt to connect to background script
let port = browser.runtime.connect({name:"popup-port"});
// Send message to let background script know popup is ready
port.postMessage({ready: true});

// Listen to response from background script
port.onMessage.addListener(function(m) {
  console.log("Recieved lyrics")
  // Set html paragraph to contain lyrics
  document.getElementById("artist").innerHTML = m.artist;
  document.getElementById("title").innerHTML = m.title;
  if (m.lyrics == undefined) {
    document.getElementById("lyrics").innerHTML = "No lyrics found";
  } else {
    document.getElementById("lyrics").innerHTML = m.lyrics;
  }
});
