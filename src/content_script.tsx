chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.password) {
    const passwordInputs = document.getElementsByTagName('input[type=password]')
    if (passwordInputs.length === 0) {
      sendResponse('No password input found')
    }

    Array.from(passwordInputs).forEach((input) => {
      ;(input as any).value = msg.password
    })
  }
})
