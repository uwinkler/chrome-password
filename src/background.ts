let masterPassword = ''

chrome.storage.local.get({ masterPassword: '' }, (result) => {
  masterPassword = result.masterPassword
})

function keepAlive() {
  setTimeout(keepAlive, 1000)
}

keepAlive()

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.nextPassword) {
    console.log('Old:', masterPassword)
    masterPassword = msg.nextPassword
    chrome.storage.local.set({ masterPassword })
    console.log('New:', masterPassword)
  }

  if (msg.getPassword) {
    sendResponse({ password: masterPassword })
  }
})
