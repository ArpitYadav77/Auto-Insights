import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineDatabase, HiOutlineChartBar, HiOutlineDocumentReport, HiOutlineLightningBolt, HiOutlineCloudUpload, HiOutlineEye } from 'react-icons/hi'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { getDatasets } from '../api/datasets'
import { getReports } from '../api/reports'
import KPICard from '../components/cards/KPICard'
import DatasetCard from '../components/cards/DatasetCard'
import { Skeleton } from '../components/common/Loader'
import Button from '../components/common/Button'
import { getGreeting, formatNumber } from '../utils/helpers'
import { CHART_COLORS } from '../utils/constants'

const mockActivity = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  datasets: Math.floor(Math.random() * 8) + 1,
  analyses: Math.floor(Math.random() * 12) + 2,
}))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 border border-white/10 text-xs">
      <p className="text-gray-300 font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}:</span><span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

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
          <KPICard title="Total Datasets" value={datasets.length} icon={<HiOutlineDatabase />} color="indigo" change={12} changeType="increase" />
          <KPICard title="Analyses Done" value={profiledCount} icon={<HiOutlineChartBar />} color="violet" change={8} changeType="increase" />
          <KPICard title="Reports Generated" value={reports.length} icon={<HiOutlineDocumentReport />} color="emerald" change={5} changeType="increase" />
          <KPICard title="Data Points" value={formatNumber(totalRows)} icon={<HiOutlineLightningBolt />} color="amber" change={24} changeType="increase" />
        </div>
      )}

      {/* Activity Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Activity Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockActivity}>
              <defs>
                <linearGradient id="gIndigo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gViolet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="datasets" name="Datasets" stroke={CHART_COLORS[0]} fill="url(#gIndigo)" strokeWidth={2} />
              <Area type="monotone" dataKey="analyses" name="Analyses" stroke={CHART_COLORS[1]} fill="url(#gViolet)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
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
