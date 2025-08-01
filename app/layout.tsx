import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { IonicSetup } from '@/components/ionic-setup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Asset Manager - Professional Asset Management System',
  description: 'Complete asset management solution with gig scheduling, barcode scanning, and role-based access control',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <IonicSetup>
            {children}
          </IonicSetup>
        </AuthProvider>
      </body>
    </html>
  )
}