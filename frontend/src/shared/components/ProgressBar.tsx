type ProgressBarProps = {
  value: number
  label: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div className="progress" aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={safeValue} role="progressbar">
      <span style={{ width: `${safeValue}%` }} />
    </div>
  )
}
