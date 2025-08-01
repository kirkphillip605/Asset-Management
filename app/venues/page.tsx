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
  locationOutline,
  addOutline,
  callOutline,
  calendarOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface Venue {
  id: string
  name: string
  address1: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  _count: {
    gigs: number
  }
}

export default function VenuesPage() {
  const { data: session } = useSession()
  const [venues, setVenues] = useState<Venue[]>([])
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role || 'User'
  const canManage = ['Admin', 'Manager'].includes(userRole)

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues')
      const data = await response.json()
      setVenues(data)
      setFilteredVenues(data)
    } catch (error) {
      console.error('Failed to fetch venues:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenues()
  }, [])

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredVenues(venues)
    } else {
      setFilteredVenues(
        venues.filter(venue =>
          venue.name.toLowerCase().includes(searchText.toLowerCase()) ||
          venue.city?.toLowerCase().includes(searchText.toLowerCase()) ||
          venue.address1.toLowerCase().includes(searchText.toLowerCase())
        )
      )
    }
  }, [searchText, venues])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchVenues()
    event.detail.complete()
  }

  const formatAddress = (venue: Venue) => {
    const parts = [
      venue.address1,
      venue.address2,
      [venue.city, venue.state].filter(Boolean).join(', '),
      venue.zip
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  return (
    <IonPage id="main-content">
      <Header title="Venues" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search venues..."
            className="mb-4"
          />

          <IonGrid>
            {filteredVenues.map((venue) => (
              <IonRow key={venue.id}>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <div className="flex justify-between items-start">
                        <IonCardTitle>{venue.name}</IonCardTitle>
                        <IonBadge color="primary">
                          {venue._count.gigs} gigs
                        </IonBadge>
                      </div>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      <IonItem>
                        <IonIcon icon={locationOutline} slot="start" />
                        <IonLabel>
                          <h3>Address</h3>
                          <p>{formatAddress(venue)}</p>
                        </IonLabel>
                      </IonItem>
                      
                      {venue.phone && (
                        <IonItem button onClick={() => handleCall(venue.phone!)}>
                          <IonIcon icon={callOutline} slot="start" />
                          <IonLabel>
                            <h3>Phone</h3>
                            <p>{venue.phone}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      
                      <IonItem>
                        <IonIcon icon={calendarOutline} slot="start" />
                        <IonLabel>
                          <h3>Events</h3>
                          <p>{venue._count.gigs} gigs scheduled</p>
                        </IonLabel>
                      </IonItem>
                      
                      <div className="flex gap-2 mt-4">
                        <IonButton
                          routerLink={`/venues/${venue.id}`}
                          fill="outline"
                          size="small"
                        >
                          View Gigs
                        </IonButton>
                        
                        {canManage && (
                          <IonButton
                            routerLink={`/venues/${venue.id}/edit`}
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
            
            {filteredVenues.length === 0 && !loading && (
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardContent className="text-center py-8">
                      <IonIcon icon={locationOutline} className="text-6xl text-gray-400 mb-4" />
                      <h2 className="text-xl mb-2">No venues found</h2>
                      <p className="text-gray-600 mb-4">
                        {searchText 
                          ? 'Try adjusting your search terms'
                          : 'No venues have been created yet'
                        }
                      </p>
                      {canManage && (
                        <IonButton routerLink="/venues/create">
                          Create First Venue
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
            <IonFabButton routerLink="/venues/create">
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  )
}