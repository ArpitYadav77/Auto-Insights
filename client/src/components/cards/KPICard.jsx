import React from 'react'
import { motion } from 'framer-motion'
import { HiArrowUp, HiArrowDown } from 'react-icons/hi'
import { formatNumber } from '../../utils/helpers'

export default function KPICard({
  title,
  value,
  change,
  changeType = 'increase',
  icon: Icon,
  color = 'brand',
  delay = 0,
}) {
  const colorMap = {
    brand: {
      iconBg: 'from-brand-500/20 to-accent-500/20',
      iconText: 'text-brand-400',
      glow: 'group-hover:shadow-brand',
    },
    emerald: {
      iconBg: 'from-emerald-500/20 to-emerald-400/20',
      iconText: 'text-emerald-400',
      glow: 'group-hover:shadow-[0_4px_30px_rgba(16,185,129,0.3)]',
    },
    amber: {
      iconBg: 'from-amber-500/20 to-amber-400/20',
      iconText: 'text-amber-400',
      glow: 'group-hover:shadow-[0_4px_30px_rgba(245,158,11,0.3)]',
    },
    rose: {
      iconBg: 'from-rose-500/20 to-rose-400/20',
      iconText: 'text-rose-400',
      glow: 'group-hover:shadow-[0_4px_30px_rgba(244,63,94,0.3)]',
    },
    violet: {
      iconBg: 'from-violet-500/20 to-violet-400/20',
      iconText: 'text-violet-400',
      glow: 'group-hover:shadow-[0_4px_30px_rgba(139,92,246,0.3)]',
    },
  }

  const colors = colorMap[color] || colorMap.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className={`group glass-card p-6 card-hover cursor-default ${colors.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {changeType === 'increase' ? (
                <div className="flex items-center gap-1 text-emerald-400">
                  <HiArrowUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">+{change}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-rose-400">
                  <HiArrowDown className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">-{change}%</span>
                </div>
              )}
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}
          >
            {React.isValidElement(Icon) ? (
              React.cloneElement(Icon, { className: `w-6 h-6 ${colors.iconText} ${Icon.props.className || ''}` })
            ) : (
              <Icon className={`w-6 h-6 ${colors.iconText}`} />
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
