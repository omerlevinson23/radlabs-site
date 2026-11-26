import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// Fonts are served from this site (no request to Google), Hebrew + Latin subsets only.
import '@fontsource/heebo/hebrew-400.css'
import '@fontsource/heebo/hebrew-500.css'
import '@fontsource/heebo/hebrew-600.css'
import '@fontsource/heebo/latin-400.css'
import '@fontsource/heebo/latin-500.css'
import '@fontsource/heebo/latin-600.css'
import '@fontsource/frank-ruhl-libre/hebrew-400.css'
import '@fontsource/frank-ruhl-libre/hebrew-500.css'
import '@fontsource/frank-ruhl-libre/latin-400.css'
import '@fontsource/frank-ruhl-libre/latin-500.css'
import './styles.css'
import './vendor/scrollcraft/scrollcraft.js' // scroll-craft engine, unmodified; mounted in App

createRoot(document.getElementById('root')).render(<App />)
