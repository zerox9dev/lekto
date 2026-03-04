# STYLEGUIDE.md — Lekto

## Design Direction

**Hybrid: cal.com × Preply**

- **From cal.com** — radical whitespace, hairline borders, neutral grays, no shadows on containers, ultra-clean sidebar, monochrome base
- **From Preply** — brand accent (indigo/purple), card warmth, clear CTA hierarchy, friendly but professional

**Result** — minimal SaaS dashboard that feels premium without being cold. Dense enough to be productive, airy enough to feel modern.

---

## Stack

```
Radix UI          — headless primitives
Tailwind CSS v4   — all styling
tailwindcss-animate — transitions
react-day-picker  — calendar
sonner            — toasts
lucide-react      — icons
Inter             — font (next/font/google)
```

```bash
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-dropdown-menu \
  @radix-ui/react-popover @radix-ui/react-checkbox @radix-ui/react-tabs \
  @radix-ui/react-tooltip @radix-ui/react-separator @radix-ui/react-avatar \
  react-day-picker sonner lucide-react tailwindcss-animate
```

---

## Color System

```ts
// tailwind.config.ts — theme.extend.colors
{
  // Brand — from Preply's purple energy, cooler than Preply's exact purple
  brand: {
    50:  '#F0F0FF',
    100: '#E3E3FF',
    200: '#C7C7FF',
    500: '#6B6BFF',   // ← primary action color
    600: '#5353F5',   // ← hover
    700: '#3F3FD4',
  },

  // Neutrals — cal.com inspired gray scale
  gray: {
    0:   '#FFFFFF',
    50:  '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Status — muted, not loud
  success: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  warning: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  danger:  { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3' },
  info:    { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
}
```

---

## Typography

```
Font: Inter (variable)
Load: next/font/google with subsets: ['latin', 'cyrillic']

Page title    text-xl font-semibold text-gray-900 tracking-tight
Section title text-sm font-semibold text-gray-900
Label         text-xs font-medium text-gray-500 uppercase tracking-wide
Body          text-sm text-gray-600 leading-relaxed
Muted         text-xs text-gray-400
Code/mono     font-mono text-xs text-gray-700
```

---

## Spacing & Layout

```
Sidebar width:    240px (fixed)
Content max-w:    max-w-5xl
Page padding:     px-8 py-7
Section gap:      space-y-6
Card padding:     p-5 (compact) / p-6 (default)
Form field gap:   space-y-3
Input height:     h-9 (compact, like cal.com)
Button height:    h-9 (default) / h-8 (sm) / h-10 (lg)
```

---

## Core Components Style

### Cards
```
cal.com style — no shadow, only border:

bg-white rounded-xl border border-gray-200

NOT: shadow-md, shadow-lg
YES: shadow-sm is OK for modals/dropdowns only
```

### Sidebar (cal.com inspired)
```
bg-gray-50 border-r border-gray-200 w-60 h-screen

Nav item default:  px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100
Nav item active:   bg-white border border-gray-200 text-gray-900 font-medium shadow-sm
Nav icon:          w-4 h-4 text-gray-500 / active: text-brand-600

Subtle active state — white card with border on gray bg, like cal.com
```

### Inputs (compact)
```
h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900
placeholder:text-gray-400
hover:border-gray-300
focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500
transition-colors
```

### Buttons
```
Primary:     h-9 px-4 bg-brand-600 text-white rounded-lg text-sm font-medium
             hover:bg-brand-700 shadow-sm transition-colors

Secondary:   h-9 px-4 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium
             hover:bg-gray-50 transition-colors

Ghost:       h-9 px-3 text-gray-600 rounded-lg text-sm
             hover:bg-gray-100 hover:text-gray-900

Destructive: h-9 px-4 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium
             hover:bg-red-50 (NOT bg-red-600 — too aggressive for MVP)
```

### Dividers
```
<hr className="border-gray-100" />
or
<Separator className="bg-gray-100" />  ← Radix Separator
```

---

## Radix Styling Patterns

