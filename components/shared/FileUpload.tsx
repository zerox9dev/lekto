'use client'

import { useRef, useState } from 'react'
import { Paperclip, X, Loader2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FileUploadProps {
  studentId: string
  onUpload: (path: string) => void
  currentPath?: string | null
  onRemove?: () => void
  accept?: string
  maxSizeMB?: number
}

export function FileUpload({
  studentId,
  onUpload,
  currentPath,
  onRemove,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Файл слишком большой. Максимум ${maxSizeMB} МБ`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Не авторизован'); setUploading(false); return }

    const path = `${user.id}/${studentId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('homework-files').upload(path, file)

    if (error) {
      toast.error('Ошибка загрузки файла')
      setUploading(false)
      return
    }

    onUpload(path)
    toast.success('Файл прикреплён')
    setUploading(false)
    // Reset input
    if (inputRef.current) inputRef.current.value = ''
  }

  const fileName = currentPath?.split('/').pop()

  return (
    <div>
      {currentPath ? (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700 truncate flex-1">{fileName}</span>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading || !studentId}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
          {uploading ? 'Загрузка...' : 'Прикрепить файл'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      {!studentId && (
        <p className="mt-1 text-xs text-gray-400">Сначала выберите ученика</p>
      )}
    </div>
  )
}
