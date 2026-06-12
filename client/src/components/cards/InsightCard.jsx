import React from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineSearchCircle,
  HiOutlineExclamationCircle,
  HiOutlineLightningBolt,
  HiOutlineLightBulb,
} from 'react-icons/hi'

const typeConfig = {
  finding: {
    borderColor: 'border-l-blue-500',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
    icon: HiOutlineSearchCircle,
    iconColor: 'text-blue-400',
    label: 'Finding',
  },
  risk: {
    borderColor: 'border-l-rose-500',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    icon: HiOutlineExclamationCircle,
    iconColor: 'text-rose-400',
    label: 'Risk',
  },
  opportunity: {
    borderColor: 'border-l-emerald-500',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    icon: HiOutlineLightningBolt,
    iconColor: 'text-emerald-400',
    label: 'Opportunity',
  },
  recommendation: {
    borderColor: 'border-l-amber-500',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    icon: HiOutlineLightBulb,
    iconColor: 'text-amber-400',
    label: 'Recommendation',
  },
}

const severityConfig = {
  high: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
}

export default function InsightCard({
  title,
  description,
  type = 'finding',
  severity = 'medium',
  delay = 0,
}) {
  const config = typeConfig[type] || typeConfig.finding
  const sevConfig = severityConfig[severity] || severityConfig.medium
  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08 }}
      className={`glass-card p-5 border-l-[3px] ${config.borderColor} card-hover`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.badgeBg} flex-shrink-0 mt-0.5`}>
          <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <span className={`badge ${config.badgeBg} ${config.badgeText}`}>
              {config.label}
            </span>
            <span className={`badge ${sevConfig.bg} ${sevConfig.text}`}>
              {severity}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
