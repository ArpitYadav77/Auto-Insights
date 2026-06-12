import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineMenu,
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/datasets': 'Datasets',
  '/reports': 'Reports',
  '/profile': 'Profile',
}

function getPageTitle(pathname) {
  if (pathname.startsWith('/analysis/')) return 'Analysis'
  if (pathname.startsWith('/insights/')) return 'Insights'
  if (pathname.startsWith('/reports/') && pathname !== '/reports') return 'Report Detail'
  return pageTitles[pathname] || 'Dashboard'
}

export default function Navbar({ onMobileMenuToggle }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  const pageTitle = getPageTitle(location.pathname)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <HiOutlineMenu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
          <div className="relative w-full">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search datasets, reports..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200">
            <HiOutlineBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-dark-900" />
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user?.name)}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-300">
                {user?.name || 'User'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 glass-strong rounded-xl shadow-2xl shadow-black/50 border border-white/10 py-1.5 animate-slide-down">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      navigate('/profile')
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <HiOutlineUser className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      navigate('/profile')
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <HiOutlineCog className="w-4 h-4" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-white/10 pt-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      logout()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
