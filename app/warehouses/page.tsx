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
  businessOutline,
  addOutline,
  locationOutline,
  cubeOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface Warehouse {
  id: string
  name: string
  description?: string
  address1: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  _count: {
    assets: number
  }
}

export default function WarehousesPage() {
  const { data: session } = useSession()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role || 'User'
  const canManage = ['Admin', 'Manager'].includes(userRole)

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses')
      const data = await response.json()
      setWarehouses(data)
      setFilteredWarehouses(data)
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredWarehouses(warehouses)
    } else {
      setFilteredWarehouses(
        warehouses.filter(warehouse =>
          warehouse.name.toLowerCase().includes(searchText.toLowerCase()) ||
          warehouse.description?.toLowerCase().includes(searchText.toLowerCase()) ||
          warehouse.city?.toLowerCase().includes(searchText.toLowerCase())
        )
      )
    }
  }, [searchText, warehouses])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchWarehouses()
    event.detail.complete()
  }

  const formatAddress = (warehouse: Warehouse) => {
    const parts = [
      warehouse.address1,
      warehouse.address2,
      [warehouse.city, warehouse.state].filter(Boolean).join(', '),
      warehouse.zip
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  return (
    <IonPage id="main-content">
      <Header title="Warehouses" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search warehouses..."
            className="mb-4"
          />

          <IonGrid>
            {filteredWarehouses.map((warehouse) => (
              <IonRow key={warehouse.id}>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <div className="flex justify-between items-start">
                        <IonCardTitle>{warehouse.name}</IonCardTitle>
                        <IonBadge color="primary">
                          {warehouse._count.assets} assets
                        </IonBadge>
                      </div>
                      {warehouse.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {warehouse.description}
                        </p>
                      )}
                    </IonCardHeader>
                    
                    <IonCardContent>
                      <IonItem>
                        <IonIcon icon={locationOutline} slot="start" />
                        <IonLabel>
                          <h3>Address</h3>
                          <p>{formatAddress(warehouse)}</p>
                        </IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonIcon icon={cubeOutline} slot="start" />
                        <IonLabel>
                          <h3>Assets</h3>
                          <p>{warehouse._count.assets} items stored</p>
                        </IonLabel>
                      </IonItem>
                      
                      <div className="flex gap-2 mt-4">
                        <IonButton
                          routerLink={`/warehouses/${warehouse.id}`}
                          fill="outline"
                          size="small"
                        >
                          View Assets
                        </IonButton>
                        
                        {canManage && (
                          <IonButton
                            routerLink={`/warehouses/${warehouse.id}/edit`}
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
            
            {filteredWarehouses.length === 0 && !loading && (
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardContent className="text-center py-8">
                      <IonIcon icon={businessOutline} className="text-6xl text-gray-400 mb-4" />
                      <h2 className="text-xl mb-2">No warehouses found</h2>
                      <p className="text-gray-600 mb-4">
                        {searchText 
                          ? 'Try adjusting your search terms'
                          : 'No warehouses have been created yet'
                        }
                      </p>
                      {canManage && (
                        <IonButton routerLink="/warehouses/create">
                          Create First Warehouse
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
            <IonFabButton routerLink="/warehouses/create">
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  )
}