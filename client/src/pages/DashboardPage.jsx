import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineDatabase, HiOutlineChartBar, HiOutlineDocumentReport, HiOutlineLightningBolt, HiOutlineCloudUpload, HiOutlineEye } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { getDatasets } from '../api/datasets'
import { getReports } from '../api/reports'
import KPICard from '../components/cards/KPICard'
import DatasetCard from '../components/cards/DatasetCard'
import { Skeleton } from '../components/common/Loader'
import Button from '../components/common/Button'
import { getGreeting, formatNumber } from '../utils/helpers'

export default function DashboardPage() {
  const { user } = useAuth()
  const [datasets, setDatasets] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dsRes, rpRes] = await Promise.allSettled([getDatasets(), getReports()])
        if (dsRes.status === 'fulfilled') {
          const payload = dsRes.value.data?.data || dsRes.value.data
          setDatasets(payload?.datasets || payload || [])
        }
        if (rpRes.status === 'fulfilled') {
          const payload = rpRes.value.data?.data || rpRes.value.data
          setReports(payload?.reports || payload || [])
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    fetch()
  }, [])

  const totalRows = datasets.reduce((s, d) => s + (d.rows || 0), 0)
  const profiledCount = datasets.filter(d => ['profiled', 'analyzed'].includes(d.status)).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {getGreeting()}, <span className="gradient-text">{user?.name || 'User'}</span>
        </h1>
        <p className="text-gray-400 mt-1">Here&apos;s what&apos;s happening with your analytics.</p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard title="Total Datasets" value={datasets.length} icon={<HiOutlineDatabase />} color="indigo" />
          <KPICard title="Analyses Done" value={profiledCount} icon={<HiOutlineChartBar />} color="violet" />
          <KPICard title="Reports Generated" value={reports.length} icon={<HiOutlineDocumentReport />} color="emerald" />
          <KPICard title="Data Points" value={formatNumber(totalRows)} icon={<HiOutlineLightningBolt />} color="amber" />
        </div>
      )}

      {/* Activity Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Activity Overview</h3>
          <div className="flex-1 flex items-center justify-center min-h-[260px] text-center">
            <p className="text-gray-400 text-sm">Activity will appear here after you run analyses.</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <Link to="/datasets">
            <Button variant="primary" className="w-full" icon={<HiOutlineCloudUpload />}>Upload Dataset</Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline" className="w-full" icon={<HiOutlineEye />}>View Reports</Button>
          </Link>
          <div className="flex-1" />
          <div className="glass-strong rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Pro Tip</p>
            <p className="text-sm text-gray-300">Upload a CSV to get instant AI-powered profiling and insights.</p>
          </div>
        </div>
      </div>

      {/* Recent Datasets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Datasets</h3>
          <Link to="/datasets" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">View All →</Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : datasets.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/5">
            <HiOutlineDatabase className="text-4xl text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No datasets yet. Upload your first one!</p>
            <Link to="/datasets"><Button variant="primary" className="mt-4" size="sm">Upload Dataset</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {datasets.slice(0, 6).map(ds => <DatasetCard key={ds._id} dataset={ds} />)}
          </div>
        )}
      </div>
    </motion.div>
  )
}
