import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineCheck, HiOutlineX } from 'react-icons/hi'
import { uploadDataset, getDatasets, deleteDataset } from '../api/datasets'
import DatasetCard from '../components/cards/DatasetCard'
import Button from '../components/common/Button'
import { Skeleton } from '../components/common/Loader'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants'
import { formatFileSize } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function DatasetUploadPage() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const navigate = useNavigate()

  const fetchDatasets = async () => {
    try {
      const res = await getDatasets()
      const payload = res.data?.data || res.data
      setDatasets(payload?.datasets || payload || [])
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { fetchDatasets() }, [])

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      toast.error(err?.code === 'file-too-large' ? 'File is too large (max 50MB)' : 'Only CSV and XLSX files are accepted')
      return
    }
    if (accepted.length > 0) setSelectedFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      await uploadDataset(formData, (p) => setUploadProgress(p))
      toast.success('Dataset uploaded successfully!')
      setSelectedFile(null)
      setUploadProgress(0)
      fetchDatasets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this dataset?')) return
    try {
      await deleteDataset(id)
      toast.success('Dataset deleted')
      setDatasets(datasets.filter(d => d._id !== id))
    } catch { toast.error('Delete failed') }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Upload Dataset</h1>
        <p className="text-gray-400 mt-1">Drag and drop your CSV or XLSX files for instant analysis.</p>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`glass rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.02]'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${isDragActive ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
            <HiOutlineCloudUpload className={`text-3xl transition-colors ${isDragActive ? 'text-indigo-400' : 'text-gray-400'}`} />
          </div>
          <p className="text-white font-medium mb-1">
            {isDragActive ? 'Drop your file here...' : 'Drag & drop your dataset here'}
          </p>
          <p className="text-gray-500 text-sm">or click to browse — CSV, XLSX up to 50MB</p>
        </div>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <HiOutlineDocumentText className="text-indigo-400 text-xl" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                <p className="text-gray-500 text-xs">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} icon={<HiOutlineX />}>Cancel</Button>
              <Button variant="primary" size="sm" loading={uploading} onClick={handleUpload} icon={<HiOutlineCheck />}>Upload</Button>
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Datasets List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Datasets</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : datasets.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/5">
            <HiOutlineCloudUpload className="text-4xl text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No datasets uploaded yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {datasets.map(ds => (
              <DatasetCard
                key={ds._id}
                dataset={ds}
                onView={() => navigate(`/analysis/${ds._id}`)}
                onDelete={() => handleDelete(ds._id)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
