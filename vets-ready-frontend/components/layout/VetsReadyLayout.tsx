import React from 'react'
import { VetsReadyNav } from './VetsReadyNav'
import { VetsReadyFooter } from './VetsReadyFooter'

interface VetsReadyLayoutProps {
  children: React.ReactNode
}

export const VetsReadyLayout: React.FC<VetsReadyLayoutProps> = ({ children }) => {
  return (
    <div className="vetsready-layout min-h-screen flex flex-col bg-gray-50">
      <VetsReadyNav />

      <main className="flex-1 w-full">
        {children}
      </main>

      <VetsReadyFooter />
    </div>
  )
}
