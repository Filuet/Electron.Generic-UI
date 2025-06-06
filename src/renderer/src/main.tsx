import { createRoot } from 'react-dom/client'
import App from './App'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(<App />)
} else {
  const body = document.getElementsByTagName('body')
  const bodyElement = body[0]
  bodyElement.innerHTML = ''
  const div = document.createElement('h1')
  div.innerText = 'No root element found. Please check your HTML file.'
  bodyElement.appendChild(div)
}
