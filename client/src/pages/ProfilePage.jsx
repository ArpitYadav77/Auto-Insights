import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineCalendar, HiOutlineDatabase, HiOutlineDocumentReport } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { API_ROUTES } from '../utils/constants'
import { getDatasets } from '../api/datasets'
import { getReports } from '../api/reports'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { getInitials, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [stats, setStats] = useState({ datasets: 0, reports: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ds, rp] = await Promise.allSettled([getDatasets(), getReports()])
        setStats({
          datasets: ds.status === 'fulfilled' ? (ds.value.data?.datasets || ds.value.data || []).length : 0,
          reports: rp.status === 'fulfilled' ? (rp.value.data?.reports || rp.value.data || []).length : 0,
        })
      } catch { /* silent */ }
    }
    fetchStats()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return }
    setSaving(true)
    try {
      const res = await api.put(API_ROUTES.AUTH.UPDATE_PROFILE, { name: form.name, email: form.email })
      updateUser(res.data?.data?.user || res.data?.user || res.data)
      toast.success('Profile updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    setSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill in all password fields'); return }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return }
    setSavingPw(true)
    try {
      await api.put(API_ROUTES.AUTH.UPDATE_PROFILE, { currentPassword: pwForm.currentPassword, password: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Password change failed') }
    setSavingPw(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account settings.</p>
      </div>

      {/* Avatar + Info */}
      <div className="glass rounded-2xl p-8 border border-white/5 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
          <span className="text-2xl font-bold text-white">{getInitials(user?.name)}</span>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 capitalize">{user?.role || 'user'}</span>
        </div>
        <div className="flex-1" />
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-xl font-bold text-white">{stats.datasets}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1"><HiOutlineDatabase /> Datasets</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.reports}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1"><HiOutlineDocumentReport /> Reports</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{formatDate(user?.createdAt, { month: 'short', year: 'numeric' })}</div>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1"><HiOutlineCalendar /> Joined</div>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input label="Full Name" icon={<HiOutlineUser />} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Email Address" type="email" icon={<HiOutlineMail />} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input label="Current Password" type="password" icon={<HiOutlineLockClosed />} value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          <Input label="New Password" type="password" icon={<HiOutlineLockClosed />} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          <Input label="Confirm New Password" type="password" icon={<HiOutlineLockClosed />} value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={savingPw}>Update Password</Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
