import { useState } from 'react'

interface PeriodButtonProps {
  isActivePeriod: boolean
  onStartPeriod: () => void
  onEndPeriod: () => void
  isStarting: boolean
  isEnding: boolean
}

export const PeriodButton: React.FC<PeriodButtonProps> = ({
  isActivePeriod,
  onStartPeriod,
  onEndPeriod,
  isStarting,
  isEnding,
}) => {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStart = () => {
    onStartPeriod()
  }

  const handleEnd = () => {
    setShowConfirm(true)
  }

  const confirmEnd = () => {
    onEndPeriod()
    setShowConfirm(false)
  }

  const cancelEnd = () => {
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center">Are you sure you want to end your period?</p>
        <div className="flex gap-2">
          <button
            className="btn btn-error"
            onClick={confirmEnd}
            disabled={isEnding}
          >
            {isEnding ? 'Ending...' : 'Yes, End Period'}
          </button>
          <button
            className="btn btn-ghost"
            onClick={cancelEnd}
            disabled={isEnding}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      className={`btn btn-lg rounded-full px-8 py-4 text-lg font-bold ${
        isActivePeriod
          ? 'btn-secondary text-white'
          : 'btn-primary text-white hover:btn-primary-focus'
      }`}
      onClick={isActivePeriod ? handleEnd : handleStart}
      disabled={isStarting || isEnding}
    >
      {isStarting || isEnding
        ? (
            <span className="loading loading-spinner"></span>
          )
        : isActivePeriod
          ? (
              'End Period'
            )
          : (
              'Start Period'
            )}
    </button>
  )
}
