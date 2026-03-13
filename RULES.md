# Lekto Project Rules

> Цей файл — жорсткі правила. Порушення = баг.

## Hard Rules (НІКОЛИ не порушувати)

1. **Max 150 рядків на файл** (200 абсолютний максимум для складних компонентів)
2. **Без тіней** — ніяких shadow-sm, shadow-md, shadow-lg, shadow-xl
3. **Без localStorage** — тільки Supabase для всіх даних
4. **Без "local" fallback** — tutor_id з auth.uid(), ніколи хардкод
5. **Без emoji в UI** — тільки Lucide іконки або текст
6. **Без dark mode** — тільки light theme
7. **Await всі DB writes** — без fire-and-forget
8. **Без градієнтів** — flat дизайн
9. **Features не імпортують одна одну** — compose на рівні pages

## Стилі

- Кольори: bg `#f5f3ee`, cards `white`, border `#e8e5de`, text `#1a1a1a`, muted `#888`, accent `#2d5a3d`
- Лендінг: CSS Modules only
- Кабінет: Tailwind v4 + Radix UI (НЕ shadcn)
- Шрифти: Georgia serif для заголовків, Inter для тексту
- OG images: 1200x630, <600KB, JPG

## Організація файлів

- Один компонент = один файл
- kebab-case для файлів
- Коли файл > 150 рядків → розбити на папку + index.tsx
- Shared компоненти в `components/`, feature-specific в `features/*/components/`
- Типи в `types/database.ts`
- DB операції через `lib/db.ts`

## i18n

- Всі тексти через `useTranslation()` хук
- Мови: uk (українська), ru (російська, дефолт)
- Автодетект по `navigator.language`
- Без language switcher

## Git

- Author: `zerox9dev <zerox9dev.work@icloud.com>`
- Ніколи не force push
- Коміти англійською

## Перед кожним комітом — чекліст

- [ ] Файли < 200 рядків?
- [ ] Немає shadow класів?
- [ ] Немає localStorage?
- [ ] Немає emoji?
- [ ] Всі DB writes з await?
- [ ] Всі тексти через t()?
- [ ] Імпорти працюють?
