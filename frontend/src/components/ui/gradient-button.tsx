import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  [
    "gradient-button",
    "inline-flex items-center justify-center gap-2",
    "rounded-full px-7 py-3.5",
    "text-sm font-semibold text-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
    "disabled:pointer-events-none disabled:opacity-50",
    "no-underline",
  ],
  {
    variants: {
      variant: {
        default:   "gradient-button-pink",
        chocolate: "gradient-button-chocolate",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(gradientButtonVariants({ variant, className }))}
      {...props}
    />
  )
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }
