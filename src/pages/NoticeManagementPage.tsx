import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Video, Paperclip, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader, ActionButton, TabNavigation } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { useAuth } from '@/contexts/AuthContext';
import { canEditContent, canDeleteContent, getAccessibleUnits } from '@/lib/rbac';
import { cn } from '@/lib/utils';
import type { IncidentSeverity } from '@/types/entities';
import { INCIDENT_SEVERITY_LABELS } from '@/types/entities';

type ActiveTab = 'notices' | 'incidents';

// 공지사항 Mock 데이터
interface VideoLink {
  id: string;
  url: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  target: string;
  targetLabel: string;
  videoUrls: VideoLink[];
  hasVideo: boolean;
  hasAttachment: boolean;
  createdAt: string;
  author: string;
  status: string;
}

const NOTICES: Notice[] = [
  { 
    id: 1, 
    title: '동절기 안전수칙 강화 안내', 
    content: '동절기 안전수칙을 강화하오니 각 부대에서는 철저히 준수하시기 바랍니다.\n\n1. 난방기구 사용 시 화재 예방\n2. 결빙 구역 미끄럼 주의\n3. 저체온증 예방 조치',
    target: 'all', 
    targetLabel: '전체',
    videoUrls: [{ id: '1', url: 'https://youtu.be/example1' }],
    hasVideo: true,
    hasAttachment: true,
    createdAt: '2024-12-13', 
    author: '김철수 대령',
    status: 'active'
  },
  { 
    id: 2, 
    title: '시스템 정기점검 안내 (12/20)', 
    content: '시스템 정기점검이 예정되어 있습니다.\n\n점검일시: 2024년 12월 20일 02:00 ~ 06:00\n점검내용: 서버 업데이트 및 보안 패치',
    target: 'all', 
    targetLabel: '전체',
    videoUrls: [],
    hasVideo: false,
    hasAttachment: false,
    createdAt: '2024-12-10', 
    author: '김철수 대령',
    status: 'active'
  },
  { 
    id: 3, 
    title: '야외훈련 간 사고예방 1분 안전학습', 
    content: '야외훈련 시 안전사고 예방을 위한 1분 안전학습 자료입니다.\n\n첨부된 영상과 문서를 참고하여 훈련 전 교육을 실시하시기 바랍니다.',
    target: 'division', 
    targetLabel: '제32보병사단',
    videoUrls: [{ id: '2', url: 'https://youtu.be/example2' }],
    hasVideo: true,
    hasAttachment: true,
    createdAt: '2024-12-08', 
    author: '이영희 준장',
    status: 'active'
  },
  { 
    id: 4, 
    title: '12월 안전사고 예방 캠페인', 
    content: '12월 안전사고 예방 캠페인을 실시합니다.\n\n기간: 2024년 12월 1일 ~ 31일\n주제: 겨울철 안전사고 ZERO 달성',
    target: 'all', 
    targetLabel: '전체',
    videoUrls: [],
    hasVideo: false,
    hasAttachment: true,
    createdAt: '2024-12-05', 
    author: '김철수 대령',
    status: 'expired'
  },
  { 
    id: 5, 
    title: '신규 장비 운용 교육 안내', 
    content: '신규 도입 장비에 대한 운용 교육을 실시합니다.\n\n교육일시: 2024년 12월 18일 09:00\n장소: 본부 대강당',
    target: 'division', 
    targetLabel: '제1기갑여단',
    videoUrls: [{ id: '3', url: 'https://youtu.be/example3' }],
    hasVideo: true,
    hasAttachment: true,
    createdAt: '2024-12-04', 
    author: '박민수 중령',
    status: 'active'
  },
  { 
    id: 6, 
    title: '연말 휴가 신청 마감 안내', 
    content: '연말 휴가 신청 마감일이 다가왔습니다.\n\n마감일: 2024년 12월 15일\n신청방법: 전자결재 시스템 이용',
    target: 'all', 
    targetLabel: '전체',
    videoUrls: [],
    hasVideo: false,
    hasAttachment: false,
    createdAt: '2024-12-03', 
    author: '김철수 대령',
    status: 'active'
  },
];

// 일일 사고사례 Mock 데이터
interface Incident {
  id: number;
  title: string;
  description: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: IncidentSeverity;
  createdAt: string;
  author: string;
}

