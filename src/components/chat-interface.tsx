'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getMessages, sendMessage, getUsers, uploadFile, toggleReaction, deleteAttachment, heartbeat, ChatMessage, ChatUser, ChatAttachment } from '@/app/actions/chat'
import { Send, User, Users, Search, FileText, Image as ImageIcon, Plus, Paperclip, Smile, X, Download, ArrowLeft, Info, Trash2, AlertTriangle } from 'lucide-react'
import { Theme } from 'emoji-picker-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

// Dynamically import EmojiPicker to avoid SSR issues
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog'
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

interface ChatInterfaceProps {
  currentUser: {
    id: string
    name: string | null
    email: string
  }
}

export function ChatInterface({ currentUser }: ChatInterfaceProps) {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [showMobileDetails, setShowMobileDetails] = useState(false)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatSearch, setNewChatSearch] = useState("")
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null)
  const [isDeletingAttachment, setIsDeletingAttachment] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isUserNearBottom = useRef(true)
  const prevMessagesLength = useRef(0)

  const [addedUserIds, setAddedUserIds] = useState<string[]>([])
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const distanceToBottom = scrollHeight - scrollTop - clientHeight
      isUserNearBottom.current = distanceToBottom < 100
    }
  }

  // Load added users from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_added_users')
    if (saved) {
      try {
        setAddedUserIds(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse saved chat users", e)
      }
    }
  }, [])

  // Save added users to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem('chat_added_users', JSON.stringify(addedUserIds))
  }, [addedUserIds])

  // Reset mobile details when changing chat
  useEffect(() => {
    setShowMobileDetails(false)
  }, [activeChat])
  
  // Add active chat user to added users list automatically
  useEffect(() => {
    if (activeChat && !addedUserIds.includes(activeChat)) {
      setAddedUserIds(prev => [...prev, activeChat])
    }
  }, [activeChat, addedUserIds])

  // Fetch users initially and setup polling/heartbeat
  useEffect(() => {
    let isMounted = true

    const fetchUsers = async () => {
      if (!isMounted) return
      try {
        const data = await getUsers()
        if (isMounted) setUsers(data)
      } catch (error) {
        // Ignore fetch errors that happen when component unmounts or network is interrupted
        if (isMounted) {
          console.warn("Failed to fetch users (likely network interruption):", error)
        }
      }
    }

    const sendHeartbeat = async () => {
      if (!isMounted) return
      try {
        await heartbeat()
      } catch (error) {
        if (isMounted) {
          console.warn("Heartbeat failed:", error)
        }
      }
    }

    fetchUsers()
    sendHeartbeat()

    const usersInterval = setInterval(fetchUsers, 10000)
    const heartbeatInterval = setInterval(sendHeartbeat, 10000)

    return () => {
      isMounted = false
      clearInterval(usersInterval)
      clearInterval(heartbeatInterval)
    }
  }, [])

  // Fetch messages when activeChat changes and set up polling
  useEffect(() => {
    if (!activeChat) {
      setMessages([])
      return
    }

    let isMounted = true
    isUserNearBottom.current = true
    prevMessagesLength.current = 0

    const fetchMessages = async () => {
      if (!isMounted) return
      try {
        const data = await getMessages(activeChat)
        if (isMounted) setMessages(data)
      } catch (error) {
        if (isMounted) {
          console.warn("Failed to fetch messages:", error)
        }
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [activeChat])

  // Auto-scroll
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (scrollRef.current && isUserNearBottom.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }
    prevMessagesLength.current = messages.length
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) return

    const tempMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      content: inputValue,
      senderId: currentUser.id,
      receiverId: activeChat,
      createdAt: new Date(),
      sender: {
        name: currentUser.name,
        email: currentUser.email
      },
      receiver: activeChat ? { name: "", email: "" } : null,
      attachments: attachments,
      reactions: []
    }

    isUserNearBottom.current = true
    setMessages(prev => [...prev, tempMessage])
    setInputValue("")
    setAttachments([])
    setShowEmojiPicker(false)
    setIsLoading(true)

    try {
      await sendMessage(
        tempMessage.content, 
        activeChat || undefined, 
        attachments.map(att => ({
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize || undefined
        }))
      )
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadedFile = await uploadFile(formData)
      
      const newAttachment: ChatAttachment = {
        id: 'temp-' + Date.now(),
        fileName: uploadedFile.name,
        fileUrl: uploadedFile.url,
        fileType: uploadedFile.type,
        fileSize: uploadedFile.size
      }
      
      setAttachments(prev => [...prev, newAttachment])
    } catch (error) {
      console.error("Failed to upload file:", error)
      toast.error("Upload failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setInputValue(prev => prev + emojiObject.emoji)
  }

  const onReactionClick = async (messageId: string, emoji: string) => {
    // Optimistic update
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(
          r => r.emoji === emoji && r.userId === currentUser.id
        )
        
        if (existingReactionIndex >= 0) {
          // Remove reaction
          const newReactions = [...msg.reactions]
          newReactions.splice(existingReactionIndex, 1)
          return { ...msg, reactions: newReactions }
        } else {
          // Add reaction
          return {
            ...msg,
            reactions: [...msg.reactions, {
              id: 'temp-' + Date.now(),
              emoji,
              userId: currentUser.id,
              user: { name: currentUser.name, email: currentUser.email }
            }]
          }
        }
      }
      return msg
    }))

    try {
      await toggleReaction(messageId, emoji)
    } catch (error) {
      console.error("Failed to toggle reaction:", error)
      // Revert logic could be added here
    }
  }

  const executeDeleteAttachment = async () => {
    if (!attachmentToDelete) return

    // Optimistic update
    setMessages(prev => prev.map(msg => ({
      ...msg,
      attachments: msg.attachments?.filter(a => a.id !== attachmentToDelete) || []
    })))

    try {
      setIsDeletingAttachment(true)
      await deleteAttachment(attachmentToDelete)
      toast.success(t('chat.fileDeleted', 'Fișier șters'))
    } catch (error) {
      console.error("Failed to delete attachment:", error)
      toast.error(t('chat.fileDeleteError', 'Eroare la ștergerea fișierului'))
    } finally {
      setIsDeletingAttachment(false)
      setAttachmentToDelete(null)
    }
  }

  const promptDeleteAttachment = (attachmentId: string) => {
    setAttachmentToDelete(attachmentId)
  }

  const filteredUsers = users.filter(u => {
    // Search logic for the main list
    if (searchTerm) {
       return u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
              u.email.toLowerCase().includes(searchTerm.toLowerCase())
    }

    // Default view: Show Admins, Managers, and Manually Added Users
    // Also show if they are the current user (optional, usually exclude self)
    if (u.id === currentUser.id) return false
    
    // Always show admins
    if (u.role === 'ADMIN') return true
    
    // Show added users
    if (addedUserIds.includes(u.id)) return true
    
    return false
  })

  // Users available to add (exclude already visible ones)
  const usersToAdd = users.filter(u => 
    u.id !== currentUser.id && 
    !filteredUsers.find(fu => fu.id === u.id) &&
    (u.name?.toLowerCase().includes(newChatSearch.toLowerCase()) || 
     u.email.toLowerCase().includes(newChatSearch.toLowerCase()))
  )

  const addUserToChat = (userId: string) => {
    if (!addedUserIds.includes(userId)) {
      setAddedUserIds(prev => [...prev, userId])
    }
    setActiveChat(userId)
    setIsNewChatOpen(false)
    setNewChatSearch("")
  }

  const confirmRemoveUser = (userId: string) => {
    setAddedUserIds(prev => prev.filter(id => id !== userId))
    if (activeChat === userId) {
      setActiveChat(null)
    }
    setUserToDelete(null)
  }

  const activeUser = users.find(u => u.id === activeChat)

  // Collect all attachments from messages for the sidebar
  const allAttachments = messages.flatMap(m => m.attachments || [])

  const isUserOnline = (lastSeen: Date | null) => {
    if (!lastSeen) return false
    const diff = new Date().getTime() - new Date(lastSeen).getTime()
    return diff < 60000 // 1 minute
  }

  return (
    <div className="flex gap-2 h-full relative">
      {/* Left Sidebar - Users */}
      <div className={`w-full md:w-60 shrink-0 flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input 
              placeholder={t('chat.searchConversations', 'Caută conversații...')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-100 dark:bg-zinc-900 border-none h-9 text-sm"
            />
          </div>
          <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="shrink-0 h-9 w-9 rounded-full">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('chat.startNew', 'Începe o conversație nouă')}</DialogTitle>
                <DialogDescription>
                  {t('chat.startNewDescription', 'Caută și selectează utilizatorul cu care dorești să vorbești.')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder={t('chat.searchUsers', 'Caută utilizatori...')} 
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {usersToAdd.length === 0 ? (
                    <p className="text-center text-sm text-zinc-500 py-8">{t('chat.noUsersFound', 'Nu am găsit utilizatori.')}</p>
                  ) : (
                    usersToAdd.map(user => (
                      <button
                        key={user.id}
                        onClick={() => addUserToChat(user.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-medium">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          {isUserOnline(user.lastSeen) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">{user.name || t('chat.noName', 'Fără nume')}</p>
                          <p className="text-xs text-zinc-500">{user.email} • {user.role}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mt-2">{t('chat.users', 'Utilizatori')}</div>

          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setActiveChat(user.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                activeChat === user.id
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner'
                  : 'text-zinc-500 hover:bg-gray-50 dark:hover:bg-white/[0.02] hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent'
              } group relative`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {user.name?.[0] || user.email[0]}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="font-bold text-sm truncate">{user.name || user.email.split('@')[0]}</div>
                <div className="text-xs opacity-70 truncate text-zinc-500">{user.role}</div>
              </div>
              {/* Online indicator */}
              {isUserOnline(user.lastSeen) && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              )}
              {addedUserIds.includes(user.id) && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation()
                    setUserToDelete(user.id)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          ))}
        </div>

        <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('chat.deleteConversation', 'Șterge conversația')}</DialogTitle>
              <DialogDescription>
                {t('chat.deleteConversationConfirm', 'Ești sigur că vrei să ștergi această conversație din listă? Istoricul mesajelor nu va fi șters.')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setUserToDelete(null)}>{t('ui.cancel', 'Anulează')}</Button>
              <Button variant="admin_destructive" size="admin_pill" onClick={() => userToDelete && confirmRemoveUser(userToDelete)}>{t('ui.delete', 'Șterge')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Center - Chat Area */}
      <div className={`flex-1 min-w-0 flex flex-col gap-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Mobile Header */}
        {activeChat && (
          <div className="md:hidden p-3 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-zinc-900/30">
            <button 
              onClick={() => setActiveChat(null)}
              className="p-2 -ml-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-bold text-foreground text-sm">
              {activeUser?.name || activeUser?.email}
            </span>
            <button 
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              className={`p-2 -mr-2 rounded-lg transition-colors ${showMobileDetails ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 pt-3 pb-10 space-y-3 bg-transparent [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" ref={scrollRef} onScroll={handleScroll}>
          {!activeChat ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-2">
                 <Users className="h-8 w-8 opacity-50" />
              </div>
              <p>{t('chat.selectUserToStart', 'Selectează un utilizator pentru a începe conversația')}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-2">
                 <User className="h-8 w-8 opacity-50" />
              </div>
              <p>{t('chat.startConversation', 'Începe conversația')}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`flex items-baseline gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <span className="text-[10px] text-muted-foreground font-bold">
                          {msg.sender.name || msg.sender.email}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div 
                      className={`px-4 py-2 rounded-2xl text-sm shadow-sm relative group ${
                        isMe 
                          ? 'bg-emerald-500 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 rounded-tl-none'
                      }`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                      
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`mt-2 space-y-2 ${msg.content ? 'pt-2 border-t ' + (isMe ? 'border-white/20' : 'border-gray-200 dark:border-white/10') : ''}`}>
                          {msg.attachments.map(att => (
                            <div key={att.id} className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-gray-50 dark:bg-white/5'} overflow-hidden`}>
                              {att.fileType.startsWith('image/') ? (
                                <ImageIcon className="h-4 w-4 shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 shrink-0" />
                              )}
                              <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs truncate hover:underline flex-1">
                                {att.fileName}
                              </a>
                              <a href={att.fileUrl} download target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3 opacity-70 hover:opacity-100" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reaction Trigger Button (Hover) */}
                      <div className={`absolute -bottom-6 ${isMe ? 'right-0' : 'left-0'} z-50 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        {['👍', '❤️', '😂', '😮'].map(emoji => (
                          <button 
                            key={emoji}
                            onClick={() => onReactionClick(msg.id, emoji)}
                            className="bg-muted hover:bg-muted/80 rounded-full p-1 text-xs border border-border shadow-sm text-foreground"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reactions Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                          const count = msg.reactions.filter(r => r.emoji === emoji).length
                          const hasReacted = msg.reactions.some(r => r.emoji === emoji && r.userId === currentUser.id)
                          return (
                            <button
                              key={emoji}
                              onClick={() => onReactionClick(msg.id, emoji)}
                              className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                hasReacted 
                                  ? 'bg-primary/20 border-primary/50 text-primary' 
                                  : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 1 && <span>{count}</span>}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message Input Area */}
        <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] relative">
          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {attachments.map((att, index) => (
                <div key={index} className="relative group shrink-0">
                  <div className="h-16 w-16 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10">
                    {att.fileType.startsWith('image/') ? (
                      <Image src={att.fileUrl} alt="Preview" fill className="object-cover" sizes="64px" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <div className="relative">
                <button 
                  onClick={() => setShowEmojiPicker(false)}
                  className="absolute -top-2 -right-2 bg-muted text-foreground rounded-full p-1 z-50 border border-border hover:bg-muted/80"
                >
                  <X className="h-4 w-4" />
                </button>
                <Picker
                  onEmojiClick={handleEmojiClick}
                  theme={Theme.DARK}
                  width={220}
                  height={260}
                  searchDisabled={false}
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                  style={{
                    '--epr-bg-color': '#09090b',
                    '--epr-category-label-bg-color': '#18181b',
                    '--epr-text-color': '#e4e4e7',
                    '--epr-search-input-bg-color': '#27272a',
                    '--epr-picker-border-color': '#27272a',
                    '--epr-hover-bg-color': '#27272a',
                    '--epr-search-input-height': '36px',
                    '--epr-category-navigation-button-size': '24px',
                    '--epr-search-input-padding': '0 12px',
                    '--epr-header-padding': '8px',
                  } as React.CSSProperties}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="flex gap-1.5 items-center">
            <div className="flex-1 flex items-center gap-1 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-2 py-1 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all w-full">
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-zinc-500 hover:text-emerald-500 transition-colors"
                  disabled={isUploading}
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors ${showEmojiPicker ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500 hover:text-emerald-500'}`}
                >
                  <Smile className="h-4 w-4" />
                </button>
              </div>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chat.write', 'Scrie...')}
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 px-2 py-1 min-w-0"
              />
            </div>
            
            <Button
              type="submit"
              disabled={(!inputValue.trim() && attachments.length === 0) || isLoading || isUploading}
              variant="admin_primary" size="admin_pill"
              className="rounded-2xl flex items-center justify-center shrink-0 w-9 h-9 md:w-auto md:h-9 px-3 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - Details */}
      <div className={`w-full md:w-60 shrink-0 bg-white dark:bg-zinc-900/30 border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm dark:shadow-none flex flex-col overflow-hidden rounded-2xl md:flex py-0 ${showMobileDetails ? 'absolute inset-0 z-50 md:relative md:z-auto' : 'hidden'}`}>
        {/* Mobile Close Button */}
        <div className="md:hidden p-3 border-b border-gray-200 dark:border-white/5 flex justify-end">
          <button 
            onClick={() => setShowMobileDetails(false)}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!activeChat ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <Users className="h-12 w-12 opacity-20 mb-4" />
            <p className="text-sm">{t('chat.selectUserDetails', 'Selectează un utilizator pentru a vedea detaliile')}</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-white/5 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-lg font-bold text-zinc-500 mb-2 border-4 border-white dark:border-zinc-900 shadow-lg shrink-0">
                {activeUser?.name?.[0] || activeUser?.email[0]}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 text-center">
                {activeUser?.name || activeUser?.email}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 text-center">
                {activeUser?.role}
              </p>
              <div className={`text-[10px] flex items-center gap-1 mt-2 ${isUserOnline(activeUser?.lastSeen || null) ? 'text-emerald-500' : 'text-zinc-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isUserOnline(activeUser?.lastSeen || null) ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                {isUserOnline(activeUser?.lastSeen || null) ? 'Online' : 'Offline'}
              </div>
            </div>

            <div className="p-3 flex-1 overflow-y-auto">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">{t('chat.sharedFiles', 'Fișiere Partajate')}</h4>
              <div className="space-y-2">
                {allAttachments.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">{t('chat.noSharedFiles', 'Nu există fișiere partajate')}</p>
                ) : (
                  allAttachments.map(att => (
                    att.fileType.startsWith('image/') ? (
                      <div key={att.id} className="w-full flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:border-emerald-500/30 transition-all group">
                        <button 
                          onClick={() => setPreviewImage(att.fileUrl)}
                          className="flex-1 flex items-center gap-3 min-w-0 text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                            <Image src={att.fileUrl} alt={att.fileName} fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity" sizes="32px" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-500 transition-colors">{att.fileName}</div>
                            <div className="text-[10px] text-zinc-500">{att.fileSize ? (att.fileSize / 1024).toFixed(1) + ' KB' : 'Image'}</div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            promptDeleteAttachment(att.id);
                          }}
                          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                          title="Șterge fișierul"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div key={att.id} className="w-full flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border hover:border-emerald-500/30 transition-all group">
                        <a 
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center gap-3 min-w-0 text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 text-emerald-500">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-xs text-foreground truncate group-hover:text-emerald-500 transition-colors">{att.fileName}</div>
                            <div className="text-[10px] text-muted-foreground">{att.fileSize ? (att.fileSize / 1024).toFixed(1) + ' KB' : 'Document'}</div>
                          </div>
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            promptDeleteAttachment(att.id);
                          }}
                          className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                          title="Șterge fișierul"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-gray-200 dark:border-white/10 shadow-2xl shadow-emerald-900/10">
          <DialogHeader>
            <div className="flex items-center gap-3">
                <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                <DialogTitle className="text-zinc-900 dark:text-zinc-100">{t('chat.newChat', 'Chat Nou')}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder={t('chat.searchColleague', 'Caută un coleg...')} 
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
              {users.filter(u => 
                u.id !== currentUser.id && 
                (u.name?.toLowerCase().includes(newChatSearch.toLowerCase()) || 
                 u.email.toLowerCase().includes(newChatSearch.toLowerCase()))
              ).map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setActiveChat(user.id)
                    setIsNewChatOpen(false)
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 transition-all group border border-transparent hover:border-emerald-500/20"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-bold uppercase shrink-0 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    {user.name?.[0] || user.email[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user.name || user.email.split('@')[0]}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.role}</div>
                  </div>
                </button>
              ))}
              
              {users.filter(u => u.id !== currentUser.id).length === 0 && (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  {t('chat.noOtherUsers', 'Nu există alți utilizatori.')}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-visible bg-transparent border-none shadow-none [&>button]:hidden">
          <div className="relative w-full h-[80vh]">
            {previewImage && (
              <>
                <Image 
                  src={previewImage} 
                  alt="Preview" 
                  fill
                  className="object-contain rounded-lg shadow-2xl"
                  sizes="100vw"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-12 right-0 md:-right-12 p-2.5 bg-background/80 hover:bg-background text-foreground rounded-full backdrop-blur-sm transition-all border border-border shadow-lg group"
                >
                  <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="sr-only">Close</span>
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!attachmentToDelete} onOpenChange={(open) => !open && setAttachmentToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/10 shadow-2xl shadow-red-900/10">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-zinc-900 dark:text-zinc-100">{t('chat.deleteFile', 'Ștergere Fișier')}</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 pt-2 pl-1">
              {t('chat.deleteFileConfirm', 'Ești sigur că vrei să ștergi acest fișier? Această acțiune este ireversibilă.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <DialogClose asChild>
              <Button variant="admin_secondary" size="admin_pill">{t('ui.cancel', 'Anulează')}</Button>
            </DialogClose>
            <Button 
              variant="admin_destructive" size="admin_pill" 
              onClick={executeDeleteAttachment}
              disabled={isDeletingAttachment}
            >
              {isDeletingAttachment ? t('chat.deleting', 'Se șterge...') : t('chat.deleteForever', 'Șterge Definitiv')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}