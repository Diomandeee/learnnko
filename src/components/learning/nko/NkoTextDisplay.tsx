import { cn } from '@/lib/utils';
import { ValidationResult } from '@/lib/nko/validator';
import { NkoValidationBadge } from './NkoValidationBadge';

interface NkoTextDisplayProps {
  text: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBreakdown?: boolean;
  validationStatus?: ValidationResult;
  className?: string;
}

export function NkoTextDisplay({
  text,
  size = 'md',
  showBreakdown = false,
  validationStatus,
  className
}: NkoTextDisplayProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Main N'Ko text - RTL, proper font */}
      <div
        className={cn(
          "leading-relaxed", // font-nko should be applied globally or checking 'layout.tsx' if nko font is loaded
          sizeClasses[size]
        )}
        dir="rtl"
        lang="nqo"
        style={{
          fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
          unicodeBidi: 'embed',
        }}
      >
        {text}
      </div>

      {/* Validation badge */}
      {validationStatus && (
        <NkoValidationBadge validation={validationStatus} />
      )}

      {/* Character breakdown */}
      {showBreakdown && validationStatus && (
        <div className="flex flex-wrap gap-1 mt-2">
          {validationStatus.charBreakdown.map((char, i) => (
            <span
              key={i}
              className={cn(
                "px-2 py-1 rounded text-sm",
                char.type === 'vowel' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                char.type === 'consonant' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                char.type === 'tone' && "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                char.type === 'digit' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                !char.isValid && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
              )}
              title={`U+${char.codePoint.toString(16).toUpperCase()}`}
            >
              {char.char}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
