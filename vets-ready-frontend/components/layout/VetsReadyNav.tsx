import React from 'react'

export const VetsReadyNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Benefits', path: '/benefits' },
    { label: 'Claims', path: '/claims' },
    { label: 'Transition', path: '/transition' },
    { label: 'Finance', path: '/finance' },
    { label: 'Jobs & Business', path: '/jobs-business' },
    { label: 'Resources', path: '/resources' },
    { label: 'Partners', path: '/partners' },
  ]

  return (
    <nav className="vetsready-nav bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-blue-900">
            VR
          </div>
          <span className="text-xl font-bold">Vets Ready</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="hover:text-blue-200 transition-colors duration-200"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 hover:bg-blue-800 rounded">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
