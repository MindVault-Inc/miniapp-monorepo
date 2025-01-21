import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { ButtonSize, ButtonVariant } from "./styles/buttonStyles"
import { outlinedButtonSizes, outlinedButtonVariants } from "./styles/outlinedButtonStyles"

interface OutlinedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  variant?: ButtonVariant
  fullWidth?: boolean
  icon?: LucideIcon
  iconClassName?: string
  className?: string
  children: React.ReactNode
}

export function OutlinedButton({
  size = 'md',
  variant = 'default',
  fullWidth = false,
  icon: Icon,
  iconClassName,
  className,
  children,
  ...props
}: OutlinedButtonProps) {
  return (
    <button
      className={cn(
        "relative flex items-center justify-center gap-2 rounded-[20px] font-semibold transition-colors",
        outlinedButtonSizes[size],
        outlinedButtonVariants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
      {Icon && (
        <Icon 
          className={cn(
            "h-4 w-4",
            size === 'lg' && "h-5 w-5",
            size === 'sm' && "h-3.5 w-3.5",
            iconClassName
          )} 
        />
      )}
    </button>
  )
} 