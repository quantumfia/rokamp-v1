/**
 * 폼 검증 훅
 * Zod 스키마 기반 폼 상태 및 검증 관리
 * - 서버 에러 핸들링
 * - 로딩 상태 관리
 * - 재시도 로직
 */

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import { formatZodErrors, emptyToUndefined } from '@/lib/validation';
import { ApiException } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';

/** 폼 상태 */
export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  /** 서버 에러 */
  serverError: ApiException | null;
  /** 제출 성공 여부 */
  isSubmitSuccessful: boolean;
  /** 제출 횟수 */
  submitCount: number;
}

/** 제출 결과 */
export interface SubmitResult<T> {
  success: boolean;
  data?: T;
  error?: ApiException;
}

/** 폼 훅 옵션 */
export interface UseFormOptions<T, TResult = unknown> {
  /** 초기값 */
  initialValues: T;
  /** 검증 스키마 */
  schema?: z.ZodSchema<T>;
  /** 실시간 검증 활성화 */
  validateOnChange?: boolean;
  /** 블러 시 검증 활성화 */
  validateOnBlur?: boolean;
  /** 제출 핸들러 */
  onSubmit?: (values: T) => Promise<TResult> | TResult;
  /** 성공 메시지 */
  successMessage?: string;
  /** 에러 메시지 (커스텀) */
  errorMessage?: string | ((error: ApiException) => string);
  /** 성공 시 폼 리셋 */
  resetOnSuccess?: boolean;
  /** 성공 콜백 */
  onSuccess?: (result: TResult) => void;
  /** 에러 콜백 */
  onError?: (error: ApiException) => void;
  /** 서버 에러를 필드 에러로 매핑 */
  mapServerErrors?: (error: ApiException) => Record<string, string> | null;
}

/**
 * 폼 검증 및 상태 관리 훅
 */
