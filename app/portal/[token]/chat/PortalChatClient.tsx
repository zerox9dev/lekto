'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import type { Message } from '@/types'

interface PortalChatClientProps {
  token: string
  initialMessages: Message[]
}

export function PortalChatClient({ token, initialMessages }: PortalChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    const id = window.setInterval(async () => {
      const res = await fetch(`/api/portal/${token}/messages`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { messages?: Message[] }
      setMessages(data.messages ?? [])
    }, 5000)
    return () => window.clearInterval(id)
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = draft.trim()
    if (!text) return
    setSending(true)
    const res = await fetch(`/api/portal/${token}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text }),
    })
    setSending(false)
    if (!res.ok) {
      const data = (await res.json().catch(() => ({ error: 'Не удалось отправить' }))) as { error?: string }
      toast.error(data.error ?? 'Не удалось отправить')
      return
    }
    setDraft('')
    const refresh = await fetch(`/api/portal/${token}/messages`, { cache: 'no-store' })
    if (refresh.ok) {
      const data = (await refresh.json()) as { messages?: Message[] }
      setMessages(data.messages ?? [])
    }
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
              <div className={['max-w-[75%] rounded-xl px-3 py-2', isMine ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800'].join(' ')}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                <p className={`text-[11px] mt-1 ${isMine ? 'text-white/75' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
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
          maxLength={2000}
        />
        <Button size="sm" onClick={sendMessage} loading={sending} disabled={!draft.trim()}>
          Отпр.
        </Button>
      </div>
    </div>
  )
}
