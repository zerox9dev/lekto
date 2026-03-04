'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Message } from '@/types'

interface StudentChatClientProps {
  studentId: string
  initialMessages: Message[]
}

const MAX_MESSAGE_LENGTH = 2000

export function StudentChatClient({ studentId, initialMessages }: StudentChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const markTutorMessagesAsRead = useCallback(async () => {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('student_id', studentId)
      .eq('sender_role', 'tutor')
      .is('read_at', null)
  }, [studentId, supabase])

  useEffect(() => {
    void markTutorMessagesAsRead()
    const channel = supabase
      .channel(`chat:${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `student_id=eq.${studentId}`,
        },
        (payload) => {
          const incoming = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev
            return [...prev, incoming]
          })
          if (incoming.sender_role === 'tutor') {
            void markTutorMessagesAsRead()
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [markTutorMessagesAsRead, studentId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = draft.trim()
    if (!text) return
    if (text.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Максимум ${MAX_MESSAGE_LENGTH} символов`)
      return
    }

    setSending(true)
    const { error } = await supabase.from('messages').insert({
      student_id: studentId,
      sender_role: 'student',
      body: text,
    })
    setSending(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setDraft('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-[70vh] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h1 className="text-sm font-semibold text-gray-900">Чат с репетитором</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_role === 'student'
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={[
                  'max-w-[75%] rounded-xl px-3 py-2',
                  isMine ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800',
                ].join(' ')}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={`text-[11px] mt-1 ${isMine ? 'text-white/75' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ru', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-100 p-3 flex items-center gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void sendMessage()
            }
          }}
          placeholder="Введите сообщение..."
          className="min-h-[40px] max-h-28 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500"
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <Button size="sm" onClick={sendMessage} loading={sending} disabled={!draft.trim()}>
          Отпр.
        </Button>
      </div>
    </div>
  )
}
