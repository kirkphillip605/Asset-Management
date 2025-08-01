"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  IonPage,
  IonContent,
  IonSpinner
} from '@ionic/react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
    } else {
      // Role-based redirect
      if (session.user.role === 'Admin') {
        router.push('/dashboard')
      } else if (session.user.role === 'Manager') {
        router.push('/dashboard')
      } else {
        router.push('/gigs')
      }
    }
  }, [session, status, router])

  return (
    <IonPage>
      <IonContent>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <IonSpinner name="dots" className="w-12 h-12" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}