import type { ReactNode } from 'react'

type StatusMessageProps = {
  tone?: 'info' | 'error' | 'success'
  children: ReactNode
}

export function StatusMessage({ tone = 'info', children }: StatusMessageProps) {
  return <div className={`status-message status-message--${tone}`}>{children}</div>
}
