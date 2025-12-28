import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-[#1A2332] text-[#E8D5A3] border border-[#1A2332] hover:bg-[#2A3442] hover:text-[#F5D76E] active:scale-[0.98] shadow-sm",
        destructive:
          "bg-red-600 text-white border border-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm",
        outline:
          "border border-[#D4AF37] bg-transparent text-[#1A2332] hover:bg-[#E8D5A3]/10 hover:border-[#B8941F] active:scale-[0.98] shadow-sm",
        secondary:
          "bg-[#E8D5A3] text-[#1A2332] border border-[#E8D5A3] hover:bg-[#F5D76E] hover:text-[#1A2332] active:scale-[0.98] shadow-sm",
        ghost:
          "border border-transparent bg-transparent text-[#1A2332] hover:bg-[#E8D5A3]/10 hover:text-[#B8941F] active:scale-[0.98]",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-full px-3 text-xs",
        lg: "min-h-10 rounded-full px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }