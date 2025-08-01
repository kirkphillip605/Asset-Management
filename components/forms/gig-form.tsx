"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCheckbox,
  IonList,
  IonAlert
} from '@ionic/react'

const gigSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  venueId: z.string().optional(),
  contactId: z.string().optional(),
  notes: z.string().optional(),
  staffIds: z.array(z.string()),
  assetIds: z.array(z.string()),
})

type GigFormData = z.infer<typeof gigSchema>

interface GigFormProps {
  onSubmit: (data: GigFormData) => Promise<void>
  initialData?: Partial<GigFormData>
  isLoading?: boolean
}

export function GigForm({ onSubmit, initialData, isLoading }: GigFormProps) {
  const [venues, setVenues] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<GigFormData>({
    resolver: zodResolver(gigSchema),
    defaultValues: initialData
  })

  useEffect(() => {
    // Fetch venues, contacts, users, and available assets
    Promise.all([
      fetch('/api/venues').then(res => res.json()),
      fetch('/api/contacts').then(res => res.json()),
      fetch('/api/users').then(res => res.json()),
      fetch('/api/assets?status=available').then(res => res.json())
    ]).then(([venuesData, contactsData, usersData, assetsData]) => {
      setVenues(venuesData)
      setContacts(contactsData)
      setUsers(usersData)
      setAssets(assetsData)
    })
  }, [])

  const handleFormSubmit = async (data: GigFormData) => {
    try {
      await onSubmit({
        ...data,
        staffIds: selectedStaff,
        assetIds: selectedAssets
      })
    } catch (error: any) {
      setAlertMessage(error.message || 'An error occurred')
      setShowAlert(true)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Gig Details</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Name *</IonLabel>
                    <IonInput
                      {...register('name')}
                      placeholder="Enter gig name"
                    />
                    {errors.name && (
                      <IonLabel color="danger" className="text-sm">
                        {errors.name.message}
                      </IonLabel>
                    )}
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Start Time *</IonLabel>
                    <IonDatetime
                      {...register('startTime')}
                      presentation="date-time"
                      onIonChange={(e) => setValue('startTime', e.detail.value as string)}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">End Time *</IonLabel>
                    <IonDatetime
                      {...register('endTime')}
                      presentation="date-time"
                      onIonChange={(e) => setValue('endTime', e.detail.value as string)}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Venue</IonLabel>
                    <IonSelect
                      {...register('venueId')}
                      placeholder="Select venue"
                      onIonChange={(e) => setValue('venueId', e.detail.value)}
                    >
                      {venues.map((venue) => (
                        <IonSelectOption key={venue.id} value={venue.id}>
                          {venue.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Contact</IonLabel>
                    <IonSelect
                      {...register('contactId')}
                      placeholder="Select contact"
                      onIonChange={(e) => setValue('contactId', e.detail.value)}
                    >
                      {contacts.map((contact) => (
                        <IonSelectOption key={contact.id} value={contact.id}>
                          {contact.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
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

            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Staff Assignment</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {users.map((user) => (
                      <IonItem key={user.id}>
                        <IonCheckbox
                          checked={selectedStaff.includes(user.id)}
                          onIonChange={(e) => {
                            if (e.detail.checked) {
                              setSelectedStaff([...selectedStaff, user.id])
                            } else {
                              setSelectedStaff(selectedStaff.filter(id => id !== user.id))
                            }
                          }}
                        />
                        <IonLabel className="ml-2">
                          <h3>{user.name}</h3>
                          <p>{user.role}</p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Asset Assignment</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {assets.map((asset) => (
                      <IonItem key={asset.id}>
                        <IonCheckbox
                          checked={selectedAssets.includes(asset.id)}
                          onIonChange={(e) => {
                            if (e.detail.checked) {
                              setSelectedAssets([...selectedAssets, asset.id])
                            } else {
                              setSelectedAssets(selectedAssets.filter(id => id !== asset.id))
                            }
                          }}
                        />
                        <IonLabel className="ml-2">
                          <h3>{asset.product.name}</h3>
                          <p>Tag: {asset.assetTag}</p>
                          <p>Location: {asset.warehouse.name}</p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
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
                {isLoading ? 'Saving...' : 'Save Gig'}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </form>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Error"
        message={alertMessage}
        buttons={['OK']}
      />
    </>
  )
}