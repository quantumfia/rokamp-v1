/**
 * 폼 필드 래퍼 컴포넌트
 * 레이블, 에러 메시지, 필수 표시 등을 일관되게 표시
 */

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  touched = true,
  hint,
  children,
  className,
}: FormFieldProps) {
  const showError = touched && error;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {showError && (
        <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
      {!showError && hint && (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/**
 * 인라인 폼 필드 (라벨이 작은 크기)
 */
interface InlineFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function InlineFormField({
  label,
  required = false,
  error,
  touched = true,
  hint,
  children,
  className,
}: InlineFormFieldProps) {
  const showError = touched && error;

  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {showError && (
        <p className="text-[10px] text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
      {!showError && hint && (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
