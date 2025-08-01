"use client"

import { useSession } from 'next-auth/react'
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonMenuButton,
  IonButtons,
  IonBadge,
  IonIcon
} from '@ionic/react'
import { notificationsOutline } from 'ionicons/icons'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          <IonBadge color="danger">3</IonBadge>
          <IonIcon icon={notificationsOutline} className="ml-2" />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}