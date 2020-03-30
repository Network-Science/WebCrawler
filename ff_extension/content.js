//
// Getters for song information
// Note: Prefer classes as IDs are not used and classes are very specific
//

// Class consts
const titleClass = "title style-scope ytd-video-primary-info-renderer"

// Find title
function getVideoTitle() {
  return document.getElementsByClassName(titleClass)[0].innerText;
}


//
// Listen for messages from background script, as only it polls for when a new video is played
// 
browser.runtime.onMessage.addListener(message => {
  // Check if video changed
  if (message.videoChanged) {
    console.log("Video changed")
    // Need to wait for title to update 
    // TODO: Replace the wait with something smarter
    setTimeout(() => {
      // Send video information back to backgroundscript
      browser.runtime.sendMessage({
        title: getVideoTitle()
      });
    }, 1500);
  }
});