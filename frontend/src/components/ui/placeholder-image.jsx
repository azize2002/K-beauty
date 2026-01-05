import * as React from "react"
import { cn } from "@/lib/utils"

const PlaceholderImage = React.forwardRef(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    viewBox="0 0 400 400"
    className={cn("w-full h-full", className)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background */}
    <rect width="400" height="400" fill="#F9F7F4" />
    
    {/* Camera icon */}
    <g transform="translate(150, 120)">
      {/* Camera body */}
      <rect x="20" y="30" width="60" height="50" rx="4" fill="#B7B4AE" />
      {/* Camera lens */}
      <circle cx="50" cy="55" r="15" fill="#B7B4AE" />
      <circle cx="50" cy="55" r="10" fill="#F9F7F4" />
      {/* Viewfinder */}
      <rect x="40" y="15" width="20" height="12" rx="2" fill="#B7B4AE" />
      {/* Flash */}
      <circle cx="70" cy="40" r="4" fill="#B7B4AE" />
    </g>
    
    {/* Text */}
    <text
      x="200"
      y="280"
      textAnchor="middle"
      fill="#1C1C1C"
      fontSize="18"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="400"
    >
      Image à venir
    </text>
  </svg>
))

PlaceholderImage.displayName = "PlaceholderImage"

export { PlaceholderImage }

