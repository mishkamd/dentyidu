"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  // Load state from localStorage on mount; auto-close on mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.innerWidth < 768) {
        setIsOpen(false)
        return
      }
      const savedState = localStorage.getItem("sidebarOpen")
      if (savedState !== null) {
        setIsOpen(savedState === "true")
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const toggle = () => {
    setIsOpen((prev) => {
      const newState = !prev
      localStorage.setItem("sidebarOpen", String(newState))
      return newState
    })
  }

  const setOpen = (open: boolean) => {
    setIsOpen(open)
    localStorage.setItem("sidebarOpen", String(open))
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
