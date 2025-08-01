"use client"

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react'
import { lockClosedOutline, mailOutline } from 'ionicons/icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setAlertMessage('Invalid credentials or account locked')
        setShowAlert(true)
      } else {
        const session = await getSession()
        // Role-based redirect
        if (session?.user.role === 'Admin') {
          router.push('/dashboard')
        } else if (session?.user.role === 'Manager') {
          router.push('/dashboard')
        } else {
          router.push('/gigs')
        }
      }
    } catch (error) {
      setAlertMessage('An error occurred during login')
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="6" sizeLg="4">
              <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <IonIcon icon={lockClosedOutline} className="text-3xl text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Asset Manager</h1>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Login</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleSubmit}>
                    <IonItem>
                      <IonIcon icon={mailOutline} slot="start" />
                      <IonLabel position="stacked">Email</IonLabel>
                      <IonInput
                        type="email"
                        value={email}
                        onIonInput={(e) => setEmail(e.detail.value!)}
                        required
                      />
                    </IonItem>

                    <IonItem>
                      <IonIcon icon={lockClosedOutline} slot="start" />
                      <IonLabel position="stacked">Password</IonLabel>
                      <IonInput
                        type="password"
                        value={password}
                        onIonInput={(e) => setPassword(e.detail.value!)}
                        required
                      />
                    </IonItem>

                    <IonButton
                      expand="block"
                      type="submit"
                      disabled={isLoading}
                      className="mt-4"
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </IonButton>
                  </form>
                </IonCardContent>
              </IonCard>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Contact your administrator for account access</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Login Failed"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  )
}