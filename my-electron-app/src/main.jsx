import {StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './Components/ExcelToXMLConverter.jsx'
import ExcelToXmlConverter from './Components/ExcelToXMLConverter.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ExcelToXmlConverter />
  </StrictMode>,
)
