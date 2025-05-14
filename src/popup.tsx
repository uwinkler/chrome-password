import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import LoginIcon from '@mui/icons-material/Login'
import { Box, Button, Stack, TextField, Typography, IconButton } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { sha512, sha512Numeric, sha256Hex } from './crypt'
import { getDomain } from './getDomain'
import { GERMAN_DEREKO } from './lists/german-dereko'

function Popup() {
  const [currentURL, setCurrentURL] = useState<string>('')
  const [masterPassword, setMasterPassword] = useState<string>('')
  const [domainPassword, setDomainPassword] = useState<string>('')
  const [numericPassword, setNumericPassword] = useState('')
  const [sha256Password, setSha256Password] = useState('')
  const [copyStatus, setCopyStatus] = useState<{ type: 'alpha' | 'numeric' | 'sha256' | null, message: string }>({ type: null, message: '' })

  useEffect(() => {
    chrome.storage.local.get({ masterPassword: '' }, (result) => {
      setMasterPassword(result.masterPassword)
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
    chrome.storage.local.set({ masterPassword: nextPassword })
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
      sha256Hex(combinedPassword).then((sha: string) => {
        setSha256Password(sha)
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

  const handleCopy = (text: string, type: 'alpha' | 'numeric' | 'sha256') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyStatus({ type, message: 'Copied!' })
        setTimeout(() => setCopyStatus({ type: null, message: '' }), 1000)
      })
  }

  // Helper to send a password to the content script to fill fields
  const fillWithPassword = (password: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0]
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          { password },
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
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {humanReadablePassword(domainPassword)}
            <IconButton
              size="small"
              onClick={() => handleCopy(humanReadablePassword(domainPassword), 'alpha')}
              color={copyStatus.type === 'alpha' ? 'success' : 'default'}
              aria-label="Copy alpha-numeric password"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => fillWithPassword(humanReadablePassword(domainPassword))}
              aria-label="Fill with alpha-numeric password"
            >
              <LoginIcon fontSize="small" />
            </IconButton>
            {copyStatus.type === 'alpha' && (
              <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                {copyStatus.message}
              </Typography>
            )}
          </Box>

          <Typography variant="caption" sx={{ marginTop: 3 }}>
            Your numeric password for domain {currentURL}.
          </Typography>
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {formatNumericPassword(numericPassword)}
            <IconButton
              size="small"
              onClick={() => handleCopy(formatNumericPassword(numericPassword), 'numeric')}
              color={copyStatus.type === 'numeric' ? 'success' : 'default'}
              aria-label="Copy numeric password"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => fillWithPassword(formatNumericPassword(numericPassword))}
              aria-label="Fill with numeric password"
            >
              <LoginIcon fontSize="small" />
            </IconButton>
            {copyStatus.type === 'numeric' && (
              <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                {copyStatus.message}
              </Typography>
            )}
          </Box>

          <Typography variant="caption" sx={{ marginTop: 3 }}>
            Your plain SHA-256 hash for domain {currentURL} (blocks of 4).
          </Typography>
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold', mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            {formatSha256Password(sha256Password)}
            <IconButton
              size="small"
              onClick={() => handleCopy(formatSha256Password(sha256Password), 'sha256')}
              color={copyStatus.type === 'sha256' ? 'success' : 'default'}
              aria-label="Copy SHA-256 password"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => fillWithPassword(formatSha256Password(sha256Password))}
              aria-label="Fill with SHA-256 password"
            >
              <LoginIcon fontSize="small" />
            </IconButton>
            {copyStatus.type === 'sha256' && (
              <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                {copyStatus.message}
              </Typography>
            )}
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

function humanReadablePassword(hexPwd?: string) {
  if (!hexPwd) return '';
  return formatWords(formatHexString(hexPwd)) + '-' + firstNumbersInString(hexPwd)
}

function formatHexString(str?: string) {
  if (!str) return '';
  return str.replace(/([0-9a-f]{4})/g, '$1-').slice(0, 19)
}

function formatNumericPassword(str?: string) {
  if (!str) return '';
  const parts = str.match(/.{1,4}/g) as Array<string>
  return parts ? parts.slice(0, 4).join('-') : ''
}

function formatWords(hex?: string) {
  if (!hex) return '';
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

function formatSha256Password(str?: string) {
  if (!str) return ''
  const formatted = str.match(/.{1,4}/g)?.join('-') ?? ''
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('root')
)
