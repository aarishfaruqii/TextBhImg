import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'
import './index.css'
import { FontProvider } from './context/FontContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <FontProvider>
        <App />
      </FontProvider>
    </ChakraProvider>
  </React.StrictMode>,
)