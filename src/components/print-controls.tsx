'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"

export function PrintControls() {
  useEffect(() => {
    // Auto-print on mount
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
      <Button onClick={() => window.print()}>
          Printează
      </Button>
      <Button 
          variant="outline"
          onClick={() => window.close()} 
      >
          Închide
      </Button>
    </div>
  )
}
