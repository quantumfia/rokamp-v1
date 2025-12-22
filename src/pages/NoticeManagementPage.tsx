import { useState } from 'react';
import { Trash2, Video, Paperclip, Upload, X, Edit2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { PageHeader, ActionButton, AddModal } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { cn } from '@/lib/utils';

// 공지사항 Mock 데이터
interface Notice {
  id: number;
  title: string;
  content: string;
  target: string;
  targetLabel: string;
  videoUrl: string;
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
    videoUrl: 'https://youtu.be/example1',
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
    videoUrl: '',
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
    videoUrl: 'https://youtu.be/example2',
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
    videoUrl: '',
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
    videoUrl: 'https://youtu.be/example3',
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
    videoUrl: '',
    hasVideo: false,
    hasAttachment: false,
    createdAt: '2024-12-03', 
    author: '김철수 대령',
    status: 'active'
  },
  { 
    id: 7, 
    title: '화재 대피 훈련 실시 안내', 
    content: '정기 화재 대피 훈련을 실시합니다.\n\n훈련일시: 2024년 12월 22일 14:00\n대상: 본부 건물 전 인원',
    target: 'all', 
    targetLabel: '전체',
    videoUrl: '',
    hasVideo: false,
    hasAttachment: true,
    createdAt: '2024-12-02', 
    author: '최영호 소령',
    status: 'active'
  },
  { 
    id: 8, 
    title: '보안 점검 결과 통보', 
    content: '11월 정기 보안 점검 결과를 통보합니다.\n\n각 부대별 미흡사항을 확인하시고 조치하시기 바랍니다.',
    target: 'division', 
    targetLabel: '제5군수지원사령부',
    videoUrl: '',
    hasVideo: false,
    hasAttachment: true,
    createdAt: '2024-12-01', 
    author: '정승훈 대령',
    status: 'expired'
  },
  { 
    id: 9, 
    title: '체력 검정 일정 변경 안내', 
    content: '체력 검정 일정이 변경되었습니다.\n\n변경전: 12월 25일 → 변경후: 12월 27일\n사유: 기상 악화 예보',
    target: 'all', 
    targetLabel: '전체',
    videoUrl: '',
    hasVideo: false,
    hasAttachment: false,
    createdAt: '2024-11-30', 
    author: '이영희 준장',
    status: 'active'
  },
  { 
    id: 10, 
    title: '사이버 보안 교육 필수 이수 안내', 
    content: '연간 사이버 보안 교육 이수 기한이 얼마 남지 않았습니다.\n\n이수기한: 2024년 12월 31일\n미이수 시 불이익이 있을 수 있습니다.',
    target: 'all', 
    targetLabel: '전체',
    videoUrl: 'https://youtu.be/example4',
    hasVideo: true,
    hasAttachment: false,
    createdAt: '2024-11-28', 
    author: '김철수 대령',
    status: 'active'
  },
  { 
    id: 11, 
    title: '11월 안전 우수 부대 포상', 
    content: '11월 안전 우수 부대로 선정된 부대를 포상합니다.\n\n우수부대: 제3보병연대\n포상내용: 부대표창 및 포상휴가',
    target: 'division', 
    targetLabel: '제32보병사단',
    videoUrl: '',
    hasVideo: false,
    hasAttachment: true,
    createdAt: '2024-11-25', 
    author: '이영희 준장',
    status: 'expired'
  },
  { 
    id: 12, 
    title: '겨울철 차량 관리 지침', 
    content: '겨울철 차량 관리 지침을 하달합니다.\n\n1. 부동액 점검\n2. 배터리 상태 확인\n3. 타이어 체인 준비',
    target: 'all', 
    targetLabel: '전체',
    videoUrl: '',
    hasVideo: false,
    hasAttachment: true,
    createdAt: '2024-11-22', 
    author: '박민수 중령',
    status: 'active'
  },
  { 
    id: 13, 
    title: '비상 연락망 갱신 요청', 
    content: '비상 연락망 갱신이 필요합니다.\n\n갱신기한: 2024년 12월 20일까지\n각 부대별 담당자는 연락망을 최신화하시기 바랍니다.',
    target: 'all', 
    targetLabel: '전체',
    videoUrl: '',
    hasVideo: false,
    hasAttachment: false,
    createdAt: '2024-11-20', 
    author: '최영호 소령',
    status: 'active'
  },
];

