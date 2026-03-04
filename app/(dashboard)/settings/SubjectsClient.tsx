'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { Subject } from '@/types'

const PRESET_COLORS = [
  '#6B6BFF', '#3B82F6', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
]

interface SubjectsClientProps {
  subjects: Subject[]
}

export function SubjectsClient({ subjects: initial }: SubjectsClientProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState(initial)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subjects')
      .insert({ name: newName.trim(), color: newColor })
      .select()
      .single()

    if (error) { toast.error(error.message); setAdding(false); return }
    setSubjects((prev) => [...prev, data as Subject])
    setNewName('')
    setNewColor(PRESET_COLORS[0])
    toast.success('Предмет добавлен')
    setAdding(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) { toast.error(error.message); setDeletingId(null); return }
    setSubjects((prev) => prev.filter((s) => s.id !== id))
    toast.success('Предмет удалён')
    setDeletingId(null)
    router.refresh()
  }

  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Предметы</h2>
      <p className="text-xs text-gray-400 mb-4">
        Предметы используются для цветовой маркировки учеников и уроков
      </p>

      {/* List */}
      <div className="space-y-2 mb-4">
        {subjects.length === 0 && (
          <p className="text-sm text-gray-400 py-2">Нет предметов. Добавьте первый.</p>
        )}
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
          >
            <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <span className="text-sm text-gray-700 flex-1">{subject.name}</span>
            <ConfirmDialog
              trigger={
                <button className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              }
              title={`Удалить «${subject.name}»?`}
              description="Ученики и уроки этого предмета останутся, но потеряют привязку."
              confirmLabel="Удалить"
              variant="destructive"
              loading={deletingId === subject.id}
              onConfirm={() => handleDelete(subject.id)}
            />
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2">
        {/* Color picker */}
        <div className="flex items-center gap-1.5 shrink-0">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewColor(color)}
              className={`w-5 h-5 rounded-full transition-transform ${
                newColor === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <Input
          placeholder="Название предмета (напр. Польский)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="flex-1"
        />

        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={adding}
          onClick={handleAdd}
          disabled={!newName.trim()}
        >
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </div>
    </section>
  )
}
