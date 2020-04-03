//
// Send message to background script to make it aware that popup is open
// Background responds with current lyrics
//

// Attempt to connect to background script
var port = browser.runtime.connect({name:"popup-port"});
// Send message to let background script know popup is ready
port.postMessage({ready: true});

// Listen to response from background script
port.onMessage.addListener(function(m) {
  console.log("Recieved lyrics")
  // Set html paragraph to contain lyrics
  document.getElementById("title").innerHTML = m.title;
  document.getElementById("lyrics").innerHTML = m.lyrics;
});
