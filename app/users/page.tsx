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
  IonCol
} from '@ionic/react'
import {
  peopleOutline,
  addOutline,
  personOutline,
  timeOutline,
  shieldOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface User {
  id: string
  name?: string
  email?: string
  role: string
  createdAt: string
  lastLogin?: string
  isLocked: boolean
  failedLoginAttempts: number
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role || 'User'
  const isAdmin = userRole === 'Admin'

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    let filtered = users

    // Apply text search
    if (searchText.trim() !== '') {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchText, roleFilter, users])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchUsers()
    event.detail.complete()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'danger'
      case 'Manager': return 'warning'
      case 'User': return 'primary'
      default: return 'medium'
    }
  }

  const getStatusColor = (user: User) => {
    if (user.isLocked) return 'danger'
    if (user.failedLoginAttempts > 2) return 'warning'
    return 'success'
  }

  const getStatusText = (user: User) => {
    if (user.isLocked) return 'Locked'
    if (user.failedLoginAttempts > 2) return 'At Risk'
    return 'Active'
  }

  if (!isAdmin) {
    return (
      <IonPage id="main-content">
        <Header title="Users" />
        <Sidebar />
        <IonContent className="ion-padding">
          <div className="flex items-center justify-center min-h-screen">
            <IonCard className="max-w-md">
              <IonCardContent className="text-center p-8">
                <IonIcon icon={shieldOutline} className="text-6xl text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
                <p className="text-gray-600">You need admin privileges to view user management.</p>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage id="main-content">
      <Header title="Users" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search users..."
            className="mb-4"
          />

          <IonItem className="mb-4">
            <IonLabel>Filter by Role</IonLabel>
            <IonSelect
              value={roleFilter}
              onIonChange={(e) => setRoleFilter(e.detail.value)}
            >
              <IonSelectOption value="all">All Roles</IonSelectOption>
              <IonSelectOption value="Admin">Admin</IonSelectOption>
              <IonSelectOption value="Manager">Manager</IonSelectOption>
              <IonSelectOption value="User">User</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonGrid>
            {filteredUsers.map((user) => (
              <IonRow key={user.id}>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <IonCardTitle>{user.name || 'No Name'}</IonCardTitle>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <IonBadge color={getRoleColor(user.role)}>
                            {user.role}
                          </IonBadge>
                          <IonBadge color={getStatusColor(user)}>
                            {getStatusText(user)}
                          </IonBadge>
                        </div>
                      </div>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      <IonItem>
                        <IonIcon icon={personOutline} slot="start" />
                        <IonLabel>
                          <h3>Account Status</h3>
                          <p>
                            {user.isLocked 
                              ? 'Account locked' 
                              : `${user.failedLoginAttempts} failed attempts`
                            }
                          </p>
                        </IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonIcon icon={timeOutline} slot="start" />
                        <IonLabel>
                          <h3>Last Login</h3>
                          <p>
                            {user.lastLogin 
                              ? new Date(user.lastLogin).toLocaleString()
                              : 'Never logged in'
                            }
                          </p>
                        </IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonIcon icon={timeOutline} slot="start" />
                        <IonLabel>
                          <h3>Created</h3>
                          <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                        </IonLabel>
                      </IonItem>
                      
                      <div className="flex gap-2 mt-4">
                        <IonButton
                          routerLink={`/users/${user.id}`}
                          fill="outline"
                          size="small"
                        >
                          View Details
                        </IonButton>
                        
                        <IonButton
                          routerLink={`/users/${user.id}/edit`}
                          fill="clear"
                          size="small"
                        >
                          Edit
                        </IonButton>

                        {user.isLocked && (
                          <IonButton
                            color="success"
                            fill="clear"
                            size="small"
                            onClick={() => {
                              // TODO: Implement unlock user functionality
                              console.log('Unlock user:', user.id)
                            }}
                          >
                            Unlock
                          </IonButton>
                        )}
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            ))}
            
            {filteredUsers.length === 0 && !loading && (
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardContent className="text-center py-8">
                      <IonIcon icon={peopleOutline} className="text-6xl text-gray-400 mb-4" />
                      <h2 className="text-xl mb-2">No users found</h2>
                      <p className="text-gray-600 mb-4">
                        {searchText || roleFilter !== 'all'
                          ? 'Try adjusting your search terms or filters'
                          : 'No users have been created yet'
                        }
                      </p>
                      <IonButton routerLink="/users/create">
                        Create First User
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/users/create">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  )
}