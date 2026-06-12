import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineTable,
} from 'react-icons/hi'
import { formatDate, formatNumber } from '../../utils/helpers'
import { getStatusColor } from '../../utils/helpers'

export default function DatasetCard({ dataset, onDelete, delay = 0 }) {
  const navigate = useNavigate()
  const status = getStatusColor(dataset?.status)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08 }}
      className="glass-card p-5 card-hover group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15">
            <HiOutlineDocumentText className="w-5 h-5 text-brand-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {dataset?.originalName || 'Untitled Dataset'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDate(dataset?.uploadedAt || dataset?.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`badge ${status.bg} ${status.text} capitalize flex-shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
          {dataset?.status || 'uploaded'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <HiOutlineTable className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] text-gray-500 font-medium">Rows</span>
          </div>
          <p className="text-sm font-bold text-white">
            {formatNumber(dataset?.rows || 0)}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <HiOutlineTable className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[11px] text-gray-500 font-medium">Columns</span>
          </div>
          <p className="text-sm font-bold text-white">
            {formatNumber(dataset?.columns || 0)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <button
          onClick={() => navigate(`/analysis/${dataset?._id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 rounded-lg transition-all duration-200"
        >
          <HiOutlineEye className="w-3.5 h-3.5" />
          View
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(dataset?._id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-all duration-200"
          >
            <HiOutlineTrash className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </motion.div>
  )
}
