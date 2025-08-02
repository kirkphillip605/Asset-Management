"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonSpinner
} from '@ionic/react'
import {
  cubeOutline,
  pricetagOutline,
  businessOutline,
  calendarOutline,
  qrCodeOutline,
  createOutline,
  arrowBackOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface AssetDetail {
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
  createdAt: string
  product: {
    name: string
    description?: string
    modelNumber?: string
    brand?: {
      name: string
      website?: string
    }
    type?: {
      name: string
    }
  }
  warehouse: {
    name: string
    address1: string
    city?: string
    state?: string
  }
  vendor?: {
    name: string
    contactEmail?: string
    contactPhone?: string
  }
  gigAssets: {
    gig: {
      name: string
      startTime: string
      endTime: string
    }
  }[]
}

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const assetId = params.id as string
  const userRole = session?.user?.role || 'User'
  const canManage = ['Admin', 'Manager'].includes(userRole)

  const fetchAsset = async () => {
    try {
      const response = await fetch(`/api/assets/${assetId}`)
      const data = await response.json()
      setAsset(data)
    } catch (error) {
      console.error('Failed to fetch asset:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (assetId) {
      fetchAsset()
    }
  }, [assetId])

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

  if (loading) {
    return (
      <IonPage id="main-content">
        <Header title="Asset Details" />
        <Sidebar />
        <IonContent>
          <div className="flex items-center justify-center min-h-screen">
            <IonSpinner name="dots" />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (!asset) {
    return (
      <IonPage id="main-content">
        <Header title="Asset Not Found" />
        <Sidebar />
        <IonContent>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl mb-4">Asset not found</h2>
              <IonButton onClick={() => router.push('/assets')}>
                Back to Assets
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage id="main-content">
      <Header title={asset.product.name} />
      <Sidebar />
      
      <IonContent>
        <div className="p-4">
          <div className="flex items-center mb-4">
            <IonButton
              fill="clear"
              onClick={() => router.push('/assets')}
            >
              <IonIcon icon={arrowBackOutline} slot="start" />
              Back to Assets
            </IonButton>
            {canManage && (
              <IonButton
                onClick={() => router.push(`/assets/${asset.id}/edit`)}
                className="ml-auto"
              >
                <IonIcon icon={createOutline} slot="start" />
                Edit Asset
              </IonButton>
            )}
          </div>

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8">
                <IonCard>
                  <IonCardHeader>
                    <div className="flex justify-between items-start">
                      <IonCardTitle>{asset.product.name}</IonCardTitle>
                      <div className="flex flex-col gap-2">
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
                    <IonList>
                      <IonItem>
                        <IonIcon icon={pricetagOutline} slot="start" />
                        <IonLabel>
                          <h3>Asset Tag</h3>
                          <p>{asset.assetTag}</p>
                        </IonLabel>
                      </IonItem>

                      {asset.serialNumber && (
                        <IonItem>
                          <IonIcon icon={qrCodeOutline} slot="start" />
                          <IonLabel>
                            <h3>Serial Number</h3>
                            <p>{asset.serialNumber}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      <IonItem>
                        <IonIcon icon={businessOutline} slot="start" />
                        <IonLabel>
                          <h3>Location</h3>
                          <p>{asset.warehouse.name}</p>
                          {asset.location && <p className="text-sm">{asset.location}</p>}
                        </IonLabel>
                      </IonItem>

                      {asset.purchasePrice && (
                        <IonItem>
                          <IonIcon icon={calendarOutline} slot="start" />
                          <IonLabel>
                            <h3>Purchase Info</h3>
                            <p>${asset.purchasePrice.toFixed(2)}</p>
                            {asset.purchaseDate && (
                              <p className="text-sm">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                            )}
                          </IonLabel>
                        </IonItem>
                      )}

                      {asset.product.brand && (
                        <IonItem>
                          <IonIcon icon={cubeOutline} slot="start" />
                          <IonLabel>
                            <h3>Brand</h3>
                            <p>{asset.product.brand.name}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {asset.product.modelNumber && (
                        <IonItem>
                          <IonLabel>
                            <h3>Model Number</h3>
                            <p>{asset.product.modelNumber}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {asset.product.type && (
                        <IonItem>
                          <IonLabel>
                            <h3>Type</h3>
                            <p>{asset.product.type.name}</p>
                          </IonLabel>
                        </IonItem>
                      )}

                      {asset.vendor && (
                        <IonItem>
                          <IonLabel>
                            <h3>Vendor</h3>
                            <p>{asset.vendor.name}</p>
                            {asset.vendor.contactEmail && (
                              <p className="text-sm">{asset.vendor.contactEmail}</p>
                            )}
                          </IonLabel>
                        </IonItem>
                      )}

                      {asset.notes && (
                        <IonItem>
                          <IonLabel>
                            <h3>Notes</h3>
                            <p>{asset.notes}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Recent Gigs</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {asset.gigAssets.length > 0 ? (
                      <IonList>
                        {asset.gigAssets.slice(0, 5).map((gigAsset, index) => (
                          <IonItem key={index}>
                            <IonLabel>
                              <h3>{gigAsset.gig.name}</h3>
                              <p>{new Date(gigAsset.gig.startTime).toLocaleDateString()}</p>
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    ) : (
                      <p className="text-gray-600">No recent gigs</p>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  )
}