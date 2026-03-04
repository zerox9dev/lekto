'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { SelectField } from '@/components/ui/SelectField'
import { CheckboxField } from '@/components/ui/CheckboxField'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { STATUS_OPTIONS } from '@/lib/validations/lesson'
import type { LessonStatus } from '@/types'

interface LessonDetailClientProps {
  lessonId: string
  initialStatus: LessonStatus
  initialIsPaid: boolean
  initialNotes: string | null
}

export function LessonDetailClient({
  lessonId,
  initialStatus,
  initialIsPaid,
  initialNotes,
}: LessonDetailClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [isPaid, setIsPaid] = useState(initialIsPaid)
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function updateField(field: string, value: unknown) {
    const supabase = createClient()
    const { error } = await supabase
      .from('lessons')
      .update({ [field]: value })
      .eq('id', lessonId)
    if (error) { toast.error(error.message); return false }
    router.refresh()
    return true
  }

  async function handleStatusChange(val: string) {
    const newStatus = val as LessonStatus
    setStatus(newStatus)
    const ok = await updateField('status', newStatus)
    if (ok) toast.success('Статус обновлён')
  }

  async function handlePaidToggle(val: boolean) {
    setIsPaid(val)
    const ok = await updateField('is_paid', val)
    if (ok) toast.success(val ? 'Урок отмечен оплаченным' : 'Оплата снята')
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    const ok = await updateField('notes', notes || null)
    setSavingNotes(false)
    if (ok) { toast.success('Заметки сохранены'); setEditingNotes(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
    if (error) { toast.error(error.message); setDeleting(false); return }
    toast.success('Урок удалён')
    router.push('/lessons')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Status + Payment inline controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Статус</span>
          <div className="w-44">
            <SelectField
              value={status}
              onValueChange={handleStatusChange}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>
        <CheckboxField
          id="is_paid"
          label="Урок оплачен"
          checked={isPaid}
          onCheckedChange={handlePaidToggle}
        />
        <div className="ml-auto">
          <ConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">Удалить урок</Button>
            }
            title="Удалить урок?"
            description="Это действие нельзя отменить. Связанные ДЗ останутся."
            confirmLabel="Удалить"
            variant="destructive"
            loading={deleting}
            onConfirm={handleDelete}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Заметки после урока</h3>
          {!editingNotes && (
            <Button variant="ghost" size="sm" onClick={() => setEditingNotes(true)}>
              Редактировать
            </Button>
          )}
        </div>

        {editingNotes ? (
          <div className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Что прошли, что вызвало сложности, что повторить..."
              rows={5}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setNotes(initialNotes ?? ''); setEditingNotes(false) }}
              >
                Отмена
              </Button>
              <Button variant="primary" size="sm" loading={savingNotes} onClick={handleSaveNotes}>
                Сохранить
              </Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm whitespace-pre-wrap ${notes ? 'text-gray-700' : 'text-gray-400 italic'}`}>
            {notes || 'Нет заметок. Нажмите «Редактировать» чтобы добавить.'}
          </p>
        )}
      </div>
    </div>
  )
}
