"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react'
import {
  cubeOutline,
  calendarOutline,
  peopleOutline,
  businessOutline,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

interface DashboardStats {
  totalAssets: number
  availableAssets: number
  activeGigs: number
  totalUsers: number
  recentActivity: any[]
  upcomingGigs: any[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    availableAssets: 0,
    activeGigs: 0,
    totalUsers: 0,
    recentActivity: [],
    upcomingGigs: []
  })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = async (event: CustomEvent) => {
    await fetchDashboardData()
    event.detail.complete()
  }

  const StatCard = ({ title, value, icon, color = "primary" }: any) => (
    <IonCard>
      <IonCardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <IonIcon icon={icon} className={`text-4xl text-${color}`} />
        </div>
      </IonCardContent>
    </IonCard>
  )

  return (
    <IonPage id="main-content">
      <Header title="Dashboard" />
      <Sidebar />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome back, {session?.user?.name}
            </h1>
            <p className="text-gray-600">Here's what's happening today</p>
          </div>

          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6" sizeLg="3">
                <StatCard
                  title="Total Assets"
                  value={stats.totalAssets}
                  icon={cubeOutline}
                  color="primary"
                />
              </IonCol>
              
              <IonCol size="12" sizeMd="6" sizeLg="3">
                <StatCard
                  title="Available Assets"
                  value={stats.availableAssets}
                  icon={checkmarkCircleOutline}
                  color="success"
                />
              </IonCol>
              
              <IonCol size="12" sizeMd="6" sizeLg="3">
                <StatCard
                  title="Active Gigs"
                  value={stats.activeGigs}
                  icon={calendarOutline}
                  color="warning"
                />
              </IonCol>
              
              {session?.user?.role === 'Admin' && (
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={peopleOutline}
                    color="secondary"
                  />
                </IonCol>
              )}
            </IonRow>

            <IonRow>
              <IonCol size="12" sizeLg="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Upcoming Gigs</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      {stats.upcomingGigs.length === 0 ? (
                        <IonItem>
                          <IonLabel>No upcoming gigs</IonLabel>
                        </IonItem>
                      ) : (
                        stats.upcomingGigs.map((gig: any) => (
                          <IonItem key={gig.id} routerLink={`/gigs/${gig.id}`}>
                            <IonIcon icon={calendarOutline} slot="start" />
                            <IonLabel>
                              <h3>{gig.name}</h3>
                              <p>{new Date(gig.startTime).toLocaleDateString()}</p>
                              <p>{gig.venue?.name || 'No venue'}</p>
                            </IonLabel>
                            <IonBadge color="primary" slot="end">
                              {gig._count?.staff || 0} staff
                            </IonBadge>
                          </IonItem>
                        ))
                      )}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeLg="6">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Recent Activity</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      {stats.recentActivity.length === 0 ? (
                        <IonItem>
                          <IonLabel>No recent activity</IonLabel>
                        </IonItem>
                      ) : (
                        stats.recentActivity.map((activity: any, index: number) => (
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
                        ))
                      )}
                    </IonList>
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