"use client"

import React, { useState } from "react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameMonth, 
  isSameDay, 
  isToday,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  isAfter
} from "date-fns"
import { ro } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, User, Clock, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface CalendarEvent {
  id: string
  date: Date
  title: string
  type: 'arrival' | 'lead' | 'treatment'
  status?: string
  description?: string
  details?: {
    patientName?: string
    hotel?: string
    treatment?: string
    phone?: string
  }
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

type View = 'month' | 'week' | 'day'

export function CalendarView({ events }: CalendarViewProps) {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>('month')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Auto-switch to day view on mobile screens
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setView('day')
    }
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // --- Date Calculations ---
  const firstDay = view === 'month' 
    ? startOfMonth(currentDate) 
    : view === 'week' 
      ? startOfWeek(currentDate, { weekStartsOn: 1 }) 
      : currentDate;

  const lastDay = view === 'month' 
    ? endOfMonth(currentDate) 
    : view === 'week' 
      ? endOfWeek(currentDate, { weekStartsOn: 1 }) 
      : currentDate;

  const startDate = view === 'day' ? firstDay : startOfWeek(firstDay, { weekStartsOn: 1 })
  const endDate = view === 'day' ? lastDay : endOfWeek(lastDay, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  // --- Navigation ---
  const next = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const prev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subDays(currentDate, 1))
  }
  
  const goToToday = () => setCurrentDate(new Date())

  // --- Event Helpers ---
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day)).sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  const getEventColor = (type: string, variant: 'bg' | 'text' | 'dot' | 'border' = 'text') => {
    switch (type) {
      case 'arrival': // Blue
        if (variant === 'bg') return "bg-blue-50 dark:bg-blue-900/20"
        if (variant === 'text') return "text-blue-600 dark:text-blue-400"
        if (variant === 'dot') return "bg-blue-600"
        if (variant === 'border') return "border-blue-200 dark:border-blue-800"
        return ""
      case 'lead': // Emerald
        if (variant === 'bg') return "bg-emerald-50 dark:bg-emerald-900/20"
        if (variant === 'text') return "text-emerald-600 dark:text-emerald-400"
        if (variant === 'dot') return "bg-emerald-600"
        if (variant === 'border') return "border-emerald-200 dark:border-emerald-800"
        return ""
      case 'treatment': // Purple
        if (variant === 'bg') return "bg-purple-50 dark:bg-purple-900/20"
        if (variant === 'text') return "text-purple-600 dark:text-purple-400"
        if (variant === 'dot') return "bg-purple-600"
        if (variant === 'border') return "border-purple-200 dark:border-purple-800"
        return ""
      default:
        return ""
    }
  }

  const renderTitle = () => {
    if (view === 'month') return format(currentDate, "MMMM yyyy", { locale: ro })
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "d MMM", { locale: ro })} - ${format(end, "d MMM yyyy", { locale: ro })}`
    }
    return format(currentDate, "eeee, d MMMM yyyy", { locale: ro })
  }

  // Time slots for week/day view
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7)
  const getEventsForTimeSlot = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventHour = getHours(event.date)
      return isSameDay(event.date, day) && eventHour === hour
    })
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <h5 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white capitalize">
              {renderTitle()}
            </h5>
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <Button variant="ghost" size="icon" onClick={prev} className="h-9 w-9 sm:h-7 sm:w-7 rounded-md hover:bg-white dark:hover:bg-zinc-700">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={next} className="h-9 w-9 sm:h-7 sm:w-7 rounded-md hover:bg-white dark:hover:bg-zinc-700">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg gap-1">
             <Button 
              variant="ghost" 
              onClick={() => setView('day')}
              className={cn("h-8 px-3 rounded-md text-xs font-medium transition-all", view === 'day' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white")}
            >
              {t('calendar.day', 'Zi')}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setView('week')}
              className={cn("h-8 px-3 rounded-md text-xs font-medium transition-all", view === 'week' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white")}
            >
              {t('calendar.week', 'Săpt')}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setView('month')}
              className={cn("h-8 px-3 rounded-md text-xs font-medium transition-all", view === 'month' ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white")}
            >
              {t('calendar.month', 'Lună')}
            </Button>
          </div>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'month' ? (
          <div className="flex-1 flex flex-col">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
              {[t('calendar.sun', 'Dum'), t('calendar.mon', 'Lun'), t('calendar.tue', 'Mar'), t('calendar.wed', 'Mie'), t('calendar.thu', 'Joi'), t('calendar.fri', 'Vin'), t('calendar.sat', 'Sâm')].map((day, i) => (
                <div key={i} className={cn(
                  "py-2 sm:py-3 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider",
                  i !== 6 && "border-r border-gray-200 dark:border-zinc-800"
                )}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-200 dark:bg-zinc-800 gap-px border-gray-200 dark:border-zinc-800 overflow-y-auto">
              {days.map((day, idx) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                
                return (
                  <div 
                    key={day.toString()}
                    onClick={() => { setCurrentDate(day); setView('day'); }}
                    className={cn(
                      "min-h-[60px] sm:min-h-[80px] md:min-h-[100px] bg-white dark:bg-zinc-900 p-1 sm:p-2 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer flex flex-col relative group",
                      !isCurrentMonth && "bg-gray-50/30 dark:bg-zinc-950/50 text-zinc-400"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                      isToday(day) 
                        ? "bg-emerald-600 text-white" 
                        : "text-zinc-700 dark:text-zinc-300"
                    )}>
                      {format(day, "d")}
                    </span>
                    
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map(event => {
                         const isClickable = true
                         const Component = 'button'
                         return (
                          <Component
                            key={event.id}
                            onClick={isClickable ? (e: any) => { e.stopPropagation(); setSelectedEvent(event); } : undefined}
                            className={cn(
                              "text-left px-1.5 py-1 rounded text-[10px] font-medium border-l-2 truncate w-full transition-all flex items-center justify-between gap-1",
                              getEventColor(event.type, 'bg'),
                              getEventColor(event.type, 'text'),
                              getEventColor(event.type, 'border'),
                              isClickable && "hover:brightness-95 hover:translate-x-0.5"
                            )}
                          >
                            <span className="truncate">{event.details?.patientName || event.title}</span>
                            {event.status && (
                                <span className="text-[8px] opacity-70 uppercase tracking-tighter flex-shrink-0">
                                    {event.status.slice(0, 3)}
                                </span>
                            )}
                          </Component>
                         )
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-zinc-400 font-medium pl-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                          + {dayEvents.length - 3} altele
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
             {/* Timeline Header */}
             <div className="flex border-b border-gray-200 dark:border-zinc-800">
               <div className="w-14 sm:w-16 flex-shrink-0 border-r border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50"></div>
               <div className={cn("flex-1 grid", view === 'week' ? "grid-cols-7" : "grid-cols-1")}>
                 {days.map((day, i) => (
                   <div key={i} className={cn(
                     "py-3 text-center border-r border-gray-200 dark:border-zinc-800 last:border-r-0",
                     isToday(day) ? "bg-emerald-50/30 dark:bg-emerald-900/10" : ""
                   )}>
                     <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-0.5">
                       {format(day, "EEE", { locale: ro })}
                     </p>
                     <p className={cn(
                       "text-sm font-bold inline-block w-7 h-7 leading-7 rounded-full",
                       isToday(day) ? "bg-emerald-600 text-white" : "text-zinc-900 dark:text-white"
                     )}>
                       {format(day, "d")}
                     </p>
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Timeline Body */}
             <div className="flex-1 overflow-y-auto">
                <div className="flex">
                  <div className="w-14 sm:w-16 flex-shrink-0 border-r border-gray-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900">
                    {timeSlots.map(hour => (
                      <div key={hour} className="h-14 sm:h-20 border-b border-gray-200 dark:border-zinc-800 relative">
                        <span className="absolute -top-2 right-2 text-[10px] font-medium text-zinc-400 bg-white dark:bg-zinc-900 px-1">
                          {hour}:00
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={cn("flex-1 grid", view === 'week' ? "grid-cols-7" : "grid-cols-1")}>
                     {days.map((day, dayIndex) => (
                       <div key={dayIndex} className="border-r border-gray-200 dark:border-zinc-800 last:border-r-0 relative min-h-full">
                          {timeSlots.map(hour => {
                            const slotEvents = getEventsForTimeSlot(day, hour)
                            return (
                              <div key={hour} className="h-14 sm:h-20 border-b border-gray-200 dark:border-zinc-800 relative group hover:bg-gray-50/30 transition-colors">
                                {slotEvents.map((event, idx) => {
                                   const isClickable = true
                                   const Component = 'button'
                                   const startMin = getMinutes(event.date)
                                   
                                   return (
                                     <Component
                                        key={event.id}
                                        onClick={isClickable ? (e: any) => { e.stopPropagation(); setSelectedEvent(event); } : undefined}
                                        className={cn(
                                          "absolute left-1 right-1 p-1.5 rounded border-l-4 text-left shadow-sm z-10 transition-all overflow-hidden flex flex-col justify-center",
                                          getEventColor(event.type, 'bg'),
                                          getEventColor(event.type, 'border'),
                                          isClickable && "hover:scale-[1.02] hover:shadow-md cursor-pointer hover:z-20"
                                        )}
                                        style={{
                                          top: `${(startMin / 60) * 100}%`,
                                          minHeight: '36px',
                                          height: 'auto'
                                        }}
                                     >
                                        <div className="flex items-center gap-1.5 w-full overflow-hidden">
                                          <span className={cn("text-[10px] font-bold whitespace-nowrap opacity-90 flex-shrink-0", getEventColor(event.type, 'text'))}>
                                            {format(event.date, "HH:mm")}
                                          </span>
                                          
                                          <p className={cn("text-[10px] font-bold leading-none truncate flex-shrink-0", getEventColor(event.type, 'text'))}>
                                            {event.details?.patientName || event.title}
                                          </p>

                                          {event.details?.treatment && (
                                            <>
                                              <span className={cn("text-[10px] opacity-60", getEventColor(event.type, 'text'))}>-</span>
                                              <p className={cn("text-[10px] opacity-80 leading-none truncate min-w-0", getEventColor(event.type, 'text'))}>
                                                {event.details.treatment}
                                              </p>
                                            </>
                                          )}
                                        </div>
                                     </Component>
                                   )
                                })}
                              </div>
                            )
                          })}
                          {/* Current Time Indicator */}
                          {isToday(day) && (
                            <div 
                              className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none opacity-60"
                              style={{
                                top: `${((getHours(new Date()) - 7) * 60 + getMinutes(new Date())) / (14 * 60) * 100}%`
                              }}
                            >
                              <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-500"></div>
                            </div>
                          )}
                       </div>
                     ))}
                  </div>
                </div>
             </div>
          </div>
        )}
        </div>

        {/* Dialog Details */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl shadow-emerald-900/10 dark:text-white">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  selectedEvent && getEventColor(selectedEvent.type, 'border'),
                  selectedEvent && getEventColor(selectedEvent.type, 'bg')
                )}>
                  {selectedEvent?.type === 'arrival' && <MapPin className={cn("w-5 h-5", selectedEvent && getEventColor(selectedEvent.type, 'text'))} />}
                  {selectedEvent?.type === 'lead' && <User className={cn("w-5 h-5", selectedEvent && getEventColor(selectedEvent.type, 'text'))} />}
                  {selectedEvent?.type === 'treatment' && <CalendarIcon className={cn("w-5 h-5", selectedEvent && getEventColor(selectedEvent.type, 'text'))} />}
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">
                    {selectedEvent?.title}
                  </DialogTitle>
                  <DialogDescription className="dark:text-zinc-400">
                    {selectedEvent && format(selectedEvent.date, "dd MMMM yyyy, HH:mm", { locale: ro })}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedEvent?.description && (
                <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-white/5">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              
              {selectedEvent?.status && (
                 <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Status</span>
                    <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full uppercase",
                        "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                    )}>{selectedEvent.status}</span>
                  </div>
              )}

              {selectedEvent?.details && (
                <div className="space-y-3">
                  {selectedEvent.details.patientName && (
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{t('calendar.patient', 'Pacient')}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{selectedEvent.details.patientName}</span>
                    </div>
                  )}
                  {selectedEvent.details.treatment && (
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{t('calendar.treatment', 'Tratament')}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{selectedEvent.details.treatment}</span>
                    </div>
                  )}
                  {selectedEvent.details.hotel && (
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{t('calendar.hotel', 'Cazare')}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{selectedEvent.details.hotel}</span>
                    </div>
                  )}
                   {selectedEvent.details.phone && (
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{t('calendar.phone', 'Telefon')}</span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{selectedEvent.details.phone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="admin_primary" size="admin_pill" 
                  onClick={() => setSelectedEvent(null)}
                >
                  {t('ui.close', 'Închide')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}
