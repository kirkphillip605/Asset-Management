"use client"

import { useState } from 'react'
import { BarcodeScanner } from '@capacitor/barcode-scanner'
import {
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonAlert
} from '@ionic/react'
import { scanOutline, closeOutline } from 'ionicons/icons'

interface BarcodeScannerProps {
  onScan: (result: string) => void
  isOpen: boolean
  onClose: () => void
}

export function IonicBarcodeScanner({ onScan, isOpen, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  const startScan = async () => {
    try {
      // Check permissions
      const status = await BarcodeScanner.checkPermission({ force: true })
      
      if (status.granted) {
        setIsScanning(true)
        BarcodeScanner.hideBackground()
        
        const result = await BarcodeScanner.startScan()
        
        if (result.hasContent) {
          onScan(result.content)
          onClose()
        }
      } else {
        setAlertMessage('Camera permission is required to scan barcodes')
        setShowAlert(true)
      }
    } catch (error) {
      setAlertMessage('Error starting barcode scanner')
      setShowAlert(true)
    } finally {
      setIsScanning(false)
      BarcodeScanner.showBackground()
      BarcodeScanner.stopScan()
    }
  }

  const stopScan = () => {
    BarcodeScanner.showBackground()
    BarcodeScanner.stopScan()
    setIsScanning(false)
    onClose()
  }

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Scan Asset Tag</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={stopScan}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className="flex items-center justify-center">
          {!isScanning ? (
            <div className="text-center p-8">
              <IonIcon icon={scanOutline} className="text-6xl mb-4" />
              <h2 className="text-xl mb-4">Ready to Scan</h2>
              <p className="mb-6 text-gray-600">
                Position the barcode or QR code within the camera view
              </p>
              <IonButton onClick={startScan} size="large">
                Start Scanning
              </IonButton>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="border-2 border-blue-500 border-dashed w-64 h-64 flex items-center justify-center mb-4">
                <p>Camera View</p>
              </div>
              <p className="mb-4">Scanning for barcode...</p>
              <IonButton onClick={stopScan} color="danger">
                Cancel Scan
              </IonButton>
            </div>
          )}
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Scanner Error"
        message={alertMessage}
        buttons={['OK']}
      />
    </>
  )
}