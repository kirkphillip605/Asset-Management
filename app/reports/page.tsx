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
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonList
} from '@ionic/react'
import {
  documentTextOutline,
  cubeOutline,
  calendarOutline,
  peopleOutline,
  barChartOutline,
  timeOutline,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface ReportData {
  overview: {
    totalAssets: number
    availableAssets: number
    assetsInUse: number
    totalGigs: number
    activeGigs: number
    totalUsers: number
  }
  assetsByCondition: { [key: string]: number }
  assetsByStatus: { [key: string]: number }
  gigsByMonth: { month: string; count: number }[]
  topAssets: { name: string; usageCount: number }[]
  userActivity: { name: string; lastLogin: string; gigCount: number }[]
  recentActivity: { type: string; description: string; timestamp: string }[]
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [activeSegment, setActiveSegment] = useState<string>('overview')
  const [loading, setLoading] = useState(true)

  const userRole = session?.user?.role || 'User'
  const canViewReports = ['Admin', 'Manager'].includes(userRole)

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/reports')
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (canViewReports) {
      fetchReportData()
    }
  }, [canViewReports])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchReportData()
    event.detail.complete()
  }

  if (!canViewReports) {
    return (
      <IonPage id="main-content">
        <Header title="Reports" />
        <Sidebar />
        <IonContent className="ion-padding">
          <div className="flex items-center justify-center min-h-screen">
            <IonCard className="max-w-md">
              <IonCardContent className="text-center p-8">
                <IonIcon icon={alertCircleOutline} className="text-6xl text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
                <p className="text-gray-600">You need manager or admin privileges to view reports.</p>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage id="main-content">
      <Header title="Reports" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <IonSegment
            value={activeSegment}
            onIonChange={(e) => setActiveSegment(e.detail.value as string)}
            className="mb-4"
          >
            <IonSegmentButton value="overview">
              <IonLabel>Overview</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="assets">
              <IonLabel>Assets</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="gigs">
              <IonLabel>Gigs</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="users">
              <IonLabel>Users</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {activeSegment === 'overview' && reportData && (
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <IonCard>
                    <IonCardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Total Assets</h3>
                          <p className="text-3xl font-bold mt-2">{reportData.overview.totalAssets}</p>
                        </div>
                        <IonIcon icon={cubeOutline} className="text-4xl text-primary" />
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <IonCard>
                    <IonCardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Available</h3>
                          <p className="text-3xl font-bold mt-2">{reportData.overview.availableAssets}</p>
                        </div>
                        <IonIcon icon={checkmarkCircleOutline} className="text-4xl text-success" />
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <IonCard>
                    <IonCardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Active Gigs</h3>
                          <p className="text-3xl font-bold mt-2">{reportData.overview.activeGigs}</p>
                        </div>
                        <IonIcon icon={calendarOutline} className="text-4xl text-warning" />
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                
                {userRole === 'Admin' && (
                  <IonCol size="12" sizeMd="6" sizeLg="3">
                    <IonCard>
                      <IonCardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">Total Users</h3>
                            <p className="text-3xl font-bold mt-2">{reportData.overview.totalUsers}</p>
                          </div>
                          <IonIcon icon={peopleOutline} className="text-4xl text-secondary" />
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                )}
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Recent Activity</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {reportData.recentActivity.map((activity, index) => (
                          <IonItem key={index}>
                            <IonIcon 
                              icon={activity.type === 'asset' ? cubeOutline : calendarOutline} 
                              slot="start" 
                            />
                            <IonLabel>
                              <h3>{activity.description}</h3>
                              <p>{new Date(activity.timestamp).toLocaleString()}</p>
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          {activeSegment === 'assets' && reportData && (
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Assets by Status</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {Object.entries(reportData.assetsByStatus).map(([status, count]) => (
                        <IonItem key={status}>
                          <IonLabel>
                            <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                          </IonLabel>
                          <IonBadge slot="end">{count}</IonBadge>
                        </IonItem>
                      ))}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                
                <IonCol size="12" sizeMd="6">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Assets by Condition</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {Object.entries(reportData.assetsByCondition).map(([condition, count]) => (
                        <IonItem key={condition}>
                          <IonLabel>
                            <h3>{condition.charAt(0).toUpperCase() + condition.slice(1)}</h3>
                          </IonLabel>
                          <IonBadge slot="end">{count}</IonBadge>
                        </IonItem>
                      ))}
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Most Used Assets</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {reportData.topAssets.map((asset, index) => (
                          <IonItem key={index}>
                            <IonIcon icon={cubeOutline} slot="start" />
                            <IonLabel>
                              <h3>{asset.name}</h3>
                              <p>Used in {asset.usageCount} gigs</p>
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          {activeSegment === 'gigs' && reportData && (
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Gigs by Month</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {reportData.gigsByMonth.map((month, index) => (
                          <IonItem key={index}>
                            <IonIcon icon={calendarOutline} slot="start" />
                            <IonLabel>
                              <h3>{month.month}</h3>
                            </IonLabel>
                            <IonBadge slot="end">{month.count}</IonBadge>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          {activeSegment === 'users' && reportData && userRole === 'Admin' && (
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>User Activity</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {reportData.userActivity.map((user, index) => (
                          <IonItem key={index}>
                            <IonIcon icon={peopleOutline} slot="start" />
                            <IonLabel>
                              <h3>{user.name || 'Unknown User'}</h3>
                              <p>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                              <p>Assigned to {user.gigCount} gigs</p>
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          {!reportData && !loading && (
            <IonCard>
              <IonCardContent className="text-center py-8">
                <IonIcon icon={documentTextOutline} className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-xl mb-2">No report data available</h2>
                <p className="text-gray-600">Unable to load reporting data at this time.</p>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}