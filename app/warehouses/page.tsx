"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  IonBadge,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonAlert
} from '@ionic/react'
import {
  businessOutline,
  addOutline,
  locationOutline,
  cubeOutline,
  eyeOutline,
  createOutline,
  trashOutline
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
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([])
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<string | null>(null)

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

  const handleDelete = async () => {
    if (!deleteWarehouseId) return
    try {
      await fetch(`/api/warehouses/${deleteWarehouseId}`, { method: 'DELETE' })
      await fetchWarehouses()
    } catch (error) {
      console.error('Failed to delete warehouse:', error)
    }
    setDeleteWarehouseId(null)
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

          {/* Warehouses Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warehouse
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWarehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {warehouse.name}
                        </div>
                        {warehouse.description && (
                          <div className="text-sm text-gray-500">
                            {warehouse.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAddress(warehouse)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <IonBadge color="primary">
                          {warehouse._count.assets} assets
                        </IonBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => router.push(`/warehouses/${warehouse.id}`)}
                        >
                          <IonIcon icon={eyeOutline} />
                        </IonButton>
                        {canManage && (
                          <>
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => router.push(`/warehouses/${warehouse.id}/edit`)}
                            >
                              <IonIcon icon={createOutline} />
                            </IonButton>
                            <IonButton
                              fill="clear"
                              size="small"
                              color="danger"
                              onClick={() => {
                                setDeleteWarehouseId(warehouse.id)
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
            
            {filteredWarehouses.length === 0 && !loading && (
              <div className="text-center py-8">
                <IonIcon icon={businessOutline} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-xl mb-2">No warehouses found</h2>
                <p className="text-gray-600 mb-4">
                  {searchText 
                    ? 'Try adjusting your search terms'
                    : 'No warehouses have been created yet'
                  }
                </p>
                {canManage && (
                  <IonButton onClick={() => router.push('/warehouses/create')}>
                    Create First Warehouse
                  </IonButton>
                )}
              </div>
            )}
          </div>
        </div>

        {canManage && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => router.push('/warehouses/create')}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Warehouse"
          message="Are you sure you want to delete this warehouse? This action cannot be undone."
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