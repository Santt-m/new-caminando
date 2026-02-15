import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'

import { LocalErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NetworkStatusMonitor } from '@/components/shared/NetworkStatusMonitor'
import { ToastProvider } from '@/contexts/ToastContext'
import { TourProvider } from '@/contexts/TourContext'
import { TooltipProvider } from '@/components/ui/tooltip'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TourProvider>
              <ToastProvider>
                <AuthProvider>
                  <LocalErrorBoundary>
                    <NetworkStatusMonitor />
                    <App />
                  </LocalErrorBoundary>
                </AuthProvider>
              </ToastProvider>
            </TourProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
)
