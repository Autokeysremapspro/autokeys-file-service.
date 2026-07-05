import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
export const metadata: Metadata = { title: 'Autokeys File Service', description: 'Portal File Service Autokeys' }
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="es"><body><Toaster position="top-right" />{children}</body></html> }
