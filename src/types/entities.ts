/**
 * 엔티티 타입 정의
 * 모든 데이터 모델 타입을 중앙화하여 관리
 * DB 스키마와 동기화됨
 */

// ============================================
// 공통 ENUM 타입 (DB 스키마 동기화)
// ============================================

/** 사용자 상태 (user_status) */
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'DORMANT' | 'WITHDRAWN';

/** 처리 상태 (processing_status) */
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/** 사고 심각도 (incident_severity) */
export type IncidentSeverity = 'MINOR' | 'SERIOUS' | 'CRITICAL' | 'CATASTROPHIC';

/** 발생 장소 유형 (location_type) */
export type LocationType = 'IN_BASE' | 'OUT_BASE' | 'TRAINING_SITE' | 'OPERATION' | 'VACATION';

/** 위험 등급 (risk_grade) - 5단계 */
export type RiskGrade = 'SAFE' | 'ATTENTION' | 'CAUTION' | 'WARNING' | 'DANGER';

/** 문서 카테고리 (doc_category) */
export type DocCategory = 'MANUAL' | 'TRAINING' | 'CASE_STUDY' | 'LAW' | 'REPORT' | 'ETC';

/** 보고서 유형 (report_type) */
export type ReportType = 'INCIDENT' | 'PREVENTION' | 'STATISTICS' | 'PERIODIC' | 'INTELLIGENCE';

/** 보고서 결재 상태 (report_status) */
export type ReportStatus = 'DRAFT' | 'REQUESTED' | 'REVIEWING' | 'REJECTED' | 'APPROVED';

/** 데이터 보안 등급 (security_level) */
export type SecurityLevel = 'UNCLASSIFIED' | 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';

/** 보안 알림 심각도 (alert_severity) */
export type AlertSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

/** 보안 알림 상태 (alert_status) */
export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

/** 알림 유형 (notification_type) */
export type NotificationType = 'SYSTEM' | 'RISK_ALERT' | 'APPROVAL_REQ' | 'APPROVAL_RES' | 'NOTICE' | 'SECURITY';

/** 첨부파일 대상 유형 (file_target_type) */
export type FileTargetType = 'NOTICE' | 'REPORT' | 'INCIDENT' | 'SCHEDULE' | 'DOCUMENT';

/** 배치 작업 상태 (job_status) */
export type JobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

// ============================================
// 공통 타입
// ============================================

/** 페이지네이션 정보 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 페이지네이션된 응답 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

/** 기본 엔티티 (모든 엔티티의 베이스) */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// 사용자 관련 타입
// ============================================

/** 사용자 역할 (app_role) */
export type UserRole = 'ROLE_HQ' | 'ROLE_DIV' | 'ROLE_BN';

/** 사용자 */
export interface User extends BaseEntity {
  accountId: string;      // 로그인용 계정 ID
  militaryId: string;     // 군번 (고유 식별)
  name: string;
  rank: string;           // 계급 코드
  unitId: string;
  role: UserRole;
  status: UserStatus;
  email?: string;
  phone?: string;
  lastLoginAt?: string;
  loginFailCount?: number;
  passwordChangedAt?: string;
}

/** 사용자 생성 DTO */
export interface CreateUserDto {
  accountId: string;
  militaryId: string;
  name: string;
  rank: string;
  unitId: string;
  password: string;
  role?: UserRole;
}

/** 사용자 수정 DTO */
export interface UpdateUserDto {
  name?: string;
  rank?: string;
  unitId?: string;
  role?: UserRole;
  status?: UserStatus;
}

// ============================================
// 공지사항 관련 타입
// ============================================

/** 비디오 링크 */
export interface VideoLink {
  id: string;
  url: string;
}

/** 첨부 링크 */
export interface AttachmentLink {
  id: string;
  name: string;
  url: string;
}

/** 공지사항 (notices 테이블) */
export interface Notice extends BaseEntity {
  title: string;
  content: string;
  targetUnitId: string | null;  // null = 전군
  targetLabel: string;          // 표시용 대상 라벨
  isPopup: boolean;             // 팝업 표시 여부
  videoUrl?: string;            // 관련 영상 URL
  videoUrls?: VideoLink[];      // 다중 영상 (프론트 확장)
  hasVideo: boolean;
  hasAttachment: boolean;
  attachments?: AttachmentLink[];
  startAt: string;              // 게시 시작일
  endAt: string;                // 게시 종료일
  viewCount: number;            // 조회수
  author: string;
  authorId: string;
  status: 'active' | 'expired';
}

