# Lekto — Документація проекту

> Платформа для репетиторів: уроки, курси, інтерактивні домашки, публічне посилання учню.
>
> **Репо:** github.com/zerox9dev/lekto
> **Домен:** lekto.online
> **Деплой:** Vercel

---

## Стек

| Що | Чим |
|----|-----|
| Framework | Vite 7 + React 19 |
| Мова | TypeScript 5.9 |
| Стилі (лендінг) | CSS Modules (`landing.module.css`) — НЕ Tailwind |
| Стилі (кабінет) | Tailwind CSS v4 |
| UI (кабінет) | Radix UI (Dialog, Tabs, Select, Dropdown, Tooltip) — НЕ shadcn |
| Бекенд | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Auth | Google OAuth через Supabase |
| Деплой | Vercel (автодеплой з main) |
| Тести | Vitest + @testing-library/react |
| Шрифт | Inter (Google Fonts, підключений в index.html) |
| Шрифт (лендінг) | Georgia (serif) для заголовків |

**Файлів:** 28 · **Рядків коду:** ~4,600 · **Комітів:** 100

---

## Правила (ОБОВ'ЯЗКОВО)

### Дизайн
- **Лендінг:** CSS Modules only, БЕЗ Tailwind. Cream стиль: bg `#f5f3ee`, text `#1a1a1a`, accent green `#2d5a3d`, border `#e8e5de`
- **Кабінет:** Tailwind v4 + Radix UI. Cream palette: `#f5f3ee`, `#f0ede6`, `#e8e5de`, `#1a1a1a`, `#888`
- **БЕЗ shadcn** — тільки Radix UI примітиви
- **БЕЗ тіней** — flat дизайн, rounded-2xl
- **БЕЗ dark theme** — тільки light
- **Serif заголовки** (Georgia) на лендінгу, pill-shaped кнопки
- **Мова інтерфейсу:** російська

### Код
- **Supabase-only** — БЕЗ localStorage для даних. Store читає/пише тільки Supabase
- **Auth:** Google OAuth only, без email/password
- **VITE_ env vars** видно в бандлі — секрети тільки на бекенді (Edge Functions)
- **Supabase typing:** `createClient<any>` + `(supabase as any)` для обходу TS помилок
- **Файли:** до 200 рядків максимум
- **Git email:** `zerox9dev <zerox9dev.work@icloud.com>`
- **НІКОЛИ не force push**
- **Тести:** виключені з білду через `tsconfig.app.json` exclude

### Дані
- **RLS ізоляція:** кожен репетитор бачить тільки свої дані (`tutor_id = auth.uid()::text`)
- **Anon read:** для публічних сторінок учнів (`/s/:shareId`)
- **Cascade delete:** студент → уроки → домашки
- **Курси:** видалення курсу НЕ видаляє уроки — тільки відлінковує (`course_id = null`)
- **Upload:** файли в Supabase Storage, bucket `media`, імена sanitize (кирилиця → `_`)

---

## Архітектура

```
src/
├── App.tsx                       # Router
├── main.tsx                      # Entry point
├── index.css                     # Tailwind import
├── lib/
│   ├── store.ts                  # Supabase-only reactive store (~230 рядків)
│   ├── api.ts                    # Supabase API helpers (students, lessons, homework)
│   ├── auth-context.tsx          # Google OAuth context + AuthProvider
│   ├── supabase.ts               # Supabase client (optional via VITE_ env)
│   ├── starter-courses.ts        # Готові курси-шаблони (Польський A1)
│   └── utils.ts                  # cn()
├── components/
│   ├── section-player.tsx        # Інтерактивний плеєр секцій (quiz, cards, etc.)
│   └── sections-editor.tsx       # Редактор секцій для репетитора
├── pages/
│   ├── landing.tsx               # / — лендінг (CSS Modules)
│   ├── landing.module.css        # Стилі лендінгу
│   ├── login.tsx                 # /login — Google auth
│   ├── student-view.tsx          # /s/:shareId — портал учня (public, Supabase fetch)
│   └── app/
│       ├── layout.tsx            # Sidebar + mobile nav + routes
│       ├── dashboard.tsx         # /app — дашборд
│       ├── students.tsx          # /app/students — список учнів
│       ├── student-detail.tsx    # /app/students/:id — деталі учня
│       ├── courses.tsx           # /app/courses — список курсів + стартові шаблони
│       ├── course-detail.tsx     # /app/courses/:id — деталі курсу
│       ├── lessons.tsx           # /app/lessons — всі уроки
│       ├── homework-list.tsx     # /app/homework — всі домашки
│       ├── section-editor.tsx    # /app/homework/new|edit — редактор секцій
│       └── settings.tsx          # /app/settings — профіль
├── types/
│   └── database.ts               # Student, Lesson, Homework, Course, HomeworkSection, etc.
├── __tests__/
│   └── store-logic.test.ts       # 38 тестів store logic
└── test/
    ├── store.test.ts             # 17 тестів store CRUD
    ├── share-slug.test.ts        # 2 тести
    └── filename-sanitize.test.ts # 6 тестів
```

