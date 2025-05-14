chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.password) {
    const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'))
    const namedPasswordInputs = Array.from(document.querySelectorAll('input[name]')).filter(
      (input) => input.getAttribute('name')?.toLowerCase() === 'password' && (input as HTMLInputElement).type !== 'password'
    )
    const allInputs = passwordInputs.concat(namedPasswordInputs)
    if (allInputs.length === 0) {
      console.debug('[content_script] No password or named "password" input found')
      sendResponse('No password or named "password" input found')
    } else {
      allInputs.forEach((input) => {
        const el = input as HTMLInputElement
        el.value = msg.password
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      })
      console.debug(`[content_script] Filled ${allInputs.length} input field(s) (type=password or name="password") with:`, msg.password)
      sendResponse(`Filled ${allInputs.length} input field(s).`)
    }
  }
})
