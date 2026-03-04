interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ children, required, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-xs font-medium text-gray-700 mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}
