import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineExclamation, HiOutlineTrendingUp, HiOutlineLightBulb, HiOutlineDocumentReport } from 'react-icons/hi'
import { generateInsights } from '../api/analysis'
import { generateReport } from '../api/reports'
import { getDatasetById } from '../api/datasets'
import InsightCard from '../components/cards/InsightCard'
import Button from '../components/common/Button'
import { Spinner, Skeleton } from '../components/common/Loader'
import toast from 'react-hot-toast'

export default function InsightsPage() {
  const { datasetId } = useParams()
  const navigate = useNavigate()
  const [dataset, setDataset] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [dsLoading, setDsLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDatasetById(datasetId)
        const payload = res.data?.data || res.data
        setDataset(payload?.dataset || payload)
      } catch { /* silent */ }
      setDsLoading(false)
    }
    fetch()
  }, [datasetId])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await generateInsights(datasetId)
      const payload = res.data?.data || res.data
      setInsights(payload?.insights || payload)
      toast.success('Insights generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to generate insights') }
    setLoading(false)
  }

  const handleGenerateReport = async () => {
    setReportLoading(true)
    try {
      const res = await generateReport(datasetId)
      const payload = res.data?.data || res.data
      const reportId = payload?.report?._id || payload?._id
      toast.success('Report generated!')
      if (reportId) navigate(`/reports/${reportId}`)
      else navigate('/reports')
    } catch (e) { toast.error(e.response?.data?.message || 'Report generation failed') }
    setReportLoading(false)
  }

  const summary = insights?.summary || insights?.profile?.summary || ''
  const findings = insights?.findings || insights?.insights || []
  const risks = insights?.risks || []
  const opportunities = insights?.opportunities || []
  const recommendations = insights?.recommendations || []

  if (dsLoading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-gray-400 text-sm mt-1">{dataset?.originalName || 'Dataset'}</p>
        </div>
        <Button variant="primary" onClick={handleGenerate} loading={loading} icon={<HiOutlineSparkles />}>
          {insights ? 'Regenerate' : 'Generate'} Insights
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
        </div>
      )}

      {insights && (
        <>
          {/* Executive Summary */}
          {summary && (
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent border border-indigo-500/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineSparkles className="text-indigo-400 text-xl" />
                  <h2 className="text-lg font-semibold text-white">Executive Summary</h2>
                </div>
                <p className="text-gray-300 leading-relaxed">{summary}</p>
              </div>
            </div>
          )}

          {/* Key Findings */}
          {findings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineLightBulb className="text-blue-400" /> Key Findings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {findings.map((f, i) => (
                  <InsightCard key={i} title={f.title || `Finding ${i + 1}`} description={f.description || (typeof f === 'string' ? f : JSON.stringify(f))} type="finding" severity={f.severity || 'medium'} />
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {risks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineExclamation className="text-rose-400" /> Risks</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {risks.map((r, i) => (
                  <InsightCard key={i} title={typeof r === 'string' ? r : r.title || `Risk ${i + 1}`} description={typeof r === 'string' ? '' : r.description || ''} type="risk" severity="high" />
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {opportunities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineTrendingUp className="text-emerald-400" /> Opportunities</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {opportunities.map((o, i) => (
                  <InsightCard key={i} title={typeof o === 'string' ? o : o.title || `Opportunity ${i + 1}`} description={typeof o === 'string' ? '' : o.description || ''} type="opportunity" severity="medium" />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineLightBulb className="text-amber-400" /> Recommendations</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.map((r, i) => (
                  <InsightCard key={i} title={typeof r === 'string' ? r : r.title || `Recommendation ${i + 1}`} description={typeof r === 'string' ? '' : r.description || ''} type="recommendation" severity="medium" />
                ))}
              </div>
            </div>
          )}

          {/* Generate Report CTA */}
          <div className="glass rounded-2xl p-8 text-center border border-white/5">
            <HiOutlineDocumentReport className="text-4xl text-indigo-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate a Report?</h3>
            <p className="text-gray-400 text-sm mb-4">Compile all insights, charts, and recommendations into a downloadable PDF.</p>
            <Button variant="primary" onClick={handleGenerateReport} loading={reportLoading} icon={<HiOutlineDocumentReport />}>Generate Executive Report</Button>
          </div>
        </>
      )}

      {!insights && !loading && (
        <div className="glass rounded-2xl p-16 text-center border border-white/5">
          <HiOutlineSparkles className="text-5xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg text-gray-300 mb-2">No insights generated yet</h3>
          <p className="text-gray-500 text-sm">Click the button above to let AI analyze your dataset and generate actionable insights.</p>
        </div>
      )}
    </motion.div>
  )
}
