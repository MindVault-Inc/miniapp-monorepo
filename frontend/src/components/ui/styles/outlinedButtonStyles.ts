import { ButtonSize, ButtonVariant } from './buttonStyles'

export const outlinedButtonSizes = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-6 text-base',
  lg: 'h-12 px-8 text-lg'
} as const

export const outlinedButtonVariants = {
  default: 'border-2 border-accent-red text-accent-red hover:bg-accent-red/10',
  secondary: 'border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary/10',
  warning: 'border-2 border-accent-orange text-accent-orange hover:bg-accent-orange/10'
} as const

export type OutlinedButtonSize = ButtonSize
export type OutlinedButtonVariant = ButtonVariant 