/** 공지사항 생성 DTO */
export interface CreateNoticeDto {
  title: string;
  content: string;
  targetUnitId: string | null;
  isPopup?: boolean;
  videoUrl?: string;
  videoUrls?: VideoLink[];
  attachments?: Omit<AttachmentLink, 'id'>[];
  startAt: string;
  endAt: string;
}

/** 공지사항 수정 DTO */
export interface UpdateNoticeDto extends Partial<CreateNoticeDto> {
  status?: 'active' | 'expired';
}

// ============================================
// 사고 관련 타입 (incidents 테이블)
// ============================================

/** 인명 피해 상세 (casualties JSONB) */
export interface Casualties {
  militaryDeaths: number;
  civilianDeaths: number;
  militaryInjuries: number;
  civilianInjuries: number;
}

/** 사고 사례 */
export interface Incident extends BaseEntity {
  incidentNo: string;           // 사고 관리 번호
  occurredAt: string;           // 발생 일시
  unitId: string;               // 발생 부대
  typeLarge: string;            // 대분류
  typeMedium: string;           // 중분류
  rankCode?: string;            // 관련자 계급 (분석용)
  severity: IncidentSeverity;   // 심각도
  locationType: LocationType;   // 장소 유형
  description?: string;         // 사고 경위
  casualties?: Casualties;      // 인명 피해 상세
  author: string;
  authorId: string;
}

/** 사고 생성 DTO */
export interface CreateIncidentDto {
  occurredAt: string;
  unitId: string;
  typeLarge: string;
  typeMedium: string;
  rankCode?: string;
  severity: IncidentSeverity;
  locationType: LocationType;
  description?: string;
  casualties?: Casualties;
}

/** 사고 수정 DTO */
export interface UpdateIncidentDto extends Partial<CreateIncidentDto> {}

// ============================================
// 훈련 일정 관련 타입 (training_schedules)
// ============================================

/** 훈련 유형 */
export type TrainingType = '사격' | '기동' | '전술' | '체력' | '교육' | '점검';