### Dialog / Modal
```tsx
// Overlay — subtle blur, not heavy black
<Dialog.Overlay className="fixed inset-0 bg-black/25 backdrop-blur-[2px] 
  animate-in fade-in duration-150" />

// Content — clean card, no heavy shadow
<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
  w-full max-w-[480px] bg-white rounded-xl border border-gray-200 shadow-xl p-6
  animate-in zoom-in-95 fade-in duration-150 outline-none" />
```

### Select
```tsx
<Select.Trigger className="flex h-9 w-full items-center justify-between
  rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900
  hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/15
  focus:border-brand-500 transition-colors data-[placeholder]:text-gray-400
  data-[state=open]:border-brand-500" />

<Select.Content className="z-50 min-w-[var(--radix-select-trigger-width)]
  overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg
  animate-in fade-in-80 zoom-in-95 duration-100" />

<Select.Item className="relative flex h-8 cursor-pointer select-none items-center
  rounded-md px-3 text-sm text-gray-700 outline-none
  data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-900
  data-[state=checked]:text-brand-600 data-[state=checked]:font-medium" />
```

### Checkbox
```tsx
<Checkbox.Root className="h-4 w-4 rounded border border-gray-300 bg-white
  data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600
  focus:outline-none focus:ring-2 focus:ring-brand-500/20
  transition-colors cursor-pointer" />
```

### Dropdown Menu
```tsx
<DropdownMenu.Content className="z-50 min-w-[180px] rounded-lg border border-gray-200
  bg-white p-1 shadow-lg animate-in fade-in-80 zoom-in-95 duration-100" />

<DropdownMenu.Item className="flex h-8 cursor-pointer select-none items-center
  rounded-md px-3 text-sm text-gray-700 outline-none gap-2
  data-[highlighted]:bg-gray-50 data-[highlighted]:text-gray-900" />

<DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
```

---

## Status Badges

Muted pill style — not loud, information not decoration:

```
planned:   bg-amber-50  text-amber-700  border border-amber-200  "Запланирован"
done:      bg-green-50  text-green-700  border border-green-200  "Проведён"
cancelled: bg-gray-100  text-gray-500   border border-gray-200   "Отменён"
assigned:  bg-blue-50   text-blue-700   border border-blue-200   "Задано"
submitted: bg-amber-50  text-amber-700  border border-amber-200  "Сдано"
reviewed:  bg-green-50  text-green-700  border border-green-200  "Проверено"
active:    bg-green-50  text-green-700  border border-green-200  "Активен"
archived:  bg-gray-100  text-gray-400   border border-gray-100   "Архив"

Base: inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium
```

---

## Tables (cal.com style)

```
No outer border on table itself. Only row dividers.

<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-100">
      <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-50">   ← very subtle row divider
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="py-3 text-sm text-gray-700">
```

---

## Empty States

```
Centered, icon + text, very minimal:

<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-full bg-gray-100 p-3 mb-4">
    <Icon className="w-5 h-5 text-gray-400" />
  </div>
  <p className="text-sm font-medium text-gray-900 mb-1">Нет учеников</p>
  <p className="text-xs text-gray-400 mb-4">Добавьте первого ученика</p>
  <Button size="sm">+ Добавить</Button>
</div>
```

---

## Reference Screenshots to Study

Before writing any new page UI, reference these visually:
- **cal.com/dashboard** — sidebar nav, table rows, empty states, button style
- **app.preply.com** — card layout, stats, student list
- **linear.app** — keyboard shortcuts feel, density, subtle interactions

---

## Anti-patterns (never do)

```
❌ bg-gray-800 sidebar (too dark, not our style)
❌ Colored section backgrounds (keep everything white/gray-50)
❌ border-radius > rounded-xl
❌ shadow-xl on cards (only on modals/dropdowns)
❌ Multiple font weights on same line
❌ Colored icons (always text-gray-400 or text-gray-500, active: text-brand-600)
❌ All-caps text outside of table headers and labels
❌ Gradients anywhere in the app UI (landing page only if needed)
```
