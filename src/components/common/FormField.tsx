/**
 * 폼 필드 래퍼 컴포넌트
 * 레이블, 에러 메시지, 필수 표시, 로딩 상태 등을 일관되게 표시
 */

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 서버 에러 여부 (다른 스타일 적용) */
  isServerError?: boolean;
}

export function FormField({
  label,
  required = false,
  error,
  touched = true,
  hint,
  children,
  className,
  isLoading = false,
  isServerError = false,
}: FormFieldProps) {
  const showError = touched && error;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm font-medium flex items-center gap-1.5">
        {label}
        {required && <span className="text-destructive">*</span>}
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </Label>
      <div className={cn(
        showError && 'relative',
        isLoading && 'opacity-70 pointer-events-none'
      )}>
        {children}
      </div>
      {showError && (
        <div className={cn(
          'flex items-start gap-1.5 text-xs animate-in fade-in slide-in-from-top-1 duration-200',
          isServerError ? 'text-orange-600 dark:text-orange-400' : 'text-destructive'
        )}>
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
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
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 서버 에러 여부 */
  isServerError?: boolean;
}

export function InlineFormField({
  label,
  required = false,
  error,
  touched = true,
  hint,
  children,
  className,
  isLoading = false,
  isServerError = false,
}: InlineFormFieldProps) {
  const showError = touched && error;

  return (
    <div className={cn('space-y-1', className)}>
      <label className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
        {isLoading && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      </label>
      <div className={cn(isLoading && 'opacity-70 pointer-events-none')}>
        {children}
      </div>
      {showError && (
        <div className={cn(
          'flex items-start gap-1 text-[10px] animate-in fade-in slide-in-from-top-1 duration-200',
          isServerError ? 'text-orange-600 dark:text-orange-400' : 'text-destructive'
        )}>
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!showError && hint && (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/**
 * 서버 에러 배너 컴포넌트
 */
interface ServerErrorBannerProps {
  error: { message: string; code?: string } | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ServerErrorBanner({
  error,
  onRetry,
  onDismiss,
  className,
}: ServerErrorBannerProps) {
  if (!error) return null;

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm',
      'animate-in fade-in slide-in-from-top-2 duration-300',
      className
    )}>
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-destructive">오류가 발생했습니다</p>
        <p className="text-muted-foreground text-xs mt-0.5">{error.message}</p>
        {error.code && (
          <p className="text-muted-foreground/70 text-[10px] mt-1">
            오류 코드: {error.code}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-medium text-primary hover:underline"
          >
            다시 시도
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 제출 버튼 컴포넌트
 */
interface SubmitButtonProps {
  isSubmitting: boolean;
  isValid?: boolean;
  isDirty?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
}

export function SubmitButton({
  isSubmitting,
  isValid = true,
  isDirty = true,
  children,
  loadingText = '처리 중...',
  className,
  disabled = false,
  type = 'submit',
  onClick,
}: SubmitButtonProps) {
  const isDisabled = disabled || isSubmitting || !isValid;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md',
        'bg-primary text-primary-foreground font-medium text-sm',
        'transition-all duration-200',
        'hover:bg-primary/90',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isSubmitting && 'cursor-wait',
        className
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
