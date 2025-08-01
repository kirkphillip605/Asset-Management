"use client"

import { useEffect } from 'react'

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
  useEffect(() => {
    // Dynamically import and setup Ionic only on client-side
    const setupIonic = async () => {
      if (typeof window !== 'undefined') {
        const { setupIonicReact } = await import('@ionic/react')
        setupIonicReact({
          mode: 'md', // Use Material Design mode for consistency
        })
      }
    }
    
    setupIonic()
  }, [])

  return <>{children}</>
}