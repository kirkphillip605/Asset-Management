"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonBadge,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react'
import {
  personCircleOutline,
  addOutline,
  callOutline,
  mailOutline,
  calendarOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface Contact {
  id: string
  name: string
  phone?: string
  email?: string
  notes?: string
  _count: {
    gigs: number
  }
}

export default function ContactsPage() {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role || 'User'
  const canManage = ['Admin', 'Manager'].includes(userRole)

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      setContacts(data)
      setFilteredContacts(data)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredContacts(contacts)
    } else {
      setFilteredContacts(
        contacts.filter(contact =>
          contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          contact.phone?.includes(searchText)
        )
      )
    }
  }, [searchText, contacts])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchContacts()
    event.detail.complete()
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self')
  }

  return (
    <IonPage id="main-content">
      <Header title="Contacts" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search contacts..."
            className="mb-4"
          />

          <IonGrid>
            {filteredContacts.map((contact) => (
              <IonRow key={contact.id}>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <div className="flex justify-between items-start">
                        <IonCardTitle>{contact.name}</IonCardTitle>
                        <IonBadge color="primary">
                          {contact._count.gigs} gigs
                        </IonBadge>
                      </div>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      {contact.phone && (
                        <IonItem button onClick={() => handleCall(contact.phone!)}>
                          <IonIcon icon={callOutline} slot="start" />
                          <IonLabel>
                            <h3>Phone</h3>
                            <p>{contact.phone}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      
                      {contact.email && (
                        <IonItem button onClick={() => handleEmail(contact.email!)}>
                          <IonIcon icon={mailOutline} slot="start" />
                          <IonLabel>
                            <h3>Email</h3>
                            <p>{contact.email}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      
                      <IonItem>
                        <IonIcon icon={calendarOutline} slot="start" />
                        <IonLabel>
                          <h3>Events</h3>
                          <p>{contact._count.gigs} gigs associated</p>
                        </IonLabel>
                      </IonItem>
                      
                      {contact.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <h4 className="font-semibold text-sm mb-1">Notes:</h4>
                          <p className="text-sm text-gray-600">{contact.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <IonButton
                          routerLink={`/contacts/${contact.id}`}
                          fill="outline"
                          size="small"
                        >
                          View Details
                        </IonButton>
                        
                        {canManage && (
                          <IonButton
                            routerLink={`/contacts/${contact.id}/edit`}
                            fill="clear"
                            size="small"
                          >
                            Edit
                          </IonButton>
                        )}
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            ))}
            
            {filteredContacts.length === 0 && !loading && (
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardContent className="text-center py-8">
                      <IonIcon icon={personCircleOutline} className="text-6xl text-gray-400 mb-4" />
                      <h2 className="text-xl mb-2">No contacts found</h2>
                      <p className="text-gray-600 mb-4">
                        {searchText 
                          ? 'Try adjusting your search terms'
                          : 'No contacts have been created yet'
                        }
                      </p>
                      {canManage && (
                        <IonButton routerLink="/contacts/create">
                          Create First Contact
                        </IonButton>
                      )}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        </div>

        {canManage && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton routerLink="/contacts/create">
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  )
}