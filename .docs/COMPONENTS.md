# COMPONENTS.md — Lekto

## Component Hierarchy

```
components/
├── ui/                        # Base primitives — build once, used everywhere
│   ├── Button.tsx             # variants: primary / secondary / ghost / destructive
│   ├── Input.tsx              # text input with error state
│   ├── Textarea.tsx           # multiline input
│   ├── Label.tsx              # form label
│   ├── Modal.tsx              # wraps Radix Dialog
│   ├── SelectField.tsx        # wraps Radix Select
│   ├── CheckboxField.tsx      # wraps Radix Checkbox
│   ├── DatePicker.tsx         # Radix Popover + react-day-picker
│   ├── Tabs.tsx               # wraps Radix Tabs
│   ├── Tooltip.tsx            # wraps Radix Tooltip
│   ├── Avatar.tsx             # wraps Radix Avatar
│   └── Spinner.tsx            # loading spinner (pure CSS/Tailwind)
│
├── shared/                    # App-wide layout and patterns
│   ├── AppShell.tsx           # Sidebar + main content wrapper
│   ├── Sidebar.tsx            # Navigation (uses Radix Separator)
│   ├── PageHeader.tsx         # Page title + optional action button
│   ├── StatusBadge.tsx        # Status pill — ALL status rendering goes here
│   ├── EmptyState.tsx         # Empty list placeholder
│   ├── ConfirmDialog.tsx      # Destructive action confirmation (uses Modal)
│   ├── FileUpload.tsx         # Supabase Storage upload
│   └── SkeletonCard.tsx       # Loading skeleton for cards
│
├── students/
│   ├── StudentCard.tsx
│   ├── StudentForm.tsx
│   └── StudentStats.tsx
│
├── lessons/
│   ├── LessonRow.tsx
│   ├── LessonForm.tsx
│   ├── LessonNotes.tsx
│   └── WeekCalendar.tsx
│
└── homework/
    ├── HomeworkCard.tsx
    ├── HomeworkForm.tsx
    └── HomeworkFile.tsx
```

---

## ui/ Components (API reference)

### Button

```tsx
<Button variant="primary" size="md" disabled={false} onClick={...}>
  Сохранить
</Button>

// With icon
<Button variant="secondary" size="sm">
  <Plus className="w-4 h-4" />
  Добавить
</Button>

// As link (asChild pattern)
<Button asChild variant="primary">
  <Link href="/students/new">+ Ученик</Link>
</Button>
```

Props: `variant`, `size`, `disabled`, `loading`, `asChild`, `className`, all native button props.

---

### Input

```tsx
<Input
  placeholder="Имя ученика"
  error="Обязательное поле"   // shows red border + error text below
  {...register('name')}
/>
```

Props: all native input props + `error?: string`

---

### Modal

```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  title="Новый ученик"
  description="Заполните данные"   // optional
  trigger={<Button>Открыть</Button>}  // optional — or control with open prop
>
  {/* content */}
</Modal>
```

Props: `open`, `onOpenChange`, `title`, `description?`, `trigger?`, `children`, `size?: 'sm'|'md'|'lg'`

---

### SelectField

```tsx
<SelectField
  value={value}
  onValueChange={onChange}
  placeholder="Выберите уровень"
  options={[
    { value: 'A1', label: 'A1 — Начальный' },
    { value: 'B2', label: 'B2 — Выше среднего' },
  ]}
  error={errors.level?.message}
/>
```

Props: `value`, `onValueChange`, `placeholder`, `options: {value, label}[]`, `error?`, `disabled?`

---

### DatePicker

```tsx
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Выберите дату"
  error={errors.date?.message}
  disabled={(date) => date < new Date()}  // optional disabler
/>
```

Internally: `Radix Popover` trigger + `react-day-picker` calendar inside.

---

### CheckboxField

```tsx
<CheckboxField
  id="is_paid"
  label="Урок оплачен"
  checked={checked}
  onCheckedChange={setChecked}
/>
```

---

## shared/ Components (API reference)

### PageHeader

```tsx
<PageHeader
  title="Ученики"
  description="8 активных"          // optional
  action={
    <Button asChild>
      <Link href="/students/new"><Plus className="w-4 h-4" />Добавить</Link>
    </Button>
  }
/>
```

---

### StatusBadge

```tsx
<StatusBadge status="done" />
<StatusBadge status="assigned" />
```

Accepts: `LessonStatus | HomeworkStatus | StudentStatus`
Never render status manually. Always use this component.

---

### EmptyState

```tsx
<EmptyState
  icon={<Users className="w-10 h-10 text-slate-300" />}
  title="Нет учеников"
  description="Добавьте первого ученика"
  action={<Button size="sm" asChild><Link href="/students/new">+ Добавить</Link></Button>}
/>
```

Props: `icon`, `title`, `description?`, `action?`

---

### ConfirmDialog

```tsx
<ConfirmDialog
  trigger={<Button variant="destructive" size="sm">Удалить</Button>}
  title="Удалить ученика?"
  description="Это действие нельзя отменить."
  onConfirm={handleDelete}
  confirmLabel="Удалить"
  variant="destructive"
  loading={isDeleting}
/>
```

---

### FileUpload

```tsx
<FileUpload
  bucket="homework-files"
  path={`${userId}/${studentId}`}
  accept=".pdf,.jpg,.png"
  maxSizeMB={10}
  onUpload={(filePath) => setValue('file_url', filePath)}
  currentPath={homework?.file_url}
/>
```

---

## Rules

1. **`ui/` components wrap Radix once** — never use raw Radix primitives outside `ui/`. Feature components import from `ui/`, not from `@radix-ui` directly.
2. **No inline Radix** — if you need a Dialog in a feature component, use `<Modal>` from `ui/`, not `Dialog.Root` directly.
3. **No data fetching in `ui/` or `shared/`** — only pages fetch, pass as props.
4. **Client Components only when needed** — interactivity, hooks, form state. Mark with `'use client'`.
5. **One component per file** — no multiple exports per file.
6. **`asChild` for polymorphism** — use Radix `asChild` pattern when Button needs to render as `<Link>`.
