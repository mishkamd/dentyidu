"use client"

import * as React from "react"
import { Search, Loader2, User, FileText, Activity, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { globalSearch, type SearchResult } from "@/app/actions/search"
import { useLanguage } from "@/components/language-provider"

export function GlobalSearch() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isMobileExpanded, setIsMobileExpanded] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsMobileExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (isMobileExpanded) {
      inputRef.current?.focus()
    }
  }, [isMobileExpanded])

  React.useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }
      setIsLoading(true)
      try {
        const data = await globalSearch(debouncedQuery)
        setResults(data)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchResults()
  }, [debouncedQuery])

  const handleSelect = (href: string) => {
    setIsOpen(false)
    setQuery("")
    setIsMobileExpanded(false)
    router.push(href)
  }

  const handleMobileClose = () => {
    setIsMobileExpanded(false)
    setIsOpen(false)
    setQuery("")
  }

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "LEAD":
        return <User className="w-4 h-4 text-zinc-500" />
      case "PATIENT":
        return <Activity className="w-4 h-4 text-blue-500" />
      case "INVOICE":
        return <FileText className="w-4 h-4 text-orange-500" />
      default:
        return <Search className="w-4 h-4 text-gray-500" />
    }
  }

  const renderResults = () => {
    if (!isOpen || query.length < 2) return null
    return (
      <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
        {results.length > 0 ? (
          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto py-2">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result.href)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="mt-0.5 bg-gray-100 dark:bg-zinc-800 p-2 rounded-lg">
                  {getIconAndColor(result.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{result.title}</p>
                  {result.subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{result.subtitle}</p>}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mt-1">
                  {result.type}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-zinc-500">
            {!isLoading && t('search.noResults', 'Nu s-au găsit rezultate.')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative group" ref={containerRef}>
      {/* Mobile: search icon button */}
      <button
        type="button"
        className="lg:hidden flex items-center justify-center w-10 h-10 md:w-[42px] md:h-[42px] rounded-[14px] text-[#64748b] hover:text-zinc-900 bg-[#f8fafc] hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors border border-transparent shadow-sm"
        onClick={() => setIsMobileExpanded(true)}
        aria-label={t('search.open', 'Deschide căutare')}
      >
        <Search className="w-5 h-5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.8} />
      </button>

      {/* Mobile: expanded search overlay */}
      {isMobileExpanded && (
        <div className="lg:hidden fixed inset-x-0 top-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-zinc-400 dark:text-zinc-600">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500 dark:text-zinc-400" /> : <Search className="w-4 h-4" />}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results.length > 0) { e.preventDefault(); handleSelect(results[0].href) }
                if (e.key === "Escape") handleMobileClose()
              }}
              placeholder={t('search.placeholder', 'Caută pacient, factură, tratament...')}
              className="w-full bg-[#f8fafc] dark:bg-zinc-800/50 border border-transparent dark:border-zinc-800 rounded-[14px] py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-200 dark:focus:border-zinc-700 transition-all shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleMobileClose}
            className="flex items-center justify-center w-8 h-8 rounded-[12px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
            aria-label={t('search.close', 'Închide căutare')}
          >
            <X className="w-4 h-4" />
          </button>

          {renderResults()}
        </div>
      )}

      {/* Desktop: always-visible search bar */}
      <div className="hidden lg:block relative group w-full">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-zinc-400 dark:text-zinc-600 transition-colors">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : <Search className="w-4 h-4 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) { e.preventDefault(); handleSelect(results[0].href) }
          }}
          placeholder={t('search.placeholder', 'Caută pacient, factură, tratament...')}
          className="w-full bg-[#f8fafc] dark:bg-zinc-800/50 border border-transparent dark:border-zinc-800 rounded-[14px] py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-zinc-200 dark:focus:border-zinc-700 transition-all shadow-sm"
        />
        {renderResults()}
      </div>
    </div>
  )
}
