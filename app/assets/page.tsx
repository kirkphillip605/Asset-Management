"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  IonPage,
  IonContent,
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
  IonAlert,
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonLabel
} from '@ionic/react'
import {
  cubeOutline,
  addOutline,
  eyeOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface Asset {
  id: string
  assetTag: string
  serialNumber?: string
  purchaseDate?: string
  purchasePrice?: number | string
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
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null)

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

  const handleDelete = async () => {
    if (!deleteAssetId) return
    try {
      await fetch(`/api/assets/${deleteAssetId}`, { method: 'DELETE' })
      await fetchAssets()
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
    setDeleteAssetId(null)
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

  const formatPrice = (price: number | string | null | undefined) => {
    if (!price) return 'N/A'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? 'N/A' : `$${numPrice.toFixed(2)}`
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

          {/* Assets Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {asset.product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Tag: {asset.assetTag} • {asset.product.brand?.name || 'No Brand'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <IonBadge color={getStatusColor(asset.status)}>
                          {asset.status}
                        </IonBadge>
                        <br />
                        <IonBadge color={getConditionColor(asset.condition)} className="mt-1">
                          {asset.condition}
                        </IonBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.warehouse.name}
                        {asset.location && <><br /><span className="text-gray-500">{asset.location}</span></>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(asset.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => router.push(`/assets/${asset.id}`)}
                        >
                          <IonIcon icon={eyeOutline} />
                        </IonButton>
                        {canManage && (
                          <>
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => router.push(`/assets/${asset.id}/edit`)}
                            >
                              <IonIcon icon={createOutline} />
                            </IonButton>
                            <IonButton
                              fill="clear"
                              size="small"
                              color="danger"
                              onClick={() => {
                                setDeleteAssetId(asset.id)
                                setShowDeleteAlert(true)
                              }}
                            >
                              <IonIcon icon={trashOutline} />
                            </IonButton>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAssets.length === 0 && !loading && (
              <div className="text-center py-8">
                <IonIcon icon={cubeOutline} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-xl mb-2">No assets found</h2>
                <p className="text-gray-600 mb-4">
                  {searchText || statusFilter !== 'all' || conditionFilter !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'No assets have been added yet'
                  }
                </p>
                {canManage && (
                  <IonButton onClick={() => router.push('/assets/create')}>
                    Add First Asset
                  </IonButton>
                )}
              </div>
            )}
          </div>
        </div>

        {canManage && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => router.push('/assets/create')}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Asset"
          message="Are you sure you want to delete this asset? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: handleDelete
            }
          ]}
        />
      </IonContent>
    </IonPage>
  )
}