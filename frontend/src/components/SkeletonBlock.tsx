"use client"

import React from 'react'

interface SkeletonBlockProps {
  className?: string
  variant?: 'default' | 'cyan' | 'title' | 'chart'
  rows?: number
}

/**
 * SkeletonBlock — Shimmer loading placeholder
 * Uses the .skeleton-box animation from globals.css
 */
export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = '',
  variant = 'default',
  rows = 1,
}) => {
  if (variant === 'chart') {
    return (
      <div className={`flex flex-col gap-3 w-full ${className}`}>
        <div className="skeleton-box h-4 w-1/3 rounded" />
        <div className="skeleton-box flex-1 w-full rounded-xl" style={{ minHeight: 140 }} />
        <div className="skeleton-box h-3 w-1/4 rounded" />
      </div>
    )
  }

  if (variant === 'title') {
    return (
      <div className={`flex flex-col gap-2.5 ${className}`}>
        <div className="skeleton-box h-5 w-1/2 rounded" />
        {rows > 1 && [...Array(rows - 1)].map((_, i) => (
          <div key={i} className={`skeleton-box h-3 rounded`} style={{ width: `${70 - i * 10}%` }} />
        ))}
      </div>
    )
  }

  // default / cyan
  return (
    <div className={`${variant === 'cyan' ? 'skeleton-box-cyan' : 'skeleton-box'} ${className}`} />
  )
}

/**
 * SkeletonCard — Full card shimmer placeholder
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`glass-card rounded-2xl p-5 flex flex-col gap-4 ${className}`}>
    <div className="flex justify-between items-start">
      <div className="skeleton-box h-10 w-10 rounded-xl" />
      <div className="skeleton-box h-6 w-16 rounded-lg" />
    </div>
    <div className="skeleton-box h-3 w-20 rounded" />
    <div className="skeleton-box h-7 w-28 rounded-lg" />
  </div>
)

/**
 * SkeletonRow — Horizontal row shimmer placeholder
 */
export const SkeletonRow: React.FC<{ cols?: number; className?: string }> = ({
  cols = 3, className = ''
}) => (
  <div className={`flex items-center gap-4 py-3 ${className}`}>
    <div className="skeleton-box h-8 w-8 rounded-lg flex-shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="skeleton-box h-3 w-1/3 rounded" />
      <div className="skeleton-box h-2 w-1/2 rounded" />
    </div>
    {cols > 2 && <div className="skeleton-box h-6 w-16 rounded-lg" />}
  </div>
)
