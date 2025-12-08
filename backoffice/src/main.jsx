import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './admin.css'

console.log('🚀 Backoffice starting...');

const root = document.getElementById('root');
console.log('Root element:', root);

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ React app mounted');
} else {
  console.error('❌ Root element not found!');
}
