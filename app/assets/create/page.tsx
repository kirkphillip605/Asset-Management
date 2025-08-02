"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react'
import { arrowBackOutline, saveOutline } from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

const assetSchema = z.object({
  assetTag: z.string().min(1, 'Asset tag is required'),
  productId: z.string().min(1, 'Product is required'),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  vendorId: z.string().optional(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().min(1, 'Condition is required'),
  status: z.string().min(1, 'Status is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
})

type AssetFormData = z.infer<typeof assetSchema>

export default function CreateAssetPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      condition: 'good',
      status: 'available'
    }
  })

  const userRole = session?.user?.role || 'User'
  const canManage = ['Admin', 'Manager'].includes(userRole)

  useEffect(() => {
    if (!canManage) {
      router.push('/assets')
      return
    }

    // Fetch reference data
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/warehouses').then(res => res.json()),
      fetch('/api/vendors').then(res => res.json())
    ]).then(([productsData, warehousesData, vendorsData]) => {
      setProducts(productsData)
      setWarehouses(warehousesData)
      setVendors(vendorsData)
    }).catch(error => {
      console.error('Failed to fetch reference data:', error)
    })
  }, [canManage, router])

  const onSubmit = async (data: AssetFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create asset')
      }

      router.push('/assets')
    } catch (error: any) {
      setAlertMessage(error.message || 'Failed to create asset')
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (!canManage) {
    return null
  }

  return (
    <IonPage id="main-content">
      <Header title="Create Asset" />
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
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="8">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Asset Information</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonItem>
                        <IonLabel position="stacked">Asset Tag *</IonLabel>
                        <IonInput
                          {...register('assetTag')}
                          placeholder="Enter asset tag"
                        />
                        {errors.assetTag && (
                          <IonLabel color="danger" className="text-sm">
                            {errors.assetTag.message}
                          </IonLabel>
                        )}
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Product *</IonLabel>
                        <IonSelect
                          placeholder="Select product"
                          onIonChange={(e) => setValue('productId', e.detail.value)}
                        >
                          {products.map((product) => (
                            <IonSelectOption key={product.id} value={product.id}>
                              {product.name} {product.brand?.name && `- ${product.brand.name}`}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                        {errors.productId && (
                          <IonLabel color="danger" className="text-sm">
                            {errors.productId.message}
                          </IonLabel>
                        )}
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Serial Number</IonLabel>
                        <IonInput
                          {...register('serialNumber')}
                          placeholder="Enter serial number"
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Warehouse *</IonLabel>
                        <IonSelect
                          placeholder="Select warehouse"
                          onIonChange={(e) => setValue('warehouseId', e.detail.value)}
                        >
                          {warehouses.map((warehouse) => (
                            <IonSelectOption key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                        {errors.warehouseId && (
                          <IonLabel color="danger" className="text-sm">
                            {errors.warehouseId.message}
                          </IonLabel>
                        )}
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Location</IonLabel>
                        <IonInput
                          {...register('location')}
                          placeholder="e.g. Rack A1, Shelf 2"
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Status *</IonLabel>
                        <IonSelect
                          value="available"
                          onIonChange={(e) => setValue('status', e.detail.value)}
                        >
                          <IonSelectOption value="available">Available</IonSelectOption>
                          <IonSelectOption value="in-use">In Use</IonSelectOption>
                          <IonSelectOption value="maintenance">Maintenance</IonSelectOption>
                          <IonSelectOption value="retired">Retired</IonSelectOption>
                        </IonSelect>
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Condition *</IonLabel>
                        <IonSelect
                          value="good"
                          onIonChange={(e) => setValue('condition', e.detail.value)}
                        >
                          <IonSelectOption value="excellent">Excellent</IonSelectOption>
                          <IonSelectOption value="good">Good</IonSelectOption>
                          <IonSelectOption value="fair">Fair</IonSelectOption>
                          <IonSelectOption value="poor">Poor</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="4">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Purchase Information</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonItem>
                        <IonLabel position="stacked">Purchase Date</IonLabel>
                        <IonInput
                          type="date"
                          {...register('purchaseDate')}
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Purchase Price</IonLabel>
                        <IonInput
                          type="number"
                          step="0.01"
                          {...register('purchasePrice')}
                          placeholder="0.00"
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Vendor</IonLabel>
                        <IonSelect
                          placeholder="Select vendor"
                          onIonChange={(e) => setValue('vendorId', e.detail.value)}
                        >
                          {vendors.map((vendor) => (
                            <IonSelectOption key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Barcode</IonLabel>
                        <IonInput
                          {...register('barcode')}
                          placeholder="Enter barcode"
                        />
                      </IonItem>

                      <IonItem>
                        <IonLabel position="stacked">Notes</IonLabel>
                        <IonTextarea
                          {...register('notes')}
                          placeholder="Enter notes..."
                          rows={3}
                        />
                      </IonItem>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol>
                  <IonButton
                    expand="block"
                    type="submit"
                    disabled={isLoading}
                  >
                    <IonIcon icon={saveOutline} slot="start" />
                    {isLoading ? 'Creating...' : 'Create Asset'}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </form>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  )
}