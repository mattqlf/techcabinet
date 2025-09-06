import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'lockinpls',
  description: 'Download LockinPls, an AI-powered focus tracking app',
  icons: {
    icon: '/lockinpls-favicon.ico',
    shortcut: '/lockinpls-favicon.ico',
  },
}

export default function LockinPlsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}