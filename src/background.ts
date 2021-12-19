let masterPassword = ''

function keepAlive() {
  setTimeout(keepAlive, 1000)
}

keepAlive()

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.nextPassword) {
    console.log('Old:', masterPassword)
    masterPassword = msg.nextPassword
    console.log('New:', masterPassword)
  }

  if (msg.getPassword) {
    sendResponse({ password: masterPassword })
  }
})
