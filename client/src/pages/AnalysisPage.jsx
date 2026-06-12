import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineChartBar, HiOutlineLightBulb, HiOutlineChartPie, HiOutlineCode, HiOutlineDatabase } from 'react-icons/hi'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getDatasetById } from '../api/datasets'
import { profileDataset, generateHypotheses, generateInsights, generateSQL, generateCode, executeCode } from '../api/analysis'
import KPICard from '../components/cards/KPICard'
import HistogramChart from '../components/charts/HistogramChart'
import BoxPlotChart from '../components/charts/BoxPlotChart'
import CorrelationMatrix from '../components/charts/CorrelationMatrix'
import CategoryChart from '../components/charts/CategoryChart'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { Spinner, Skeleton } from '../components/common/Loader'
import { formatNumber, formatPercentage, copyToClipboard } from '../utils/helpers'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'profile', label: 'Profile', icon: HiOutlineChartBar },
  { id: 'hypotheses', label: 'Hypotheses', icon: HiOutlineLightBulb },
  { id: 'eda', label: 'EDA', icon: HiOutlineChartPie },
  { id: 'code', label: 'Code', icon: HiOutlineCode },
  { id: 'sql', label: 'SQL', icon: HiOutlineDatabase },
]

export default function AnalysisPage() {
  const { datasetId } = useParams()
  const [activeTab, setActiveTab] = useState('profile')
  const [dataset, setDataset] = useState(null)
  const [loadingDS, setLoadingDS] = useState(true)

  // Tab states
  const [profileData, setProfileData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [hypotheses, setHypotheses] = useState(null)
  const [hypoLoading, setHypoLoading] = useState(false)
  const [edaData, setEdaData] = useState(null)
  const [edaLoading, setEdaLoading] = useState(false)
  const [codeQuestion, setCodeQuestion] = useState('')
  const [generatedCode, setGeneratedCode] = useState(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [execResult, setExecResult] = useState(null)
  const [execLoading, setExecLoading] = useState(false)
  const [sqlQueries, setSqlQueries] = useState(null)
  const [sqlLoading, setSqlLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDatasetById(datasetId)
        const payload = res.data?.data || res.data
        const ds = payload?.dataset || payload
        setDataset(ds)
        if (ds?.profileData) setProfileData(ds.profileData)
      } catch { toast.error('Failed to load dataset') }
      setLoadingDS(false)
    }
    fetch()
  }, [datasetId])

  const handleProfile = async () => {
    setProfileLoading(true)
    try {
      const res = await profileDataset(datasetId)
      const payload = res.data?.data || res.data
      const data = payload?.profileData || payload?.profile || payload
      setProfileData(data)
      toast.success('Profiling complete!')
    } catch (e) { toast.error(e.response?.data?.message || 'Profiling failed') }
    setProfileLoading(false)
  }

  const handleHypotheses = async () => {
    setHypoLoading(true)
    try {
      const res = await generateHypotheses(datasetId)
      const payload = res.data?.data || res.data
      setHypotheses(payload?.hypotheses || payload)
      toast.success('Hypotheses generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to generate hypotheses') }
    setHypoLoading(false)
  }

  const handleEDA = async () => {
    setEdaLoading(true)
    try {
      const res = await generateInsights(datasetId)
      const payload = res.data?.data || res.data
      setEdaData(payload?.insights || payload)
      toast.success('EDA complete!')
    } catch (e) { toast.error(e.response?.data?.message || 'EDA failed') }
    setEdaLoading(false)
  }

  const handleGenerateCode = async () => {
    if (!codeQuestion.trim()) { toast.error('Enter a question'); return }
    setCodeLoading(true)
    try {
      const res = await generateCode(datasetId, codeQuestion)
      const payload = res.data?.data || res.data
      setGeneratedCode(payload)
      toast.success('Code generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'Code generation failed') }
    setCodeLoading(false)
  }

  const handleExecuteCode = async () => {
    const code = typeof generatedCode === 'string' ? generatedCode : generatedCode?.code
    if (!code) return
    setExecLoading(true)
    try {
      const res = await executeCode(datasetId, code)
      const payload = res.data?.data || res.data
      setExecResult(payload?.result || payload)
      toast.success('Code executed!')
    } catch (e) { toast.error(e.response?.data?.message || 'Execution failed') }
    setExecLoading(false)
  }

  const handleSQL = async () => {
    setSqlLoading(true)
    try {
      const res = await generateSQL(datasetId)
      const payload = res.data?.data || res.data
      setSqlQueries(payload?.queries || payload)
      toast.success('SQL queries generated!')
    } catch (e) { toast.error(e.response?.data?.message || 'SQL generation failed') }
    setSqlLoading(false)
  }

  if (loadingDS) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const overview = profileData?.overview || profileData?.profile?.overview

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{dataset?.originalName || 'Dataset Analysis'}</h1>
        <p className="text-gray-400 text-sm mt-1">{dataset?.rows?.toLocaleString() || '?'} rows × {dataset?.columns || '?'} columns</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeTab === t.id ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <t.icon className="text-lg" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {!profileData && (
                <Button variant="primary" onClick={handleProfile} loading={profileLoading} icon={<HiOutlineChartBar />}>Run Profiling</Button>
              )}
              {profileLoading && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>}
              {overview && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KPICard title="Rows" value={formatNumber(overview.rowCount)} color="indigo" icon={<HiOutlineDatabase />} />
                    <KPICard title="Columns" value={overview.columnCount} color="violet" icon={<HiOutlineChartBar />} />
                    <KPICard title="Missing %" value={formatPercentage(overview.missingPercentage)} color="amber" icon={<HiOutlineLightBulb />} />
                    <KPICard title="Duplicates" value={overview.duplicateRows} color="rose" icon={<HiOutlineChartPie />} />
                  </div>
                  {/* Column Details Table */}
                  {(profileData?.columns || profileData?.profile?.columns) && (
                    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                      <div className="p-4 border-b border-white/5"><h3 className="font-semibold text-white">Column Details</h3></div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-gray-400 text-xs uppercase bg-white/[0.02]">
                            <tr>{['Column', 'Type', 'Missing', 'Unique', 'Mean/Mode'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {Object.entries(profileData?.columns || profileData?.profile?.columns || {}).map(([col, info]) => (
                              <tr key={col} className="border-t border-white/5 hover:bg-white/[0.02]">
                                <td className="px-4 py-3 text-white font-medium">{col}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${info.type === 'numeric' ? 'bg-indigo-500/20 text-indigo-300' : info.type === 'datetime' ? 'bg-amber-500/20 text-amber-300' : 'bg-violet-500/20 text-violet-300'}`}>{info.type}</span></td>
                                <td className="px-4 py-3 text-gray-300">{info.missingCount} ({formatPercentage(info.missingPercentage)})</td>
                                <td className="px-4 py-3 text-gray-300">{info.uniqueCount}</td>
                                <td className="px-4 py-3 text-gray-300">{info.type === 'numeric' ? formatNumber(info.mean) : info.mode || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* HYPOTHESES TAB */}
          {activeTab === 'hypotheses' && (
            <div className="space-y-6">
              <Button variant="primary" onClick={handleHypotheses} loading={hypoLoading} icon={<HiOutlineLightBulb />}>
                {hypotheses ? 'Regenerate' : 'Generate'} Hypotheses
              </Button>
              {hypoLoading && <div className="grid gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>}
              {hypotheses && (
                <div className="grid gap-4">
                  {(Array.isArray(hypotheses) ? hypotheses : hypotheses?.hypotheses || []).map((h, i) => (
                    <div key={i} className="glass rounded-xl p-5 border border-white/5 hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">{i + 1}</span>
                        <div>
                          <p className="text-white font-medium">{h.hypothesis}</p>
                          {h.kpi && <p className="text-indigo-400 text-sm mt-2">📊 KPI: {h.kpi}</p>}
                          {h.analysis && <p className="text-gray-400 text-sm mt-1">🔬 Analysis: {h.analysis}</p>}
                          {h.businessQuestion && <p className="text-amber-400/80 text-sm mt-1">❓ {h.businessQuestion}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDA TAB */}
          {activeTab === 'eda' && (
            <div className="space-y-6">
              <Button variant="primary" onClick={handleEDA} loading={edaLoading} icon={<HiOutlineChartPie />}>
                {edaData ? 'Refresh' : 'Generate'} EDA
              </Button>
              {edaLoading && <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>}
              {edaData && (
                <div className="grid md:grid-cols-2 gap-6">
                  {(edaData.findings || edaData.insights || []).slice(0, 4).map((item, i) => (
                    <div key={i} className="glass rounded-2xl p-6 border border-white/5">
                      <h4 className="text-white font-medium mb-2">{item.title || `Insight ${i + 1}`}</h4>
                      <p className="text-gray-400 text-sm">{item.description || JSON.stringify(item)}</p>
                    </div>
                  ))}
                  {profileData?.correlations && (
                    <div className="md:col-span-2 glass rounded-2xl p-6 border border-white/5">
                      <h4 className="text-white font-medium mb-4">Correlation Matrix</h4>
                      <CorrelationMatrix data={profileData.correlations.matrix} columns={profileData.correlations.columns} />
                    </div>
                  )}
                </div>
              )}
              {!edaData && profileData && (
                <div className="grid md:grid-cols-2 gap-6">
                  {profileData?.correlations && (
                    <div className="md:col-span-2 glass rounded-2xl p-6 border border-white/5">
                      <h4 className="text-white font-medium mb-4">Correlation Matrix</h4>
                      <CorrelationMatrix data={profileData.correlations.matrix} columns={profileData.correlations.columns} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CODE TAB */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input placeholder="e.g., Find top 10 customers by revenue" value={codeQuestion} onChange={e => setCodeQuestion(e.target.value)} />
                </div>
                <Button variant="primary" onClick={handleGenerateCode} loading={codeLoading} icon={<HiOutlineCode />}>Generate</Button>
              </div>
              {generatedCode && (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <h4 className="text-white font-medium text-sm">{generatedCode.title || 'Generated Code'}</h4>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { copyToClipboard(typeof generatedCode === 'string' ? generatedCode : generatedCode.code); toast.success('Copied!') }}>Copy</Button>
                      <Button variant="primary" size="sm" onClick={handleExecuteCode} loading={execLoading}>Execute</Button>
                    </div>
                  </div>
                  <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }} showLineNumbers>
                    {typeof generatedCode === 'string' ? generatedCode : generatedCode.code || ''}
                  </SyntaxHighlighter>
                  {generatedCode.explanation && <p className="px-4 py-3 text-gray-400 text-sm border-t border-white/5">{generatedCode.explanation}</p>}
                </div>
              )}
              {execResult && (
                <div className="glass rounded-2xl p-5 border border-white/5">
                  <h4 className="text-white font-medium mb-3">Execution Result</h4>
                  {execResult.success ? (
                    <pre className="text-gray-300 text-sm bg-black/30 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">{execResult.output || 'No output'}</pre>
                  ) : (
                    <pre className="text-rose-400 text-sm bg-rose-500/10 rounded-lg p-4 overflow-x-auto">{execResult.error}</pre>
                  )}
                  {execResult.tables?.map((t, i) => (
                    <div key={i} className="mt-4 overflow-x-auto">
                      <p className="text-gray-300 text-sm font-medium mb-2">{t.name}</p>
                      <table className="w-full text-sm text-left">
                        <thead><tr>{t.columns?.map(c => <th key={c} className="px-3 py-2 text-gray-400 bg-white/[0.02]">{c}</th>)}</tr></thead>
                        <tbody>{t.data?.slice(0, 20).map((row, ri) => (
                          <tr key={ri} className="border-t border-white/5">{row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-gray-300">{String(cell)}</td>)}</tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SQL TAB */}
          {activeTab === 'sql' && (
            <div className="space-y-6">
              <Button variant="primary" onClick={handleSQL} loading={sqlLoading} icon={<HiOutlineDatabase />}>
                {sqlQueries ? 'Regenerate' : 'Generate'} SQL Queries
              </Button>
              {sqlLoading && <div className="grid gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>}
              {sqlQueries && (
                <div className="grid gap-4">
                  {(Array.isArray(sqlQueries) ? sqlQueries : sqlQueries?.queries || []).map((q, i) => (
                    <div key={i} className="glass rounded-xl border border-white/5 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                        <h4 className="text-white font-medium text-sm">{q.title}</h4>
                        <Button variant="ghost" size="sm" onClick={() => { copyToClipboard(q.query); toast.success('SQL copied!') }}>Copy</Button>
                      </div>
                      <SyntaxHighlighter language="sql" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }}>
                        {q.query}
                      </SyntaxHighlighter>
                      {q.description && <p className="px-4 py-2 text-gray-400 text-xs border-t border-white/5">{q.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
