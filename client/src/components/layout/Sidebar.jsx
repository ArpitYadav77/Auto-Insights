import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineChartBar,
  HiOutlineDatabase,
  HiOutlineDocumentReport,
  HiOutlineUser,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineSparkles,
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getInitials } from '../../utils/helpers'

const navItems = [
  { to: '/dashboard', icon: HiOutlineChartBar, label: 'Dashboard' },
  { to: '/datasets', icon: HiOutlineDatabase, label: 'Datasets' },
  { to: '/reports', icon: HiOutlineDocumentReport, label: 'Reports' },
  { to: '/profile', icon: HiOutlineUser, label: 'Profile' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 250 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col glass border-r border-white/10"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 overflow-hidden">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-brand">
          <HiOutlineSparkles className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap"
            >
              <h1 className="text-base font-bold gradient-text leading-tight">
                Auto Insights
              </h1>
              <p className="text-[10px] text-gray-500 font-medium">AI Analytics</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to))

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 relative overflow-hidden
                ${
                  isActive
                    ? 'bg-brand-500/15 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-brand-400 to-accent-500"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                />
              )}

              <item.icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-dark-600 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/10 p-2 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          {isDark ? (
            <HiOutlineSun className="w-5 h-5 flex-shrink-0 text-amber-400" />
          ) : (
            <HiOutlineMoon className="w-5 h-5 flex-shrink-0 text-brand-400" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
            {getInitials(user?.name)}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {user?.email || 'user@email.com'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          {collapsed ? (
            <HiOutlineChevronRight className="w-4 h-4" />
          ) : (
            <HiOutlineChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
