import { Box, Button, Divider, setRef, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { getDomain } from './getDomain'
import { sha512, sha512Numeric } from './crypt'
import { GERMAN_DEREKO } from './lists/german-dereko'

function Popup() {
  const [currentURL, setCurrentURL] = useState<string>('')
  const [masterPassword, setMasterPassword] = useState<string>('')
  const [domainPassword, setDomainPassword] = useState<string>('')
  const [numericPassword, setNumericPassword] = useState('')

  useEffect(() => {
    chrome.runtime.sendMessage({ getPassword: true }, (response) => {
      setMasterPassword(response.password)
    })
  }, [])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = getDomain(tabs[0].url || '')
      setCurrentURL(url)
    })
  }, [])

  function changeMasterPassword(nextPassword: string) {
    setMasterPassword(nextPassword)
    chrome.runtime.sendMessage({
      nextPassword
    })
  }

  const combinedPassword = masterPassword + '@' + currentURL
  const showRest = masterPassword.length >= 8

  useEffect(() => {
    function generateDomainPassword() {
      sha512(combinedPassword).then((dPwd: string) => {
        setDomainPassword(dPwd)
      })
      sha512Numeric(combinedPassword).then((nPwd: string) => {
        setNumericPassword(nPwd)
      })
    }
    generateDomainPassword()
  }, [currentURL, masterPassword])

  const fillPassword = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0]
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            password: humanReadablePassword(domainPassword)
          },
          (msg) => {
            console.log('result message:', msg)
          }
        )
      }
    })
  }

  return (
    <Stack sx={{ width: 600, padding: 2 }} gap={2}>
      <TextField
        fullWidth
        autoFocus
        variant="outlined"
        label="Master Password"
        type="password"
        value={masterPassword}
        onChange={(e) => changeMasterPassword(e.target.value)}
      />
      {showRest && (
        <Stack>
          <TextField fullWidth label="Domain" value={currentURL} onChange={(e) => setCurrentURL(e.target.value)} />

          <Typography variant="caption" sx={{ marginTop: 2 }}>
            Your alpha-numeric password for domain {currentURL}.
          </Typography>
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', mt: 1, mb: 1 }}>
            {humanReadablePassword(domainPassword)}
          </Box>

          <Typography variant="caption" sx={{ marginTop: 3 }}>
            Your numeric password for domain {currentURL}.
          </Typography>
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', mt: 1, mb: 1 }}>
            {formatNumericPassword(numericPassword)}
          </Box>

          <Typography variant="caption" sx={{}}>
            Use the numeric password if input of the alpha-numeric password is complicate, e.g. TV boxes or similar
            devices.
          </Typography>
          <Button onClick={fillPassword} sx={{ mt: 2 }} variant="contained">
            Fill Password
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

function humanReadablePassword(hexPwd: string) {
  return formatWords(formatHexString(hexPwd)) + '-' + firstNumbersInString(hexPwd)
}

function formatHexString(str: string) {
  return str.replace(/([0-9a-f]{4})/g, '$1-').slice(0, 19)
}

function formatNumericPassword(str: string) {
  const parts = str.match(/.{1,4}/g) as Array<string>
  return parts.slice(0, 4).join('-')
}

function formatWords(hex: string) {
  const wordList = Object.values(GERMAN_DEREKO)

  return hex
    .split('-')
    .map((h) => {
      const number = parseInt(h, 16) % wordList.length
      return firstLetterUppercase(wordList[number])
    })
    .join('-')
}

function firstLetterUppercase(str: string = '?') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function firstNumbersInString(str: string, digits = 2) {
  return str.replace(/[a-z]/gi, '').slice(0, digits)
}

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
)
