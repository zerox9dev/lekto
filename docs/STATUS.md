# Lekto — Статус проекту

> Платформа для репетиторів: уроки, інтерактивні домашки, публічне посилання учню.
> 
> **Репо:** github.com/zerox9dev/lekto  
> **Домен:** lekto.online  
> **Деплой:** Vercel  

---

## 📊 Стек

| Що | Чим |
|----|-----|
| Framework | Vite 7 + React 19 |
| Мова | TypeScript 5.9 |
| Стилі | Tailwind CSS v4 |
| UI | Radix UI (Dialog, Tabs, Select, Dropdown, Tooltip) |
| Дані | localStorage (cross-tab sync) → міграція на Supabase |
| Auth | Google OAuth через Supabase |
| Деплой | Vercel |
| Тести | 46 тестів (Python + Vitest) |

**Файлів:** 16 · **Рядків коду:** ~1,700 · **Комітів:** 55

---

## ✅ Що зроблено

### Ядро
- [x] Scaffold: Vite 7, React 19, TS, Tailwind v4, Radix UI
- [x] Routing: `/` landing, `/login` auth, `/app/*` кабінет, `/s/:shareId` портал учня
- [x] Auth: Google OAuth через Supabase (fake local user коли без Supabase)
- [x] localStorage store з cross-tab sync (`storage` event)
- [x] Supabase API layer готовий (`api.ts`) — ще не підключений

### Учні (Students)
- [x] CRUD: додати, редагувати, видалити
- [x] Поле Telegram (замість email)
- [x] DiceBear Thumbs аватарки (seed = імʼя)
- [x] Share link: копіювання посилання `/s/:shareId`
- [x] Каскадне видалення: учень → уроки → домашки
- [x] Список: аватарка, імʼя, telegram, кількість уроків/завдань

### Уроки (Lessons)
- [x] CRUD: додати, редагувати, видалити
- [x] Привʼязані до учня (`student_id`)
- [x] Дата + нотатки (конспект)
- [x] Каскадне видалення: урок → домашки
- [x] Expandable cards в кабінеті репетитора

### Домашки (Homework)
- [x] CRUD: додати, редагувати, видалити
- [x] **Завжди привʼязані до уроку** (`lesson_id` обовʼязковий)
- [x] Multi-section: одне завдання може мати кілька секцій різних типів
- [x] Кнопка "+ Добавить домашку" всередині кожного уроку

### 6 типів секцій
- [x] **Quiz** — тест з варіантами, підсвітка правильних/неправильних
- [x] **Fill blanks** — текст з `___` пропусками, case-insensitive перевірка
- [x] **Matching** — зʼєднати пари, перемішані варіанти (dropdown)
- [x] **Ordering** — розставити по порядку (кнопки вверх/вниз)
- [x] **Cards** — флешкартки (перевернути, навігація)
- [x] **Text** — просто текст завдання (не оцінюється)

### Scoring & Completion
- [x] Автоматичний підрахунок балів per-section
- [x] Gradable: quiz, fill_blanks, matching, ordering
- [x] Non-gradable: cards, text (не впливають на completion)
- [x] Середній бал по домашці
- [x] Кольорові оцінки: ≥80% 🟢, ≥50% 🟡, <50% 🔴
- [x] Auto-completion коли всі gradable секції відповідні

### Портал учня (`/s/:shareId`)
- [x] Публічна сторінка без реєстрації
- [x] `noindex` — не індексується пошуковиками
- [x] Список уроків → клік → повноекранна сторінка уроку
- [x] Конспект + інтерактивні плеєри для домашок
- [x] Sticky header з логотипом
- [x] Результат зберігається в localStorage

### Кабінет репетитора (`/app`)
- [x] Student-centric: клік на учня → `/app/students/:id`
- [x] Sidebar: тільки Ученики + Настройки
- [x] Статистика: кількість уроків, завдань, середній бал
- [x] Посилання на портал учня (копіювання + відкрити)

