import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { store } from './store'
import { setupAxiosInterceptors } from './utils/setupAxiosInterceptors'
import './assets/styles/index.scss'
import App from './App.tsx'

setupAxiosInterceptors();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'missing-google-client-id'}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
