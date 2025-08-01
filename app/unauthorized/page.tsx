"use client"

import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/react'
import { shieldOutline } from 'ionicons/icons'

export default function UnauthorizedPage() {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="flex items-center justify-center min-h-screen">
          <IonCard className="max-w-md">
            <IonCardContent className="text-center p-8">
              <IonIcon 
                icon={shieldOutline} 
                className="text-6xl text-red-500 mb-4" 
              />
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this resource.
                Please contact your administrator if you believe this is an error.
              </p>
              <IonButton routerLink="/dashboard" expand="block">
                Go to Dashboard
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  )
}