### Дизайн
- [x] Zinc palette (zinc-900 акценти, zinc-50 фон)
- [x] Inter font, rounded-2xl
- [x] Dashed empty states
- [x] Весь інтерфейс російською
- [x] Clean UA/RU designer стиль (не generic template)

### Тести
- [x] 46 тестів — все зелене
- [x] Student/Lesson/Homework CRUD + cascade delete
- [x] Всі 6 типів scoring
- [x] Completion logic, average score
- [x] Full e2e flow

### Інфраструктура
- [x] Vercel деплой налаштований
- [x] vercel.json з SPA rewrites
- [x] Git email: `zerox9dev.work@icloud.com`

---

## 🔨 Що далі (TODO)

### Phase 2: Supabase

| # | Задача | Пріоритет |
|---|--------|-----------|
| 1 | SQL міграції: students, lessons, homework таблиці + RLS | 🔴 High |
| 2 | Переключити store з localStorage на Supabase API | 🔴 High |
| 3 | Реалтайм sync (Supabase Realtime) | 🟡 Medium |
| 4 | Портал учня: читати з Supabase (без auth) | 🔴 High |

### Phase 3: Mobile + UX

| # | Задача | Пріоритет |
|---|--------|-----------|
| 5 | Mobile navigation: bottom tab bar | 🔴 High |
| 6 | Responsive layout для планшетів | 🟡 Medium |
| 7 | Pull-to-refresh на мобільному | 🟢 Low |

### Phase 4: Фічі

| # | Задача | Пріоритет |
|---|--------|-----------|
| 8 | Дедлайни для домашок | 🟡 Medium |
| 9 | Дублювання домашки (шаблони) | 🟡 Medium |
| 10 | Повторне проходження домашки (re-take) | 🟡 Medium |
| 11 | Progress dashboard для репетитора | 🟡 Medium |
| 12 | Telegram нотифікації учню | 🟢 Low |
| 13 | Drag & drop для ordering (замість кнопок) | 🟢 Low |
| 14 | Аудіо секції (listening) | 🟢 Low |
| 15 | Writing секції (відкрита відповідь) | 🟢 Low |
| 16 | Bulk import учнів | 🟢 Low |

### Phase 5: Монетизація

| # | Задача | Пріоритет |
|---|--------|-----------|
| 17 | Landing page оновлення | 🟡 Medium |
| 18 | Pricing: Free vs Pro | 🟡 Medium |
| 19 | Stripe інтеграція | 🟢 Low |
| 20 | i18n: EN + UK + RU | 🟢 Low |

---

## 🏗 Архітектура

```
src/
├── App.tsx                    # Router
├── main.tsx                   # Entry
├── lib/
│   ├── store.ts               # localStorage + cross-tab sync (155 рядків)
│   ├── api.ts                 # Supabase API (готовий, не підключений)
│   ├── auth-context.tsx        # Google OAuth
│   ├── supabase.ts            # Client (optional)
│   └── utils.ts               # cn()
├── pages/
│   ├── landing.tsx            # / — лендінг
│   ├── login.tsx              # /login — Google auth
│   ├── student-view.tsx       # /s/:shareId — портал учня (433 рядки)
│   └── app/
│       ├── layout.tsx         # Sidebar + outlet
│       ├── students.tsx       # /app — список учнів
│       ├── student-detail.tsx # /app/students/:id — деталі (442 рядки)
│       └── settings.tsx       # /app/settings
├── types/
│   └── database.ts            # Student, Lesson, Homework, HomeworkSection, etc.
└── __tests__/
    └── store-logic.test.ts    # Vitest тести
```

### Ключові рішення

1. **Radix UI, НЕ shadcn** — оператор явно сказав
2. **localStorage first** → Supabase пізніше
3. **Домашки привʼязані до уроків** — без "Без урока"
4. **Student-centric навігація** — клік учень → деталі (не окремі сторінки)
5. **Портал учня: повноекранні сторінки уроків** — не акордеон
6. **Російська мова інтерфейсу**
7. **Telegram замість email** для контакту учня

---

*Останнє оновлення: 2026-03-07*