const INCIDENTS: Incident[] = [
  {
    id: 1,
    title: '군용 차량 빙판길 미끄러짐 사고',
    description: '새벽 보급품 수송 중 결빙 구간에서 5톤 트럭이 도로 이탈, 운전병 경상(타박상), 차량 범퍼 파손',
    incidentDate: '2026-01-05',
    location: '제3보병사단 보급로',
    category: '교통',
    severity: 'SERIOUS',
    createdAt: '2026-01-05',
    author: '김철수 대령',
  },
  {
    id: 2,
    title: 'GOP 경계근무 중 동상 발생',
    description: '야간 경계근무 중 병사 1명 발가락 동상(2도) 발생, 의무대 후송 치료 후 복귀 예정',
    incidentDate: '2026-01-04',
    location: '제22보병사단 GOP 초소',
    category: '한랭질환',
    severity: 'SERIOUS',
    createdAt: '2026-01-05',
    author: '이영희 준장',
  },
  {
    id: 3,
    title: '생활관 전열기구 과부하 화재위험',
    description: '미인가 멀티탭에 전열기 3대 동시 연결, 콘센트 과열로 연기 발생. 당직병 조기 발견으로 화재 미연 방지',
    incidentDate: '2026-01-03',
    location: '제1기갑여단 2대대 생활관',
    category: '화재',
    severity: 'CRITICAL',
    createdAt: '2026-01-04',
    author: '박민수 중령',
  },
  {
    id: 4,
    title: '사격훈련 중 탄피 비산 경상',
    description: 'K-2 실사격 중 튕겨나온 탄피가 옆 사수 목 부위에 접촉, 경미한 화상 발생. 현장 응급처치 완료',
    incidentDate: '2026-01-03',
    location: '육군종합훈련장 사격장',
    category: '훈련',
    severity: 'MINOR',
    createdAt: '2026-01-03',
    author: '최영호 소령',
  },
  {
    id: 5,
    title: '정비창 중량물 낙하 사고',
    description: 'K-55 자주포 정비 중 엔진 부품(약 50kg) 낙하, 정비병 발등 골절상. 국군병원 후송 치료 중',
    incidentDate: '2026-01-02',
    location: '제8기계화보병사단 정비창',
    category: '작업',
    severity: 'CRITICAL',
    createdAt: '2026-01-02',
    author: '정승훈 대령',
  },
  {
    id: 6,
    title: '행군 중 탈진 환자 발생',
    description: '20km 완전군장 행군 중 병사 1명 탈진 증세로 쓰러짐. 현장 응급처치 후 의무대 이송, 경과 양호',
    incidentDate: '2026-01-01',
    location: '제5보병사단 훈련장',
    category: '훈련',
    severity: 'SERIOUS',
    createdAt: '2026-01-01',
    author: '김철수 대령',
  },
  {
    id: 7,
    title: '조리실 가스누출 감지',
    description: '아침 취사 준비 중 가스배관 연결부 미세 누출 감지. 즉시 차단 및 정비 완료, 인명피해 없음',
    incidentDate: '2025-12-31',
    location: '제32보병사단 급양대',
    category: '화재',
    severity: 'SERIOUS',
    createdAt: '2025-12-31',
    author: '이영희 준장',
  },
];

const TABS = [
  { id: 'notices', label: '공지사항' },
  { id: 'incidents', label: '일일 사고사례' },
];

