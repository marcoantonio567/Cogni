import type { ButtonHTMLAttributes } from 'react'

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean
}

export function SubmitButton({ children, pending = false, disabled, ...props }: SubmitButtonProps) {
  return (
    <button className="button button--primary" disabled={disabled || pending} type="submit" {...props}>
      {pending ? 'Salvando...' : children}
    </button>
  )
}
