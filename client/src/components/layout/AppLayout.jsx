import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-50 lg:hidden"
            >
              <Sidebar collapsed={false} onToggle={toggleMobileMenu} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
            ? sidebarCollapsed ? 72 : 250
            : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen flex flex-col"
      >
        <Navbar onMobileMenuToggle={toggleMobileMenu} />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  )
}
