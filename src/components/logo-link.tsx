"use client"

import Link from "next/link"
import * as React from "react"

interface LogoLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

export function LogoLink({ href, className, children }: LogoLinkProps) {
  return (
    <Link 
      href={href} 
      prefetch={false}
      className={className}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      {children}
    </Link>
  )
}
