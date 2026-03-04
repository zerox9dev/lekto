'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SelectField } from '@/components/ui/SelectField'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { HomeworkStatus } from '@/types'

const STATUS_OPTIONS = [
  { value: 'assigned',  label: 'Задано' },
  { value: 'submitted', label: 'Сдано' },
  { value: 'reviewed',  label: 'Проверено' },
]

interface HomeworkDetailClientProps {
  homeworkId: string
  initialStatus: HomeworkStatus
  initialComment: string | null
  fileUrl: string | null
}

export function HomeworkDetailClient({
  homeworkId,
  initialStatus,
  initialComment,
  fileUrl,
}: HomeworkDetailClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [comment, setComment] = useState(initialComment ?? '')
  const [editingComment, setEditingComment] = useState(false)
  const [savingComment, setSavingComment] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingFile, setLoadingFile] = useState(false)

  async function updateField(field: string, value: unknown) {
    const supabase = createClient()
    const { error } = await supabase
      .from('homework')
      .update({ [field]: value })
      .eq('id', homeworkId)
    if (error) { toast.error(error.message); return false }
    router.refresh()
    return true
  }

  async function handleStatusChange(val: string) {
    const newStatus = val as HomeworkStatus
    setStatus(newStatus)
    const ok = await updateField('status', newStatus)
    if (ok) toast.success('Статус обновлён')
  }

  async function handleSaveComment() {
    setSavingComment(true)
    const ok = await updateField('teacher_comment', comment || null)
    setSavingComment(false)
    if (ok) { toast.success('Комментарий сохранён'); setEditingComment(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/homework/${homeworkId}`, { method: 'DELETE' })
    setDeleting(false)
    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: 'Не удалось удалить задание' }))
      toast.error(payload.error ?? 'Не удалось удалить задание')
      return
    }
    toast.success('Задание удалено')
    router.push('/homework')
    router.refresh()
  }

  async function handleDownloadFile() {
    if (!fileUrl) return
    setLoadingFile(true)
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('homework-files')
      .createSignedUrl(fileUrl, 3600)

    setLoadingFile(false)
    if (error || !data) { toast.error('Не удалось получить файл'); return }
    window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Status + Delete */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-wrap items-center gap-4">
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
        <div className="ml-auto">
          <ConfirmDialog
            trigger={<Button variant="destructive" size="sm">Удалить</Button>}
            title="Удалить задание?"
            description="Это действие нельзя отменить. Прикреплённый файл будет удалён."
            confirmLabel="Удалить"
            variant="destructive"
            loading={deleting}
            onConfirm={handleDelete}
          />
        </div>
      </div>

      {/* File */}
      {fileUrl !== null && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Файл ученика</h3>
          {fileUrl ? (
            <Button
              variant="secondary"
              size="sm"
              loading={loadingFile}
              onClick={handleDownloadFile}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Открыть файл
            </Button>
          ) : (
            <p className="text-sm text-gray-400">Ученик не прикрепил файл</p>
          )}
        </div>
      )}

      {/* Teacher comment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Комментарий репетитора</h3>
          {!editingComment && (
            <Button variant="ghost" size="sm" onClick={() => setEditingComment(true)}>
              Редактировать
            </Button>
          )}
        </div>

        {editingComment ? (
          <div className="space-y-3">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Хорошо выполнено! Обрати внимание на..."
              rows={4}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setComment(initialComment ?? ''); setEditingComment(false) }}
              >
                Отмена
              </Button>
              <Button variant="primary" size="sm" loading={savingComment} onClick={handleSaveComment}>
                Сохранить
              </Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm whitespace-pre-wrap ${comment ? 'text-gray-700' : 'text-gray-400 italic'}`}>
            {comment || 'Нет комментария. Нажмите «Редактировать» чтобы добавить.'}
          </p>
        )}
      </div>
    </div>
  )
}
