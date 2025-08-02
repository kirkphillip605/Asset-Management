"use client"

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonAvatar,
  IonText,
  IonMenuToggle
} from '@ionic/react'
import {
  homeOutline,
  peopleOutline,
  calendarOutline,
  cubeOutline,
  businessOutline,
  locationOutline,
  personCircleOutline,
  documentTextOutline,
  logOutOutline,
  closeOutline
} from 'ionicons/icons'

const menuItems = [
  { path: '/dashboard', icon: homeOutline, label: 'Dashboard', roles: ['Admin', 'Manager', 'User'] },
  { path: '/gigs', icon: calendarOutline, label: 'Gigs', roles: ['Admin', 'Manager', 'User'] },
  { path: '/assets', icon: cubeOutline, label: 'Assets', roles: ['Admin', 'Manager', 'User'] },
  { path: '/warehouses', icon: businessOutline, label: 'Warehouses', roles: ['Admin', 'Manager'] },
  { path: '/venues', icon: locationOutline, label: 'Venues', roles: ['Admin', 'Manager'] },
  { path: '/contacts', icon: personCircleOutline, label: 'Contacts', roles: ['Admin', 'Manager'] },
  { path: '/users', icon: peopleOutline, label: 'Users', roles: ['Admin'] },
  { path: '/reports', icon: documentTextOutline, label: 'Reports', roles: ['Admin', 'Manager'] },
]

export function Sidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  const userRole = session?.user?.role || 'User'
  const allowedItems = menuItems.filter(item => item.roles.includes(userRole))

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Asset Manager</IonTitle>
          <IonMenuToggle slot="end">
            <IonButton fill="clear" color="light">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonMenuToggle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <IonAvatar>
              <img 
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1"
                alt="Profile" 
              />
            </IonAvatar>
            <div>
              <IonText className="font-semibold">
                <p>{session?.user?.name || 'User'}</p>
              </IonText>
              <IonText color="medium" className="text-sm">
                <p>{userRole}</p>
              </IonText>
            </div>
          </div>
        </div>

        <IonList>
          {allowedItems.map((item) => (
            <IonMenuToggle key={item.path} autoHide={false}>
              <IonItem
                button
                onClick={() => handleNavigation(item.path)}
                className={pathname === item.path ? 'bg-blue-50' : ''}
              >
                <IonIcon icon={item.icon} slot="start" />
                <IonLabel>{item.label}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
          
          <IonMenuToggle autoHide={false}>
            <IonItem button onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" />
              <IonLabel>Logout</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  )
}