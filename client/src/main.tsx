import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'

import App from './App.tsx'
import './index.css'
import { queryClient } from './common/query'
import { UserProvider } from './providers/UserProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <App />
      </UserProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