---

## Supabase таблиці

### students
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID PK | |
| name | TEXT | Ім'я учня |
| telegram | TEXT | Telegram контакт |
| share_id | TEXT UNIQUE | Публічний slug для `/s/:shareId` |
| tutor_id | TEXT | `auth.uid()` репетитора |
| created_at | TIMESTAMPTZ | |

### lessons
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID PK | |
| student_id | UUID FK → students | Учень (CASCADE) |
| tutor_id | TEXT | `auth.uid()` репетитора |
| title | TEXT | Назва уроку |
| date | DATE | Дата уроку |
| notes | TEXT | Конспект |
| materials_url | TEXT | Посилання на матеріали |
| sections | JSONB | Інтерактивні секції уроку |
| course_id | UUID FK → courses | Курс (ON DELETE SET NULL) |
| order_index | INT | Порядок в курсі |
| created_at | TIMESTAMPTZ | |

### homework
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID PK | |
| lesson_id | UUID FK → lessons | Урок (CASCADE) |
| student_id | UUID FK → students | Учень (CASCADE) |
| tutor_id | TEXT | `auth.uid()` репетитора |
| title | TEXT | Назва домашки |
| sections | JSONB | Масив HomeworkSection |
| completed | BOOLEAN | Чи виконана |
| student_answers | JSONB | Відповіді учня |
| scores | JSONB | Бали per-section |
| created_at | TIMESTAMPTZ | |

### courses
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID PK | |
| title | TEXT | Назва курсу |
| description | TEXT | Опис |
| tutor_id | TEXT | `auth.uid()` репетитора |
| created_at | TIMESTAMPTZ | |

### Supabase Storage
- Bucket: `media` (public)
- Upload path: `uploads/{uuid}_{sanitized_filename}`
- Sanitize: `file.name.replace(/[^a-zA-Z0-9._-]/g, "_")`

---

## Типи секцій (HomeworkSection)

| Тип | Опис | Оцінюється |
|-----|------|------------|
| `quiz` | Тест з варіантами (single/multi-select) | ✅ |
| `fill_blanks` | Текст з пропусками `___` | ✅ |
| `matching` | З'єднати пари | ✅ |
| `ordering` | Розставити по порядку | ✅ |
| `true_false` | Правда/неправда | ✅ |
| `open_answer` | Відкрита відповідь | ❌ |
| `cards` | Флешкартки (front/back) | ❌ |
| `text` | Просто текст | ❌ |
| `media` | Файли (зображення, PDF, аудіо) | ❌ |

---

## Роути

| Шлях | Сторінка | Auth |
|------|----------|------|
| `/` | Лендінг | ❌ |
| `/login` | Google OAuth | ❌ |
| `/s/:shareId` | Портал учня | ❌ (anon) |
| `/app` | Дашборд | ✅ |
| `/app/students` | Список учнів | ✅ |
| `/app/students/:id` | Деталі учня | ✅ |
| `/app/courses` | Курси | ✅ |
| `/app/courses/:id` | Деталі курсу | ✅ |
| `/app/lessons` | Уроки | ✅ |
| `/app/homework` | Домашки | ✅ |
| `/app/settings` | Налаштування | ✅ |

---

## Готові курси-шаблони

- **Польський A1** — 12 уроків: приветствия, числа, профессии, семья, дни недели, магазин, ресторан, транспорт, погода, хобби, здоровье, финальный тест. Перші 6 з повним контентом (флешкартки, квізи, fill_blanks, matching, ordering, true/false, open_answer).

---

## RLS Policy

```sql
-- Репетитор бачить тільки свої дані
FOR SELECT/INSERT/UPDATE/DELETE TO authenticated
  USING/WITH CHECK (tutor_id = auth.uid()::text)

-- Учень (anon) може читати все + оновлювати homework (відповіді)
FOR SELECT TO anon USING (true)
FOR UPDATE ON homework TO anon USING (true)
```

---

*Останнє оновлення: 2026-03-12*
