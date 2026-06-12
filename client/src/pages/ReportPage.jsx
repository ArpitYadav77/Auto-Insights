import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineDocumentReport, HiOutlineDownload, HiOutlineCalendar, HiOutlineDatabase } from 'react-icons/hi'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getReports, getReportById } from '../api/reports'
import InsightCard from '../components/cards/InsightCard'
import Button from '../components/common/Button'
import { Spinner, Skeleton } from '../components/common/Loader'
import { formatDate, downloadPDF, formatNumber } from '../utils/helpers'
import toast from 'react-hot-toast'

function ReportList() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getReports()
        const payload = res.data?.data || res.data
        setReports(payload?.reports || payload || [])
      } catch { /* silent */ }
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="grid md:grid-cols-2 gap-5">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>

  if (reports.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 text-center border border-white/5">
        <HiOutlineDocumentReport className="text-5xl text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg text-gray-300 mb-2">No reports yet</h3>
        <p className="text-gray-500 text-sm mb-4">Generate reports from the Insights page after analyzing a dataset.</p>
        <Link to="/datasets"><Button variant="primary" size="sm">Upload Dataset</Button></Link>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {reports.map(r => (
        <Link key={r._id} to={`/reports/${r._id}`}>
          <div className="glass rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all card-hover cursor-pointer h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                <HiOutlineDocumentReport className="text-indigo-400 text-xl" />
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-1"><HiOutlineCalendar /> {formatDate(r.generatedAt)}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">{r.title || 'Analysis Report'}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">{r.summary ? r.summary.slice(0, 120) + '...' : 'View report details'}</p>
            <div className="flex gap-3 mt-3 text-xs text-gray-500">
              {r.insights?.length > 0 && <span>{r.insights.length} insights</span>}
              {r.recommendations?.length > 0 && <span>{r.recommendations.length} recommendations</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ReportDetail({ reportId }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getReportById(reportId)
        const payload = res.data?.data || res.data
        setReport(payload?.report || payload)
      } catch { toast.error('Failed to load report') }
      setLoading(false)
    }
    fetch()
  }, [reportId])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadPDF('report-content', `auto-insights-report-${reportId}.pdf`)
      toast.success('PDF downloaded!')
    } catch { toast.error('PDF download failed') }
    setDownloading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (!report) return <p className="text-gray-400 text-center py-20">Report not found.</p>

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link to="/reports" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">← Back to Reports</Link>
        <Button variant="primary" size="sm" onClick={handleDownload} loading={downloading} icon={<HiOutlineDownload />}>Download PDF</Button>
      </div>

      {/* Report Content */}
      <div id="report-content" className="space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <HiOutlineDocumentReport className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{report.title || 'Analysis Report'}</h1>
              <p className="text-gray-400 text-sm">Generated on {formatDate(report.generatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        {report.summary && (
          <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-600/10 to-violet-600/5 border border-indigo-500/20">
            <h2 className="text-lg font-semibold text-white mb-3">Executive Summary</h2>
            <p className="text-gray-300 leading-relaxed">{report.summary}</p>
          </div>
        )}

        {/* Insights */}
        {report.insights?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Key Insights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {report.insights.map((ins, i) => (
                <InsightCard key={i} title={ins.title} description={ins.description} type={ins.type || 'finding'} severity={ins.severity || 'medium'} />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations?.length > 0 && (
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Recommendations</h2>
            <ul className="space-y-3">
              {report.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <p className="text-gray-300 text-sm">{typeof r === 'string' ? r : r.text || JSON.stringify(r)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SQL Queries */}
        {report.sqlQueries?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">SQL Queries</h2>
            <div className="grid gap-4">
              {report.sqlQueries.map((q, i) => (
                <div key={i} className="glass rounded-xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5"><h4 className="text-white text-sm font-medium">{q.title}</h4></div>
                  <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }}>{q.query}</SyntaxHighlighter>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hypotheses */}
        {report.hypotheses?.length > 0 && (
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Business Hypotheses</h2>
            <div className="space-y-3">
              {report.hypotheses.map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{h.hypothesis}</p>
                    {h.kpi && <p className="text-indigo-400 text-xs mt-1">KPI: {h.kpi}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReportPage() {
  const { reportId } = useParams()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {!reportId && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 text-sm mt-1">View and download your generated reports.</p>
          </div>
          <ReportList />
        </>
      )}
      {reportId && <ReportDetail reportId={reportId} />}
    </motion.div>
  )
}
