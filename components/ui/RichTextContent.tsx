interface RichTextContentProps {
  html: string
  className?: string
}

// Renders stored HTML from Tiptap. Content is tutor-authored, not user-input.
export function RichTextContent({ html, className = '' }: RichTextContentProps) {
  if (!html) return null
  return (
    <div
      className={`prose prose-sm max-w-none text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// Strip HTML tags — used for plain-text previews (title truncation etc.)
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
