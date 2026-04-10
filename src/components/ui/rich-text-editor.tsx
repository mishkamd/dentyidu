"use client"

import React, { useEffect, useRef, useState } from 'react'
import { cn } from "@/lib/utils"
import DOMPurify from 'isomorphic-dompurify'
import type EditorJS from '@editorjs/editorjs'
import type { OutputBlockData } from '@editorjs/editorjs'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<EditorJS | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Parse HTML to Blocks
  const parseHtmlToBlocks = (html: string) => {
    if (typeof window === 'undefined') return []
    const div = document.createElement('div')
    div.innerHTML = DOMPurify.sanitize(html)
    const blocks: OutputBlockData[] = []

    Array.from(div.children).forEach((node: Element) => {
      const tagName = node.tagName.toLowerCase()
      const content = node.innerHTML.trim()

      if (!content && tagName !== 'br' && tagName !== 'hr') return

      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          blocks.push({
            type: 'header',
            data: {
              text: content,
              level: parseInt(tagName.replace('h', ''))
            }
          })
          break
        case 'ul':
        case 'ol':
          blocks.push({
            type: 'list',
            data: {
              style: tagName === 'ul' ? 'unordered' : 'ordered',
              items: Array.from(node.children).map(li => li.innerHTML)
            }
          })
          break
        case 'blockquote':
          // Check if blockquote contains headers or other elements
          // For simplicity, treat as text
          blocks.push({
            type: 'quote',
            data: {
              text: content,
              caption: ''
            }
          })
          break
        case 'p':
        default:
           // Handle br in p or plain text
           if (content) {
             blocks.push({
               type: 'paragraph',
               data: {
                 text: content
               }
             })
           }
          break
      }
    })
    return blocks
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || editorRef.current) return

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default
      const Header = (await import('@editorjs/header')).default
      const List = (await import('@editorjs/list')).default
      const Quote = (await import('@editorjs/quote')).default
      const Underline = (await import('@editorjs/underline')).default
      const LinkTool = (await import('@editorjs/link')).default
      const edjsHTML = (await import('editorjs-html')).default

      const linkToolParser = (block: OutputBlockData) => {
        return `<a href="${block.data.link}" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 hover:underline">${block.data.link}</a>`
      }

      const edjsParser = edjsHTML({
        linkTool: linkToolParser
      })

      if (!containerRef.current) return

      const blocks = parseHtmlToBlocks(value || '')

      const editor = new EditorJS({
        holder: containerRef.current,
        placeholder: 'Scrie aici...',
        inlineToolbar: true,
        data: {
            blocks: blocks.length ? blocks : []
        },
        tools: {
          header: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: Header as any,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: List as any,
            inlineToolbar: true,
          },
          quote: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            class: Quote as any,
            inlineToolbar: true,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          underline: Underline as any,
          linkTool: {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             class: LinkTool as any,
             config: {
                 // Backend endpoint for url data fetching would go here
             }
          }
        },
        onChange: async () => {
          try {
            const savedData = await editor.save()
            
            // Validate savedData structure
            if (!savedData || !savedData.blocks) {
               console.warn('EditorJS: No blocks data found')
               return
            }

            const parsed = edjsParser.parse(savedData)
             
             if (Array.isArray(parsed)) {
                const html = parsed.join('')
                onChange(html)
             } else if (typeof parsed === 'string') {
                onChange(parsed)
             } else {
                console.error('EditorJS: Parser returned non-array/string:', parsed)
                // Fallback or ignore
             }
          } catch (e) {
            console.error('EditorJS: Change handler error:', e)
          }
        },
      })

      editorRef.current = editor
    }

    initEditor()

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
    // We only run this effect once on mount/ready. 
    // We rely on the internal state of editor for subsequent updates to avoid re-rendering loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  // Handle value updates after initialization (e.g. async data loading)
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.save().then((savedData) => {
        if (savedData.blocks.length === 0) {
          const blocks = parseHtmlToBlocks(value)
          if (blocks.length > 0) {
            editorRef.current?.render({ blocks })
          }
        }
      })
    }
  }, [value])

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "min-h-[200px] w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm shadow-sm prose prose-sm max-w-none dark:prose-invert editorjs-wrapper focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-200",
        className
      )}
    />
  )
}
