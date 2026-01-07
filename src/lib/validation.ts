/**
 * 폼 검증 유틸리티
 * Zod 스키마 기반 검증 헬퍼 함수들
 */

import { z } from 'zod';

// ============================================
// 공통 검증 스키마
// ============================================

/** 필수 문자열 */
export const requiredString = (fieldName: string, maxLength = 255) =>
  z.string()
    .trim()
    .min(1, { message: `${fieldName}을(를) 입력해주세요.` })
    .max(maxLength, { message: `${fieldName}은(는) ${maxLength}자 이하로 입력해주세요.` });

/** 선택적 문자열 */
export const optionalString = (maxLength = 255) =>
  z.string()
    .trim()
    .max(maxLength)
    .optional()
    .or(z.literal(''));

/** 이메일 */
export const emailSchema = z.string()
  .trim()
  .email({ message: '올바른 이메일 형식을 입력해주세요.' })
  .max(255);

/** 비밀번호 (8자 이상, 영문/숫자/특수문자 포함) */
export const passwordSchema = z.string()
  .min(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  .max(128, { message: '비밀번호는 128자 이하로 입력해주세요.' })
  .refine(
    (val) => /[A-Za-z]/.test(val),
    { message: '비밀번호에 영문자를 포함해주세요.' }
  )
  .refine(
    (val) => /[0-9]/.test(val),
    { message: '비밀번호에 숫자를 포함해주세요.' }
  )
  .refine(
    (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
    { message: '비밀번호에 특수문자를 포함해주세요.' }
  );

/** 군번 (00-000000 형식) */
export const militaryIdSchema = z.string()
  .trim()
  .regex(/^\d{2}-\d{6}$/, { message: '군번 형식이 올바르지 않습니다. (예: 00-000000)' });

/** 전화번호 */
export const phoneSchema = z.string()
  .trim()
  .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, { message: '올바른 전화번호 형식을 입력해주세요.' })
  .optional()
  .or(z.literal(''));

/** 날짜 (YYYY-MM-DD) */
export const dateSchema = z.string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: '날짜 형식이 올바르지 않습니다. (예: 2024-12-31)' });

/** 시간 (HH:mm) */
export const timeSchema = z.string()
  .trim()
  .regex(/^\d{2}:\d{2}$/, { message: '시간 형식이 올바르지 않습니다. (예: 09:00)' });

/** IP 주소 또는 CIDR */
export const ipAddressSchema = z.string()
  .trim()
  .regex(
    /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
    { message: '올바른 IP 주소 또는 CIDR 형식을 입력해주세요. (예: 10.10.0.0/16)' }
  );

/** URL */
export const urlSchema = z.string()
  .trim()
  .url({ message: '올바른 URL 형식을 입력해주세요.' })
  .optional()
  .or(z.literal(''));

/** 양의 정수 */
export const positiveIntSchema = z.number()
  .int({ message: '정수를 입력해주세요.' })
  .positive({ message: '0보다 큰 숫자를 입력해주세요.' });

/** 0 이상 정수 */
export const nonNegativeIntSchema = z.number()
  .int({ message: '정수를 입력해주세요.' })
  .nonnegative({ message: '0 이상의 숫자를 입력해주세요.' });

// ============================================
// 엔티티별 검증 스키마
// ============================================

/** 사용자 생성 스키마 */
export const createUserSchema = z.object({
  accountId: requiredString('계정 ID', 50),
  militaryId: militaryIdSchema,
  name: requiredString('이름', 50),
  rank: requiredString('계급', 20),
  unitId: requiredString('소속 부대'),
  password: passwordSchema,
});

/** 사용자 수정 스키마 */
export const updateUserSchema = z.object({
  name: optionalString(50),
  rank: optionalString(20),
  unitId: optionalString(),
  role: z.enum(['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

/** 공지사항 스키마 */
export const noticeSchema = z.object({
  title: requiredString('제목', 200),
  content: requiredString('내용', 10000),
  target: requiredString('발송 대상'),
  videoUrls: z.array(z.object({
    id: z.string(),
    url: z.string(),
  })).optional(),
  attachments: z.array(z.object({
    name: requiredString('링크명', 100),
    url: z.string().url({ message: '올바른 URL을 입력해주세요.' }),
  })).optional(),
});

/** 사고 사례 스키마 */
export const incidentSchema = z.object({
  title: requiredString('제목', 200),
  description: requiredString('내용', 5000),
  incidentDate: dateSchema,
  location: requiredString('장소', 200),
  category: requiredString('분류'),
  severity: z.enum(['low', 'medium', 'high']),
  target: requiredString('발송 대상'),
});

/** 훈련 일정 스키마 */
export const trainingScheduleSchema = z.object({
  title: requiredString('훈련명', 200),
  unitId: requiredString('부대'),
  date: dateSchema,
  startTime: timeSchema.optional().or(z.literal('')),
  endTime: timeSchema.optional().or(z.literal('')),
  location: optionalString(200),
  type: z.enum(['사격', '기동', '전술', '체력', '교육', '점검']),
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  participants: nonNegativeIntSchema.optional(),
});

/** IP 주소 스키마 */
export const allowedIpSchema = z.object({
  ip: ipAddressSchema,
  unit: requiredString('부대명', 100),
});

/** 청크 설정 스키마 */
export const chunkSettingsSchema = z.object({
  chunkSize: z.number().min(256).max(4096),
  overlapPercent: z.number().min(0).max(50),
  embeddingModel: requiredString('임베딩 모델'),
});

// ============================================
// 검증 헬퍼 함수
// ============================================

/** 검증 결과 타입 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * 스키마로 데이터 검증
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });

  return {
    success: false,
    errors,
  };
}

/**
 * 단일 필드 검증
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { valid: boolean; error?: string } {
  const result = schema.safeParse(value);

  if (result.success) {
    return { valid: true };
  }

  return {
    valid: false,
    error: result.error.errors[0]?.message,
  };
}

/**
 * 폼 에러를 Record 형태로 변환
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });
  return errors;
}

/**
 * HTML 특수문자 이스케이프 (XSS 방지)
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * 문자열 정규화 (트림 + 연속 공백 제거)
 */
export function normalizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * 숫자 문자열을 숫자로 안전하게 변환
 */
export function safeParseInt(value: string | number | undefined, defaultValue = 0): number {
  if (typeof value === 'number') return value;
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 빈 문자열을 undefined로 변환
 */
export function emptyToUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (result[key] === '') {
      (result as Record<string, unknown>)[key] = undefined;
    }
  });
  return result;
}
