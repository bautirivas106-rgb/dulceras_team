import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-brand text-white hover:bg-brand-dark shadow-md hover:shadow-lg active:scale-[0.98]': variant === 'primary',
            'bg-brand-dark text-white hover:opacity-90 shadow-md': variant === 'secondary',
            'border-2 border-brand text-brand hover:bg-brand hover:text-white': variant === 'outline',
            'text-brand hover:bg-brand-soft': variant === 'ghost',
          },
          {
            'text-sm px-4 py-2': size === 'sm',
            'text-base px-6 py-3': size === 'md',
            'text-base px-8 py-3.5': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
