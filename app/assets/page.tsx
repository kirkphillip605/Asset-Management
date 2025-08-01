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
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonChip
} from '@ionic/react'
import {
  cubeOutline,
  addOutline,
  qrCodeOutline,
  businessOutline,
  pricetagOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface Asset {
  id: string
  assetTag: string
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number
  barcode?: string
  notes?: string
  location?: string
  condition: string
  status: string
  product: {
    name: string
    brand?: {
      name: string
    }
    type?: {
      name: string
    }
  }
  warehouse: {
    name: string
  }
  vendor?: {
    name: string
  }
}

export default function AssetsPage() {
  const { data: session } = useSession()
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role || 'User'
  const canManage = ['Admin', 'Manager'].includes(userRole)

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      const data = await response.json()
      setAssets(data)
      setFilteredAssets(data)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    let filtered = assets

    // Apply text search
    if (searchText.trim() !== '') {
      filtered = filtered.filter(asset =>
        asset.assetTag.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.product.brand?.name.toLowerCase().includes(searchText.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter)
    }

    // Apply condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(asset => asset.condition === conditionFilter)
    }

    setFilteredAssets(filtered)
  }, [searchText, statusFilter, conditionFilter, assets])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchAssets()
    event.detail.complete()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'in-use': return 'warning'
      case 'maintenance': return 'danger'
      case 'retired': return 'medium'
      default: return 'primary'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'success'
      case 'good': return 'primary'
      case 'fair': return 'warning'
      case 'poor': return 'danger'
      default: return 'medium'
    }
  }

  return (
    <IonPage id="main-content">
      <Header title="Assets" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search assets..."
            className="mb-4"
          />

          <IonGrid className="mb-4">
            <IonRow>
              <IonCol size="6">
                <IonItem>
                  <IonLabel>Status</IonLabel>
                  <IonSelect
                    value={statusFilter}
                    onIonChange={(e) => setStatusFilter(e.detail.value)}
                  >
                    <IonSelectOption value="all">All Status</IonSelectOption>
                    <IonSelectOption value="available">Available</IonSelectOption>
                    <IonSelectOption value="in-use">In Use</IonSelectOption>
                    <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
                    <IonSelectOption value="retired">Retired</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size="6">
                <IonItem>
                  <IonLabel>Condition</IonLabel>
                  <IonSelect
                    value={conditionFilter}
                    onIonChange={(e) => setConditionFilter(e.detail.value)}
                  >
                    <IonSelectOption value="all">All Conditions</IonSelectOption>
                    <IonSelectOption value="excellent">Excellent</IonSelectOption>
                    <IonSelectOption value="good">Good</IonSelectOption>
                    <IonSelectOption value="fair">Fair</IonSelectOption>
                    <IonSelectOption value="poor">Poor</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonGrid>
            {filteredAssets.map((asset) => (
              <IonRow key={asset.id}>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <IonCardTitle>{asset.product.name}</IonCardTitle>
                          <p className="text-sm text-gray-600">
                            {asset.product.brand?.name} • {asset.product.type?.name}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <IonBadge color={getStatusColor(asset.status)}>
                            {asset.status}
                          </IonBadge>
                          <IonBadge color={getConditionColor(asset.condition)}>
                            {asset.condition}
                          </IonBadge>
                        </div>
                      </div>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <IonIcon icon={pricetagOutline} className="mr-2" />
                          <span className="font-semibold">Tag: {asset.assetTag}</span>
                        </div>
                        
                        {asset.serialNumber && (
                          <div className="flex items-center">
                            <IonIcon icon={qrCodeOutline} className="mr-2" />
                            <span>S/N: {asset.serialNumber}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <IonIcon icon={businessOutline} className="mr-2" />
                          <span>{asset.warehouse.name}</span>
                          {asset.location && <span> • {asset.location}</span>}
                        </div>
                        
                        {asset.purchasePrice && (
                          <div className="text-sm text-gray-600">
                            Purchase Price: ${asset.purchasePrice.toFixed(2)}
                          </div>
                        )}
                        
                        {asset.notes && (
                          <div className="text-sm text-gray-600">
                            Notes: {asset.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <IonButton
                          routerLink={`/assets/${asset.id}`}
                          fill="outline"
                          size="small"
                        >
                          View Details
                        </IonButton>
                        
                        {canManage && (
                          <IonButton
                            routerLink={`/assets/${asset.id}/edit`}
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
            
            {filteredAssets.length === 0 && !loading && (
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardContent className="text-center py-8">
                      <IonIcon icon={cubeOutline} className="text-6xl text-gray-400 mb-4" />
                      <h2 className="text-xl mb-2">No assets found</h2>
                      <p className="text-gray-600 mb-4">
                        {searchText || statusFilter !== 'all' || conditionFilter !== 'all'
                          ? 'Try adjusting your search terms or filters'
                          : 'No assets have been added yet'
                        }
                      </p>
                      {canManage && (
                        <IonButton routerLink="/assets/create">
                          Add First Asset
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
            <IonFabButton routerLink="/assets/create">
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  )
}