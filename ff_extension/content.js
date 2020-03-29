
// Find title in video page based on class
const titleClass = "title style-scope ytd-video-primary-info-renderer"
function getVideoTitle() {
  return document.getElementsByClassName(titleClass)[0].innerText;
}

// Handle response from background script
// TODO: Handle rendering of lyrics here
function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

// Handle errors from background script
function handleError(error) {
  console.log(`Error: ${error}`);
}

// Listen for messages from background script
browser.runtime.onMessage.addListener(message => {
  // Check if video changed based API's available to only background script
  if (message.videoChanged) {
    console.log("Video changed")
    // Need to wait for title to update TODO: Replace the wait with something smarter
    setTimeout(() => {
      // Send title background script
      var sending = browser.runtime.sendMessage({
        title: getVideoTitle()
      });
      // Handle response and error
      sending.then(handleResponse, handleError);  
    }, 1500);
  }
});