export default function NoticeManagementPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isLoading = usePageLoading(800);
  
  const tabFromUrl = searchParams.get('tab') as ActiveTab | null;
  const [activeTab, setActiveTab] = useState<ActiveTab>(tabFromUrl === 'incidents' ? 'incidents' : 'notices');

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [incidentSearchQuery, setIncidentSearchQuery] = useState('');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [incidentCurrentPage, setIncidentCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 권한 체크 헬퍼
  const canEdit = (authorName: string) => canEditContent(user?.role, authorName, user?.name || '');
  const canDelete = (authorName: string) => canDeleteContent(user?.role, authorName, user?.name || '');

  // 역할 기반 접근 가능 부대 목록
  const accessibleUnits = useMemo(() => {
    return getAccessibleUnits(user?.role, user?.unitId);
  }, [user?.role, user?.unitId]);

  useEffect(() => {
    if (tabFromUrl === 'incidents') {
      setActiveTab('incidents');
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as ActiveTab);
    setSearchParams(tabId === 'incidents' ? { tab: 'incidents' } : {});
  };

  // 역할 기반 + 필터링된 공지사항 목록
  const filteredNotices = useMemo(() => {
    return NOTICES.filter((notice) => {
      // 역할 기반 필터링: HQ는 전체, DIV는 전체 대상 또는 예하 부대 대상만
      const hasAccess = user?.role === 'ROLE_HQ' || 
        notice.target === 'all' || 
        accessibleUnits.some(unit => notice.targetLabel.includes(unit.name));
      
      if (!hasAccess) return false;

      const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notice.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notice.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || notice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [user?.role, accessibleUnits, searchQuery, statusFilter]);

  // 역할 기반 + 필터링된 일일 사고사례 목록
  const filteredIncidents = useMemo(() => {
    return INCIDENTS.filter((incident) => {
      // 역할 기반 필터링: HQ는 전체, DIV는 예하 부대 장소만
      const hasAccess = user?.role === 'ROLE_HQ' || 
        accessibleUnits.some(unit => incident.location.includes(unit.name));
      
      if (!hasAccess) return false;

      const matchesSearch = incident.title.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
                           incident.description.toLowerCase().includes(incidentSearchQuery.toLowerCase()) ||
                           incident.location.toLowerCase().includes(incidentSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [user?.role, accessibleUnits, incidentSearchQuery]);

  // 페이지네이션 계산 - 공지사항
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotices = filteredNotices.slice(startIndex, endIndex);

  // 페이지네이션 계산 - 일일 사고사례
  const incidentTotalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const incidentStartIndex = (incidentCurrentPage - 1) * itemsPerPage;
  const incidentEndIndex = incidentStartIndex + itemsPerPage;
  const paginatedIncidents = filteredIncidents.slice(incidentStartIndex, incidentEndIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleIncidentSearchChange = (value: string) => {
    setIncidentSearchQuery(value);
    setIncidentCurrentPage(1);
  };

  const handleStatusFilterChange = (value: 'all' | 'active' | 'expired') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const getSeverityLabel = (severity: IncidentSeverity) => INCIDENT_SEVERITY_LABELS[severity];

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'MINOR':
        return 'text-muted-foreground';
      case 'SERIOUS':
        return 'text-yellow-600';
      case 'CRITICAL':
        return 'text-red-600';
      case 'CATASTROPHIC':
        return 'text-red-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-page-enter">
        <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
        <div className="h-96 bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="공지 관리" 
        description="공지사항 및 일일 사고사례 관리"
        actions={
          activeTab === 'notices' ? (
            <ActionButton label="공지 추가" onClick={() => navigate('/admin/notice/new')} />
          ) : (
            <ActionButton label="사고사례 추가" onClick={() => navigate('/admin/incident/new')} />
          )
        }
      />

      {/* 탭 네비게이션 */}
      <TabNavigation 
        tabs={TABS} 
        activeTab={activeTab} 
        onChange={handleTabChange} 
      />

      {/* 공지사항 탭 */}
      {activeTab === 'notices' && (
        <section>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">공지사항</h2>
              <p className="text-xs text-muted-foreground">
                총 {NOTICES.length}건 · 활성 {NOTICES.filter(n => n.status === 'active').length}건
                {(searchQuery || statusFilter !== 'all') && ` · 검색결과 ${filteredNotices.length}건`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'expired')}
                className="h-8 px-3 text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="expired">만료</option>
              </select>
              <div className="relative flex-1 min-w-[200px] lg:flex-none lg:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="제목, 내용, 작성자 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-8 pl-8 pr-3 w-full text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="border-t border-border">
                <TableHead className="text-xs">제목</TableHead>
                <TableHead className="text-xs w-28">발송 대상</TableHead>
                <TableHead className="text-xs w-16 text-center">첨부</TableHead>
                <TableHead className="text-xs w-28">등록일</TableHead>
                <TableHead className="text-xs w-24">작성자</TableHead>
                <TableHead className="text-xs w-16 text-center">상태</TableHead>
                <TableHead className="text-xs w-20 text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNotices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNotices.map((notice) => (
                <TableRow 
                  key={notice.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/notice/${notice.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{notice.title}</span>
                      {notice.hasVideo && (
                        <Video className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {notice.targetLabel}
                  </TableCell>
                  <TableCell className="text-center">
                    {notice.hasAttachment && (
                      <Paperclip className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {notice.createdAt}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {notice.author}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-xs",
                      notice.status === 'active' ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {notice.status === 'active' ? '활성' : '만료'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {canEdit(notice.author) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/notice/${notice.id}`);
                          }}
                          className="p-1 rounded hover:bg-muted transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                      {canDelete(notice.author) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // 삭제 로직
                          }}
                          className="p-1 rounded hover:bg-muted transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                      {!canEdit(notice.author) && !canDelete(notice.author) && (
                        <span className="text-[10px] text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <p className="text-xs text-muted-foreground">
                {filteredNotices.length}건 중 {startIndex + 1}-{Math.min(endIndex, filteredNotices.length)}건 표시
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 text-xs border rounded transition-colors",
                      currentPage === page
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border mt-4">
            <p>• 공지사항은 대상자 로그인 시 팝업으로 표시됩니다 ("오늘 하루 보지 않기" 선택 가능)</p>
            <p>• <strong>전체 발송</strong>: Super Admin 권한 필요 / <strong>예하 부대 발송</strong>: Admin 권한 이상</p>
          </div>
        </section>
      )}

      {/* 일일 사고사례 탭 */}
      {activeTab === 'incidents' && (
        <section>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">일일 사고사례</h2>
              <p className="text-xs text-muted-foreground">
                총 {INCIDENTS.length}건
                {incidentSearchQuery && ` · 검색결과 ${filteredIncidents.length}건`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[200px] lg:flex-none lg:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="제목, 내용, 장소 검색..."
                  value={incidentSearchQuery}
                  onChange={(e) => handleIncidentSearchChange(e.target.value)}
                  className="h-8 pl-8 pr-3 w-full text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="border-t border-border">
                <TableHead className="text-xs">제목</TableHead>
                <TableHead className="text-xs w-24">분류</TableHead>
                <TableHead className="text-xs w-28">발생일</TableHead>
                <TableHead className="text-xs w-36">발생장소</TableHead>
                <TableHead className="text-xs w-20 text-center">심각도</TableHead>
                <TableHead className="text-xs w-24">작성자</TableHead>
                <TableHead className="text-xs w-20 text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIncidents.map((incident) => (
                <TableRow 
                  key={incident.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/admin/incident/${incident.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn("w-3.5 h-3.5", getSeverityColor(incident.severity))} />
                      <span className="text-sm">{incident.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {incident.category}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {incident.incidentDate}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[128px]">
                    {incident.location}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn("text-xs font-medium", getSeverityColor(incident.severity))}>
                      {getSeverityLabel(incident.severity)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {incident.author}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {canEdit(incident.author) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/incident/${incident.id}`);
                          }}
                          className="p-1 rounded hover:bg-muted transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                      {canDelete(incident.author) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // 삭제 로직
                          }}
                          className="p-1 rounded hover:bg-muted transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                      {!canEdit(incident.author) && !canDelete(incident.author) && (
                        <span className="text-[10px] text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          {incidentTotalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
              <p className="text-xs text-muted-foreground">
                {filteredIncidents.length}건 중 {incidentStartIndex + 1}-{Math.min(incidentEndIndex, filteredIncidents.length)}건 표시
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIncidentCurrentPage(1)}
                  disabled={incidentCurrentPage === 1}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIncidentCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={incidentCurrentPage === 1}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: incidentTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setIncidentCurrentPage(page)}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 text-xs border rounded transition-colors",
                      incidentCurrentPage === page
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setIncidentCurrentPage(prev => Math.min(prev + 1, incidentTotalPages))}
                  disabled={incidentCurrentPage === incidentTotalPages}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIncidentCurrentPage(incidentTotalPages)}
                  disabled={incidentCurrentPage === incidentTotalPages}
                  className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border mt-4">
            <p>• 일일 사고사례는 안전교육 자료로 활용됩니다</p>
            <p>• 심각도에 따라 상위 보고 대상이 결정됩니다</p>
          </div>
        </section>
      )}
    </div>
  );
}
