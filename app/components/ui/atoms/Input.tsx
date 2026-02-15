"use client"
import React, { forwardRef } from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ className = "", icon, error, ...rest }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3.5 ${icon ? "pl-11" : ""}
            bg-gray-50/80
            border-0
            rounded-2xl
            text-gray-900 placeholder-gray-400
            transition-all duration-300
            focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:shadow-lg
            hover:bg-gray-100/80
            ${error ? "ring-2 ring-red-500/30 bg-red-50/50" : ""}
            ${className}
          `}
          {...rest}
        />
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
