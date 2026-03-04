import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
  className?: string
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_#>-]/g, ' ')
    .replace(/\d+\.\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stripRichText(input: string): string {
  if (!input) return ''
  return stripMarkdown(input)
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content) return null

  return (
    <div className={`prose prose-sm max-w-none text-gray-700 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
