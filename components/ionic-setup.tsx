"use client"

import { useEffect, useState } from 'react'

// Import Ionic CSS
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

export function IonicSetup({ children }: { children: React.ReactNode }) {
  const [isIonicReady, setIsIonicReady] = useState(false)

  useEffect(() => {
    // Only setup Ionic on client-side to prevent SSR issues
    const setupIonic = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { setupIonicReact } = await import('@ionic/react')
          setupIonicReact({
            mode: 'md', // Use Material Design mode for consistency
          })
          setIsIonicReady(true)
        } catch (error) {
          console.error('Failed to setup Ionic:', error)
          setIsIonicReady(true) // Fallback to show content anyway
        }
      }
    }
    
    setupIonic()
  }, [])

  // Don't render children until Ionic is ready on client-side
  if (typeof window !== 'undefined' && !isIonicReady) {
    return <div>Loading...</div>
  }

  // On server-side, render immediately
  return <>{children}</>
}