type ModalMode = 'create' | 'view' | 'edit';

export default function NoticeManagementPage() {
  const isLoading = usePageLoading(800);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  
  // 폼 상태
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTarget, setNoticeTarget] = useState('all');
  const [videoUrl, setVideoUrl] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
  // 삭제 확인 다이얼로그 상태
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 필터링된 공지사항 목록
  const filteredNotices = NOTICES.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || notice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotices = filteredNotices.slice(startIndex, endIndex);

  // 검색/필터 변경 시 페이지 초기화
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: 'all' | 'active' | 'expired') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleOpenModal = (mode: ModalMode, notice?: Notice) => {
    setModalMode(mode);
    if (notice && (mode === 'view' || mode === 'edit')) {
      setSelectedNotice(notice);
      setNoticeTitle(notice.title);
      setNoticeContent(notice.content);
      setNoticeTarget(notice.target);
      setVideoUrl(notice.videoUrl);
      setAttachedFile(null);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotice(null);
    resetForm();
  };

  const handleSubmit = () => {
    if (modalMode === 'view') {
      handleCloseModal();
      return;
    }

    if (!noticeTitle.trim() || !noticeContent.trim()) {
      toast({
        title: '입력 오류',
        description: '제목과 내용을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (modalMode === 'create') {
      toast({
        title: '공지 등록 완료',
        description: '공지사항이 등록되었습니다. 대상자 로그인 시 팝업으로 표시됩니다.',
      });
    } else if (modalMode === 'edit') {
      toast({
        title: '공지 수정 완료',
        description: '공지사항이 수정되었습니다.',
      });
    }
    handleCloseModal();
  };

  const resetForm = () => {
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeTarget('all');
    setVideoUrl('');
    setAttachedFile(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleDeleteClick = (notice: Notice) => {
    setNoticeToDelete(notice);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (noticeToDelete) {
      toast({
        title: '공지 삭제',
        description: '공지사항이 삭제되었습니다.',
      });
      setNoticeToDelete(null);
    }
    setShowDeleteDialog(false);
    handleCloseModal();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getModalConfig = () => {
    switch (modalMode) {
      case 'view':
        return {
          title: '공지사항 상세보기',
          description: '공지 내용 확인',
          submitLabel: '확인',
        };
      case 'edit':
        return {
          title: '공지사항 수정',
          description: '공지 내용 수정',
          submitLabel: '저장',
        };
      default:
        return {
          title: '공지사항 추가',
          description: '공지 내용 입력 및 첨부파일 추가',
          submitLabel: '등록',
        };
    }
  };

  const isViewMode = modalMode === 'view';

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-page-enter">
        <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
        <div className="h-96 bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  // 폼 (view 모드일 때는 disabled)
  const NoticeForm = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="notice-title" className="text-xs text-muted-foreground">제목 {!isViewMode && '*'}</Label>
        <Input
          id="notice-title"
          placeholder="공지 제목을 입력하세요"
          value={noticeTitle}
          onChange={(e) => setNoticeTitle(e.target.value)}
          className="bg-background"
          disabled={isViewMode}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notice-content" className="text-xs text-muted-foreground">내용 {!isViewMode && '*'}</Label>
        <Textarea
          id="notice-content"
          placeholder="공지 내용을 입력하세요"
          rows={4}
          value={noticeContent}
          onChange={(e) => setNoticeContent(e.target.value)}
          className="bg-background"
          disabled={isViewMode}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">발송 대상</Label>
        <select 
          value={noticeTarget} 
          onChange={(e) => setNoticeTarget(e.target.value)}
          className="w-full h-9 px-3 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isViewMode}
        >
          <option value="all">전체 (전군)</option>
          <option value="division">예하 부대</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="video-url" className="text-xs text-muted-foreground">YouTube URL (선택)</Label>
        <Input
          id="video-url"
          placeholder="https://youtu.be/..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="bg-background"
          disabled={isViewMode}
        />
      </div>

      {!isViewMode && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">첨부파일 (선택)</Label>
          {!attachedFile ? (
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded cursor-pointer hover:border-muted-foreground transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">파일 선택</span>
              <input
                type="file"
                accept=".hwp,.pdf,.docx,.xlsx,.pptx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 border border-border rounded">
              <div className="flex items-center gap-2 min-w-0">
                <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{attachedFile.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  ({formatFileSize(attachedFile.size)})
                </span>
              </div>
              <button 
                onClick={() => setAttachedFile(null)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      )}

      {isViewMode && selectedNotice?.hasAttachment && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">첨부파일</Label>
          <div className="flex items-center gap-2 px-3 py-2 border border-border rounded">
            <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">첨부파일이 있습니다</span>
          </div>
        </div>
      )}
    </div>
  );

  const inputTypes = [
    { id: 'direct', label: '직접 입력', content: NoticeForm },
  ];

  const modalConfig = getModalConfig();

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="공지사항 관리" 
        description="부대별 공지사항 작성 및 발송 관리"
        actions={
          <ActionButton label="공지 추가" onClick={() => handleOpenModal('create')} />
        }
      />

      {/* 공지 목록 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">공지사항 목록</h2>
            <p className="text-xs text-muted-foreground">
              총 {NOTICES.length}건 · 활성 {NOTICES.filter(n => n.status === 'active').length}건
              {(searchQuery || statusFilter !== 'all') && ` · 검색결과 ${filteredNotices.length}건`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* 상태 필터 */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as 'all' | 'active' | 'expired')}
              className="h-8 px-3 text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="expired">만료</option>
            </select>
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="제목, 내용, 작성자 검색..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-8 pl-8 pr-3 w-56 text-xs"
              />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-t border-border">
              <TableHead className="text-xs min-w-[200px]">제목</TableHead>
              <TableHead className="text-xs w-24">발송 대상</TableHead>
              <TableHead className="text-xs w-14 text-center">첨부</TableHead>
              <TableHead className="text-xs w-24">등록일</TableHead>
              <TableHead className="text-xs w-20">작성자</TableHead>
              <TableHead className="text-xs w-14 text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedNotices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paginatedNotices.map((notice) => (
              <TableRow 
                key={notice.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleOpenModal('view', notice)}
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
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
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

        {/* 안내 */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border mt-4">
          <p>• 공지사항은 대상자 로그인 시 팝업으로 표시됩니다 ("오늘 하루 보지 않기" 선택 가능)</p>
          <p>• <strong>전체 발송</strong>: Super Admin 권한 필요 / <strong>예하 부대 발송</strong>: Admin 권한 이상</p>
        </div>
      </section>

      {/* 공지 모달 (생성/상세보기/수정) */}
      <AddModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalConfig.title}
        description={modalConfig.description}
        inputTypes={inputTypes}
        onSubmit={handleSubmit}
        submitLabel={modalConfig.submitLabel}
        isSubmitDisabled={!isViewMode && (!noticeTitle.trim() || !noticeContent.trim())}
        footerActions={
          isViewMode && selectedNotice ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setModalMode('edit');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                수정
              </button>
              <button
                onClick={() => {
                  handleDeleteClick(selectedNotice);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-destructive border border-destructive/30 rounded-md hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            </div>
          ) : undefined
        }
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{noticeToDelete?.title}" 공지사항을 삭제하시겠습니까?<br />
              삭제된 공지사항은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
