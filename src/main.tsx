import { ClerkProvider } from '@clerk/clerk-react';
import { shadcn } from '@clerk/themes';
import { enUS } from '@clerk/localizations';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={clerkPubKey} 
      appearance={{ theme: shadcn }} 
      afterSignOutUrl="/"
      localization={{
        ...enUS,
        signIn: {
          start: {
            title: 'Welcome back',
            subtitle: 'Sign in to continue your interview preparation.',
          }
        },
        signUp: {
          start: {
            title: 'Create your PrepPilot account',
            subtitle: 'Start preparing smarter today.',
          }
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)