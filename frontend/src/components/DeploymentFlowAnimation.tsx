"use client"

import React, { useEffect, useState } from 'react'
import { Package, GitBranch, Cloud, CheckCircle, Loader2 } from 'lucide-react'

interface DeploymentFlowAnimationProps {
  isActive: boolean   // true when deploying
  onComplete?: () => void
}

const STEPS = [
  { id: 'local',  label: 'Local',    sub: 'Packaging image',        icon: Package,   color: '#94a3b8' },
  { id: 'ci',     label: 'CI Check', sub: 'Running health checks',  icon: GitBranch, color: '#6366f1' },
  { id: 'cloud',  label: 'Cloud',    sub: 'Provisioning node',      icon: Cloud,     color: '#06b6d4' },
]

export const DeploymentFlowAnimation: React.FC<DeploymentFlowAnimationProps> = ({
  isActive, onComplete
}) => {
  const [activeStep, setActiveStep] = useState(-1)
  const [doneSteps, setDoneSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isActive) {
      setActiveStep(-1)
      setDoneSteps([])
      return
    }

    // Step 0 starts immediately
    setActiveStep(0)
    setDoneSteps([])

    const timers: ReturnType<typeof setTimeout>[] = []

    // Mark step 0 done, activate step 1 after 1.4s
    timers.push(setTimeout(() => {
      setDoneSteps([0])
      setActiveStep(1)
    }, 1400))

    // Mark step 1 done, activate step 2 after another 1.4s
    timers.push(setTimeout(() => {
      setDoneSteps([0, 1])
      setActiveStep(2)
    }, 2800))

    // All done after another 1.2s
    timers.push(setTimeout(() => {
      setDoneSteps([0, 1, 2])
      setActiveStep(-1)
      onComplete?.()
    }, 4000))

    return () => timers.forEach(clearTimeout)
  }, [isActive, onComplete])

  if (!isActive && doneSteps.length === 0) return null

  return (
    <div className="mt-5 p-4 rounded-2xl bg-black/30 border border-white/[0.06]">
      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[3px] mb-4">
        Deployment Pipeline
      </p>

      <div className="flex items-center justify-between gap-0">
        {STEPS.map((step, i) => {
          const isDone   = doneSteps.includes(i)
          const isActive = activeStep === i
          const Icon     = step.icon

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                {/* Circle icon */}
                <div
                  className={`
                    w-12 h-12 rounded-xl border flex items-center justify-center
                    transition-all duration-500 deploy-step
                    ${isDone   ? 'deploy-step-done border-emerald-500/40 bg-emerald-500/10'  : ''}
                    ${isActive ? 'deploy-step-active border-indigo-500/60 bg-indigo-500/10'  : ''}
                    ${!isDone && !isActive ? 'border-white/[0.06] bg-white/[0.02]'           : ''}
                  `}
                  style={isDone ? { boxShadow: '0 0 12px rgba(16,185,129,0.25)' } : isActive ? { boxShadow: '0 0 16px rgba(99,102,241,0.35)' } : {}}
                >
                  {isDone ? (
                    <CheckCircle size={18} className="text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 size={18} className="text-indigo-400 animate-spin" />
                  ) : (
                    <Icon size={18} className="text-slate-600" />
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className={`text-[10px] font-bold transition-colors duration-300 ${
                    isDone ? 'text-emerald-400' : isActive ? 'text-indigo-300' : 'text-slate-600'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-[9px] transition-colors duration-300 ${
                    isActive ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    {step.sub}
                  </p>
                </div>
              </div>

              {/* Connector between steps */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 relative h-[2px] mx-2 bg-white/[0.05] rounded-full deploy-connector-flow overflow-hidden"
                  style={doneSteps.includes(i) ? { background: 'rgba(16,185,129,0.25)' } : {}}
                >
                  {/* Animated neon particle */}
                  {isActive && (
                    <div
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        width: '40%',
                        background: `linear-gradient(90deg, transparent, ${step.color}AA, transparent)`,
                        animation: 'connector-slide 1.2s ease-in-out infinite',
                      }}
                    />
                  )}
                  {doneSteps.includes(i) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 rounded-full" />
                  )}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        {activeStep >= 0 && (
          <p className="text-[10px] text-indigo-400 font-semibold animate-pulse">
            {STEPS[activeStep]?.sub}...
          </p>
        )}
        {doneSteps.length === STEPS.length && (
          <p className="text-[10px] text-emerald-400 font-bold">
            ✓ Deployment successful!
          </p>
        )}
      </div>
    </div>
  )
}
