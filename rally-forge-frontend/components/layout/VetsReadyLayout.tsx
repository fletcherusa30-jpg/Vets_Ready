import React from 'react'
import { rallyforgeNav } from './rallyforgeNav'
import { rallyforgeFooter } from './rallyforgeFooter'

interface rallyforgeLayoutProps {
  children: React.ReactNode
}

export const rallyforgeLayout: React.FC<rallyforgeLayoutProps> = ({ children }) => {
  return (
    <div className="rallyforge-layout min-h-screen flex flex-col bg-gray-50">
      <rallyforgeNav />

      <main className="flex-1 w-full">
        {children}
      </main>

      <rallyforgeFooter />
    </div>
  )
}