export function useFormValidation<T extends Record<string, unknown>, TResult = unknown>({
  initialValues,
  schema,
  validateOnChange = false,
  validateOnBlur = true,
  onSubmit,
  successMessage,
  errorMessage,
  resetOnSuccess = false,
  onSuccess,
  onError,
  mapServerErrors,
}: UseFormOptions<T, TResult>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<ApiException | null>(null);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // 변경 여부 계산
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // 유효성 계산
  const isValid = useMemo(() => {
    if (!schema) return true;
    const result = schema.safeParse(emptyToUndefined(values));
    return result.success;
  }, [values, schema]);

  // 전체 검증
  const validate = useCallback((): boolean => {
    if (!schema) return true;

    const result = schema.safeParse(emptyToUndefined(values));

    if (result.success) {
      setErrors({});
      return true;
    }

    setErrors(formatZodErrors(result.error));
    return false;
  }, [values, schema]);

  // 단일 필드 검증
  const validateField = useCallback(
    (name: keyof T): string | undefined => {
      if (!schema) return undefined;

      // 전체 스키마로 검증 후 해당 필드 에러만 추출
      const result = schema.safeParse(emptyToUndefined(values));

      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name as string];
          return next;
        });
        return undefined;
      }

      const fieldError = result.error.errors.find(
        (err) => err.path[0] === name
      );

      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          [name as string]: fieldError.message,
        }));
        return fieldError.message;
      }

      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as string];
        return next;
      });
      return undefined;
    },
    [values, schema]
  );

  // 값 변경 핸들러
  const handleChange = useCallback(
    (name: keyof T, value: unknown) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // 서버 에러 클리어
      if (serverError) {
        setServerError(null);
      }

      if (validateOnChange) {
        // 다음 틱에서 검증 (값 업데이트 후)
        setTimeout(() => validateField(name), 0);
      }
    },
    [validateOnChange, validateField, serverError]
  );

  // input 이벤트 핸들러 생성
  const getInputProps = useCallback(
    (name: keyof T) => ({
      value: values[name] as string | number | undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target;
        const value = target.type === 'number' && 'valueAsNumber' in target
          ? target.valueAsNumber || 0
          : target.value;
        handleChange(name, value);
      },
      onBlur: () => {
        setTouched((prev) => ({ ...prev, [name as string]: true }));
        if (validateOnBlur) {
          validateField(name);
        }
      },
      disabled: isSubmitting,
    }),
    [values, handleChange, validateOnBlur, validateField, isSubmitting]
  );

  // checkbox 이벤트 핸들러 생성
  const getCheckboxProps = useCallback(
    (name: keyof T) => ({
      checked: Boolean(values[name]),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(name, e.target.checked);
      },
      disabled: isSubmitting,
    }),
    [values, handleChange, isSubmitting]
  );

  // select 이벤트 핸들러 생성 (Radix UI Select 용)
  const getSelectProps = useCallback(
    (name: keyof T) => ({
      value: String(values[name] || ''),
      onValueChange: (value: string) => {
        handleChange(name, value);
      },
      disabled: isSubmitting,
    }),
    [values, handleChange, isSubmitting]
  );

  // 블러 핸들러
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name as string]: true }));
      if (validateOnBlur) {
        validateField(name);
      }
    },
    [validateOnBlur, validateField]
  );

  // 서버 에러 처리
  const handleServerError = useCallback(
    (error: unknown): ApiException => {
      const apiError = error instanceof ApiException
        ? error
        : new ApiException({
            code: 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
          });

      setServerError(apiError);

      // 서버 에러를 필드 에러로 매핑
      if (mapServerErrors) {
        const fieldErrors = mapServerErrors(apiError);
        if (fieldErrors) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
      }

      // 에러 토스트 표시
      const message = typeof errorMessage === 'function'
        ? errorMessage(apiError)
        : errorMessage || apiError.message;

      toast({
        title: '오류',
        description: message,
        variant: 'destructive',
      });

      onError?.(apiError);
      return apiError;
    },
    [errorMessage, mapServerErrors, onError]
  );

  // 제출 핸들러
  const handleSubmit = useCallback(
    async (e?: React.FormEvent): Promise<SubmitResult<TResult>> => {
      e?.preventDefault();

      // 제출 횟수 증가
      setSubmitCount((prev) => prev + 1);

      // 모든 필드를 터치됨으로 표시
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // 서버 에러 클리어
      setServerError(null);
      setIsSubmitSuccessful(false);

      // 검증
      if (!validate()) {
        return { success: false };
      }

      if (!onSubmit) return { success: true };

      setIsSubmitting(true);
      try {
        const result = await onSubmit(values);

        setIsSubmitSuccessful(true);

        // 성공 토스트 표시
        if (successMessage) {
          toast({
            title: '완료',
            description: successMessage,
          });
        }

        // 성공 시 폼 리셋
        if (resetOnSuccess) {
          setValues(initialValues);
          setErrors({});
          setTouched({});
        }

        onSuccess?.(result);
        return { success: true, data: result };
      } catch (error) {
        const apiError = handleServerError(error);
        return { success: false, error: apiError };
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit, successMessage, resetOnSuccess, initialValues, onSuccess, handleServerError]
  );

  // 재시도
  const retry = useCallback(async (): Promise<SubmitResult<TResult>> => {
    return handleSubmit();
  }, [handleSubmit]);

  // 초기화
  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setServerError(null);
      setIsSubmitSuccessful(false);
      setSubmitCount(0);
    },
    [initialValues]
  );

  // 특정 값 설정
  const setValue = useCallback((name: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 여러 값 한번에 설정
  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // 에러 직접 설정 (서버 에러 등)
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name as string]: error }));
  }, []);

  // 여러 필드 에러 설정
  const setFieldErrors = useCallback((fieldErrors: Record<string, string>) => {
    setErrors((prev) => ({ ...prev, ...fieldErrors }));
  }, []);

  // 에러 지우기
  const clearErrors = useCallback(() => {
    setErrors({});
    setServerError(null);
  }, []);

  // 서버 에러 클리어
  const clearServerError = useCallback(() => {
    setServerError(null);
  }, []);

  return {
    // 상태
    values,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    serverError,
    isSubmitSuccessful,
    submitCount,

    // 핸들러
    handleChange,
    handleBlur,
    handleSubmit,

    // 헬퍼
    getInputProps,
    getCheckboxProps,
    getSelectProps,
    validate,
    validateField,
    reset,
    retry,
    setValue,
    setMultipleValues,
    setFieldError,
    setFieldErrors,
    clearErrors,
    clearServerError,
    setValues,
  };
}

/**
 * 필드 에러 확인 헬퍼
 */
export function getFieldError(
  name: string,
  errors: Record<string, string>,
  touched: Record<string, boolean>,
  showOnlyTouched = true
): string | undefined {
  if (showOnlyTouched && !touched[name]) {
    return undefined;
  }
  return errors[name];
}
