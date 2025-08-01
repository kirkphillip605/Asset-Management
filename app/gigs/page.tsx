"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
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
  IonList,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react'
import {
  calendarOutline,
  locationOutline,
  peopleOutline,
  addOutline,
  timeOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface Gig {
  id: string
  name: string
  startTime: string
  endTime: string
  venue?: { name: string }
  contact?: { name: string }
  _count: {
    staff: number
    assets: number
  }
}

export default function GigsPage() {
  const { data: session } = useSession()
  const [gigs, setGigs] = useState<Gig[]>([])
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role || 'User'
  const canManage = ['Admin', 'Manager'].includes(userRole)

  const fetchGigs = async () => {
    try {
      const response = await fetch('/api/gigs')
      const data = await response.json()
      setGigs(data)
      setFilteredGigs(data)
    } catch (error) {
      console.error('Failed to fetch gigs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGigs()
  }, [])

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredGigs(gigs)
    } else {
      setFilteredGigs(
        gigs.filter(gig =>
          gig.name.toLowerCase().includes(searchText.toLowerCase()) ||
          gig.venue?.name.toLowerCase().includes(searchText.toLowerCase())
        )
      )
    }
  }, [searchText, gigs])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchGigs()
    event.detail.complete()
  }

  const getGigStatus = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) return { status: 'upcoming', color: 'primary' }
    if (now >= start && now <= end) return { status: 'active', color: 'success' }
    return { status: 'completed', color: 'medium' }
  }

  return (
    <IonPage id="main-content">
      <Header title="Gigs" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search gigs..."
            className="mb-4"
          />

          <IonGrid>
            {filteredGigs.map((gig) => {
              const { status, color } = getGigStatus(gig.startTime, gig.endTime)
              
              return (
                <IonRow key={gig.id}>
                  <IonCol size="12">
                    <IonCard>
                      <IonCardHeader>
                        <div className="flex justify-between items-start">
                          <IonCardTitle>{gig.name}</IonCardTitle>
                          <IonBadge color={color}>{status}</IonBadge>
                        </div>
                      </IonCardHeader>
                      
                      <IonCardContent>
                        <IonList>
                          <IonItem>
                            <IonIcon icon={timeOutline} slot="start" />
                            <IonLabel>
                              <h3>Duration</h3>
                              <p>
                                {new Date(gig.startTime).toLocaleString()} - 
                                {new Date(gig.endTime).toLocaleString()}
                              </p>
                            </IonLabel>
                          </IonItem>
                          
                          {gig.venue && (
                            <IonItem>
                              <IonIcon icon={locationOutline} slot="start" />
                              <IonLabel>
                                <h3>Venue</h3>
                                <p>{gig.venue.name}</p>
                              </IonLabel>
                            </IonItem>
                          )}
                          
                          <IonItem>
                            <IonIcon icon={peopleOutline} slot="start" />
                            <IonLabel>
                              <h3>Staff & Assets</h3>
                              <p>{gig._count.staff} staff, {gig._count.assets} assets</p>
                            </IonLabel>
                          </IonItem>
                        </IonList>
                        
                        <div className="flex gap-2 mt-4">
                          <IonButton
                            routerLink={`/gigs/${gig.id}`}
                            fill="outline"
                            size="small"
                          >
                            View Details
                          </IonButton>
                          
                          {canManage && (
                            <IonButton
                              routerLink={`/gigs/${gig.id}/edit`}
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
              )
            })}
            
            {filteredGigs.length === 0 && !loading && (
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardContent className="text-center py-8">
                      <IonIcon icon={calendarOutline} className="text-6xl text-gray-400 mb-4" />
                      <h2 className="text-xl mb-2">No gigs found</h2>
                      <p className="text-gray-600 mb-4">
                        {searchText ? 'Try adjusting your search terms' : 'No gigs have been created yet'}
                      </p>
                      {canManage && (
                        <IonButton routerLink="/gigs/create">
                          Create First Gig
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
            <IonFabButton routerLink="/gigs/create">
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  )
}