/** 훈련 일정 */
export interface TrainingSchedule extends BaseEntity {
  name: string;                 // 훈련명
  unit: string;                 // 표시용 부대명
  unitId: string;
  startDate: string;            // 시작일
  endDate: string;              // 종료일
  startTime?: string;           // 시작 시간 (HH:mm) - 프론트 확장
  endTime?: string;             // 종료 시간 (HH:mm) - 프론트 확장
  location?: string;            // 장소 - 프론트 확장
  type?: TrainingType;          // 훈련 유형 - 프론트 확장
  riskLevel: RiskGrade;         // 예측 위험도
  participants?: number;        // 참가 인원
  notes?: string;               // 비고
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

/** 훈련 일정 생성 DTO */
export interface CreateTrainingScheduleDto {
  name: string;
  unitId: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type?: TrainingType;
  riskLevel?: RiskGrade;
  participants?: number;
  notes?: string;
}

/** 훈련 일정 수정 DTO */
export interface UpdateTrainingScheduleDto extends Partial<CreateTrainingScheduleDto> {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// ============================================
// 보고서 관련 타입
// ============================================

/** 관련자 정보 */
export interface PersonInvolved {
  id: string;
  role: 'suspect' | 'victim' | 'injured' | 'witness';
  isMilitary: boolean;
  name: string;
  rank?: string;
  unit?: string;
  enlistmentType?: string;
  gender?: string;
  age?: number;
}

/** 사고 보고서 (generated_reports) */
export interface AccidentReport extends BaseEntity {
  templateId?: string;          // 템플릿 ID
  unitId: string;               // 대상 부대
  title: string;                // 제목
  date: string;
  time: string;
  location: string;
  locationDetail: 'inside' | 'outside';
  specificPlace: string;
  categoryMajor: string;
  categoryMiddle?: string;
  categoryMinor?: string;
  cause?: string;
  overview: string;
  personsInvolved: PersonInvolved[];
  militaryDeaths: number;
  civilianDeaths: number;
  militaryInjuries: number;
  civilianInjuries: number;
  militaryDamage?: string;
  civilianDamage?: string;
  alcoholInvolved: boolean;
  crimeTool?: string;
  workType?: string;
  actionsTaken?: string;
  reporter: string;
  reporterRank: string;
  reporterContact?: string;
  generatedContent?: string;    // AI 생성 결과
  status: ReportStatus;         // 결재 상태
  reviewerId?: string;          // 검토자
  reviewedAt?: string;          // 검토일시
}

/** 통계 보고서 */
export interface StatisticsReport extends BaseEntity {
  title: string;
  period: string;
  unitId: string;
  unitName: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status: ReportStatus;
  author: string;
  summary?: string;
  fileUrl?: string;
}

// ============================================
// 데이터 관리 관련 타입
// ============================================

/** 학습 문서 (documents 테이블) */
export interface LearningDocument extends BaseEntity {
  name: string;
  category?: DocCategory;
  type: string;               // 파일 확장자 (PDF, HWP, DOCX)
  size: string;
  fileName: string;
  filePath?: string;          // Storage 경로
  status: ProcessingStatus;
  chunks: number;             // chunk_count
  uploadedBy?: string;
}

/** 뉴스 기사 (news_articles 테이블) */
export interface NewsArticle extends BaseEntity {
  title: string;
  content?: string;
  source: string;             // 출처 (언론사명)
  sourceUrl?: string;         // 원문 URL
  publishedAt: string;        // 게시일
  status: ProcessingStatus;
  embeddings: number;         // 임베딩 수 (프론트 표시용)
  inputType: 'file' | 'json';
  fileName?: string;
  fileType?: string;
  fileSize?: string;
}

/** 예보 데이터 */
export interface ForecastData extends BaseEntity {
  name: string;
  period: string;
  recordCount: number;
  fileName: string;
  fileSize: string;
  status: ProcessingStatus;
  uploadedBy?: string;
}

/** 청크 설정 */
export interface ChunkSettings {
  chunkSize: number;
  overlapPercent: number;
  embeddingModel: string;
}

// ============================================
// 시스템 설정 관련 타입
// ============================================

/** 허용 IP (allowed_ips) */
export interface AllowedIP extends BaseEntity {
  ip: string;
  unit: string;
  unitId?: string;
  description?: string;
}

/** 감사 로그 (audit_logs) */
export interface AuditLog extends BaseEntity {
  userId?: string;
  accountId: string;
  militaryId: string;
  userName: string;
  rank: string;
  ip: string;
  action: string;
  target: string;
  details?: string;           // 변경 내용 JSON
  timestamp: string;
  status: 'success' | 'failed';
}

// ============================================
// 챗봇 관련 타입
// ============================================

/** 채팅 대화 세션 (chat_conversations) */
export interface ChatConversation extends BaseEntity {
  userId: string;
  title?: string;
  documentFilter?: string;
  modelName?: string;
}

/** 채팅 메시지 (chat_messages) */
export interface ChatMessage {
  id: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  content: string;
  sourceRefs?: DocumentReference[];  // 참조 문서 정보
  modelName?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseTimeMs?: number;
  timestamp: string;
}

/** 문서 참조 */
export interface DocumentReference {
  title: string;
  source: string;
  url?: string;
  page?: number;
  score?: number;
}

/** AI 모델 정보 */
export interface AIModel {
  id: string;
  label: string;
  description?: string;
  isDefault?: boolean;
}

/** 문서 소스 */
export interface DocumentSource {
  id: string;
  label: string;
  description: string;
}

// ============================================
// 부대 관련 타입
// ============================================

/** 부대 레벨 (unit_level) */
export type UnitLevel = 'HQ' | 'CMD' | 'CORPS' | 'DIV' | 'BRIG' | 'REGT' | 'BN' | 'CO' | 'DRU';

/** 부대 유형 (unit_type) */
export type UnitType = 'INF' | 'ART' | 'ARM' | 'ENG' | 'COM' | 'INT' | 'AVN' | 'CBR' | 'LOG' | 'MED' | 'MP' | 'EDU' | 'SF' | 'ADA' | 'CMD';

/** 부대 */
export interface Unit {
  id: string;
  code?: string;
  name: string;
  parentId?: string;
  fullPath?: string;
  level?: UnitLevel;
  type?: UnitType;
  regionCode?: string;
  isActive?: boolean;
  children?: Unit[];
}

// ============================================
// 위험 예보 관련 타입 (risk_forecasts)
// ============================================

/** 위험 예보 */
export interface RiskForecast extends BaseEntity {
  unitId: string;
  targetWeek: string;         // YYYYWW
  riskScore: number;          // 0-100
  riskGrade: RiskGrade;
  mainRisk?: string;          // 주요 위험 요인
  aiInsight?: string;         // AI 생성 인사이트
}

/** 주간 예보 (프론트엔드 표시용) */
export interface WeeklyForecast {
  weekNumber: number;
  startDate: string;
  endDate: string;
  overallRisk: RiskGrade;
  riskScore: number;
  factors: RiskFactor[];
  recommendations: string[];
}

/** 위험 요소 */
export interface RiskFactor {
  name: string;
  impact: RiskGrade;
  description: string;
}

/** 트렌드 데이터 */
export interface TrendData {
  date: string;
  value: number;
  category?: string;
}

// ============================================
// 대시보드 관련 타입
// ============================================

/** 대시보드 통계 */
export interface DashboardStats {
  totalIncidents: number;
  highRiskUnits: number;
  activeTrainings: number;
  pendingReports: number;
  riskGrade: RiskGrade;
  riskScore: number;
}

/** 부대별 위험도 */
export interface UnitRisk {
  unitId: string;
  unitName: string;
  riskGrade: RiskGrade;
  riskScore: number;
  incidentCount: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================
// 기상 데이터 관련 타입 (weather_data)
// ============================================

/** 기상 데이터 */
export interface WeatherData extends BaseEntity {
  unitId: string;
  date: string;
  wbgtIndex?: number;         // WBGT 지수
  temperature?: number;       // 기온
  weatherCond?: string;       // 날씨 상태
  alertMessage?: string;      // 기상 경보 표시
}

// ============================================
// 사용자 알림 관련 타입 (user_notifications)
// ============================================

/** 사용자 알림 */
export interface UserNotification extends BaseEntity {
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
}

// ============================================
// 헬퍼 함수 및 상수
// ============================================

/** UserStatus 라벨 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  'ACTIVE': '활성',
  'LOCKED': '잠김',
  'DORMANT': '휴면',
  'WITHDRAWN': '탈퇴',
};

/** ProcessingStatus 라벨 */
export const PROCESSING_STATUS_LABELS: Record<ProcessingStatus, string> = {
  'PENDING': '대기',
  'PROCESSING': '처리중',
  'COMPLETED': '완료',
  'FAILED': '실패',
};

/** IncidentSeverity 라벨 */
export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  'MINOR': '경미',
  'SERIOUS': '중상',
  'CRITICAL': '치명',
  'CATASTROPHIC': '재난',
};

/** LocationType 라벨 */
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  'IN_BASE': '영내',
  'OUT_BASE': '영외',
  'TRAINING_SITE': '훈련장',
  'OPERATION': '작전지역',
  'VACATION': '휴가/외박 중',
};

/** RiskGrade 라벨 */
export const RISK_GRADE_LABELS: Record<RiskGrade, string> = {
  'SAFE': '안전',
  'ATTENTION': '관심',
  'CAUTION': '주의',
  'WARNING': '경계',
  'DANGER': '심각',
};

/** ReportStatus 라벨 */
export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  'DRAFT': '작성 중',
  'REQUESTED': '승인 요청',
  'REVIEWING': '검토 중',
  'REJECTED': '반려',
  'APPROVED': '승인 완료',
};

/** RiskGrade 숫자 변환 (점수 → 등급) */
export function getRiskGradeFromScore(score: number): RiskGrade {
  if (score < 20) return 'SAFE';
  if (score < 40) return 'ATTENTION';
  if (score < 60) return 'CAUTION';
  if (score < 80) return 'WARNING';
  return 'DANGER';
}

/** RiskGrade 색상 클래스 */
export const RISK_GRADE_COLORS: Record<RiskGrade, string> = {
  'SAFE': 'text-green-600',
  'ATTENTION': 'text-blue-600',
  'CAUTION': 'text-yellow-600',
  'WARNING': 'text-orange-600',
  'DANGER': 'text-red-600',
};

/** RiskGrade 배경 색상 클래스 */
export const RISK_GRADE_BG_COLORS: Record<RiskGrade, string> = {
  'SAFE': 'bg-green-100',
  'ATTENTION': 'bg-blue-100',
  'CAUTION': 'bg-yellow-100',
  'WARNING': 'bg-orange-100',
  'DANGER': 'bg-red-100',
};
