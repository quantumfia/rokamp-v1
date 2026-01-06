import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FileText, ExternalLink, ChevronRight, Printer } from 'lucide-react';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

type NoticeTag = '일반' | '인사' | '행사';

interface Notice {
  id: string;
  number: string;
  title: string;
  content: string;
  date: string;
  department: string;
  tag: NoticeTag;
  youtubeUrl?: string;
  attachments?: Attachment[];
}

interface NoticeModalProps {
  onClose: () => void;
}

// 유튜브 URL을 임베드 URL로 변환
const getYoutubeEmbedUrl = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

const TAG_FILTERS = ['전체', '일반', '인사', '행사'] as const;
type TagFilter = typeof TAG_FILTERS[number];

const getTagStyle = (tag: NoticeTag) => {
  switch (tag) {
    case '인사':
      return 'text-primary';
    case '행사':
      return 'text-status-warning';
    default:
      return 'text-muted-foreground';
  }
};

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    number: '제2026-001호',
    title: '야외훈련 간 사고예방 1분 안전학습',
    content: '야외훈련 시 발생할 수 있는 각종 안전사고 예방을 위한 1분 안전학습 영상입니다. 모든 부대는 훈련 전 본 영상을 시청하여 안전의식을 고취하시기 바랍니다.\n\n• 시청 대상: 전 장병\n• 시청 시기: 야외훈련 실시 전\n• 관련 규정: 육군 안전관리 규정 제45조',
    date: '2026.01.05',
    department: '육군본부 안전관리과',
    tag: '일반',
    youtubeUrl: 'https://youtu.be/RJf8I1bpjbs?si=Fh0j2OvGx03flQ-T',
    attachments: [
      { id: 'a1', name: '야외훈련_안전수칙_체크리스트.pdf', size: '1.2MB', type: 'pdf' },
      { id: 'a2', name: '사고예방_교육자료.hwp', size: '856KB', type: 'hwp' },
    ],
  },
  {
    id: '2',
    number: '제2026-002호',
    title: '겨울철 안전사고 예방 강화 기간 운영 안내',
    content: '2026년 1월 1일부터 2026년 2월 28일까지 겨울철 안전사고 예방 강화 기간으로 운영됩니다. 모든 부대는 동파 및 화재 예방에 각별히 유의하시기 바랍니다.\n\n주요 점검 사항:\n• 난방시설 점검 및 정비\n• 소화기 비치 현황 확인\n• 비상 연락망 최신화',
    date: '2026.01.02',
    department: '육군본부 안전관리과',
    tag: '일반',
    attachments: [
      { id: 'a3', name: '동절기_안전관리_지침.pdf', size: '2.4MB', type: 'pdf' },
    ],
  },
  {
    id: '3',
    number: '제2025-125호',
    title: '시스템 정기 점검 시간 안내',
    content: '매주 일요일 02:00-04:00 시스템 정기 점검이 진행됩니다. 해당 시간에는 서비스 이용이 제한될 수 있습니다.',
    date: '2025.12.28',
    department: '정보체계관리단',
    tag: '일반',
  },
  {
    id: '4',
    number: '제2025-124호',
    title: '동절기 차량 운행 주의사항 안내',
    content: '동절기 차량 운행 시 안전사고 예방을 위한 주의사항을 안내드립니다.\n\n• 출발 전 차량 예열 필수\n• 빙판길 서행 운전\n• 타이어 공기압 점검\n• 부동액 및 워셔액 확인',
    date: '2025.12.26',
    department: '육군본부 군사경찰실',
    tag: '일반',
  },
  {
    id: '5',
    number: '제2025-123호',
    title: '2026년 상반기 진급심사 일정 공고',
    content: '2026년 상반기 진급심사 일정을 다음과 같이 공고합니다.\n\n• 서류 접수: 2026.01.15 ~ 2026.01.31\n• 심사 기간: 2026.02.01 ~ 2026.02.28\n• 결과 발표: 2026.03.15',
    date: '2025.12.22',
    department: '육군본부 인사사령부',
    tag: '인사',
  },
  {
    id: '6',
    number: '제2025-122호',
    title: '창군기념일 행사 참석 안내',
    content: '창군기념일 행사 참석 안내드립니다.\n\n• 일시: 2025.10.01 10:00\n• 장소: 국군의장대 열병장\n• 복장: 정복',
    date: '2025.12.20',
    department: '육군본부 공보정훈실',
    tag: '행사',
  },
  {
    id: '7',
    number: '제2025-121호',
    title: '신년 안전점검 주간 운영 계획',
    content: '신년 안전점검 주간 운영 계획을 안내드립니다.\n\n• 기간: 2026.01.06 ~ 2026.01.12\n• 대상: 전 부대\n• 중점 점검 사항: 시설물 안전, 화재 예방, 전기 안전',
    date: '2025.12.18',
    department: '육군본부 안전관리과',
    tag: '일반',
  },
  {
    id: '8',
    number: '제2025-120호',
    title: '동계 휴가 일정 조정 안내',
    content: '동계 휴가 일정 조정 사항을 안내드립니다.\n\n• 휴가 기간: 2025.12.20 ~ 2026.01.10\n• 비상 연락망 유지 필수\n• 복귀 시 건강상태 확인',
    date: '2025.12.15',
    department: '육군본부 인사사령부',
    tag: '인사',
  },
  {
    id: '9',
    number: '제2025-119호',
    title: '연말 송년 행사 일정 안내',
    content: '연말 송년 행사 일정을 안내드립니다.\n\n• 일시: 2025.12.28 18:00\n• 장소: 각 부대 체육관\n• 참석 대상: 전 장병',
    date: '2025.12.12',
    department: '육군본부 공보정훈실',
    tag: '행사',
  },
  {
    id: '10',
    number: '제2025-118호',
    title: '동절기 난방시설 점검 결과',
    content: '동절기 난방시설 점검 결과를 안내드립니다.\n\n• 점검 기간: 2025.11.15 ~ 2025.12.05\n• 점검 결과: 전 부대 정상\n• 보수 필요 시설: 해당 부대 개별 통보',
    date: '2025.12.10',
    department: '육군본부 시설관리과',
    tag: '일반',
  },
];

export function NoticeModal({ onClose }: NoticeModalProps) {
  const navigate = useNavigate();
  const [hideToday, setHideToday] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TagFilter>('전체');
  const [selectedNotice, setSelectedNotice] = useState<Notice>(MOCK_NOTICES[0]);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [selectedNotice.id]);

  const handleClose = () => {
    if (hideToday) {
      const expiry = new Date();
      expiry.setHours(23, 59, 59, 999);
      localStorage.setItem('hideNoticeUntil', expiry.toISOString());
    }
    onClose();
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notice');
  };

  const handleViewMaterials = () => {
    window.open('https://portal.cstec.kr/auth/login', '_blank');
  };

  // 필터링된 공지사항 (5개로 제한)
  const filteredNotices = (activeFilter === '전체' 
    ? MOCK_NOTICES 
    : MOCK_NOTICES.filter(notice => notice.tag === activeFilter)
  ).slice(0, 5);

  // 선택된 공지가 필터된 목록에 없으면 첫 번째 공지 선택
  useEffect(() => {
    if (!filteredNotices.find(n => n.id === selectedNotice.id) && filteredNotices.length > 0) {
      setSelectedNotice(filteredNotices[0]);
    }
  }, [activeFilter]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/80" onClick={handleClose} />
      {/* Modal - Fixed size */}
      <div className="relative w-full max-w-3xl h-[520px] min-h-[520px] max-h-[520px] bg-background border border-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between h-10 px-4 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary" />
            <span className="text-xs font-medium text-foreground tracking-wide">공지사항</span>
            <span className="text-[10px] text-muted-foreground ml-2">NOTICE</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-muted transition-colors rounded"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left: Notice List */}
          <div className="w-56 border-r border-border bg-muted/30 flex flex-col">
            {/* Filter Tabs */}
            <div className="px-3 py-2 border-b border-border shrink-0">
              <div className="flex items-center">
                {TAG_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "relative px-2 py-1 text-[10px] transition-colors",
                      activeFilter === filter
                        ? "text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filter}
                    {activeFilter === filter && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-foreground rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Notice List (5개) + 전체보기 */}
            <div className="flex-1 flex flex-col">
              <div>
                {filteredNotices.map((notice) => (
                  <button
                    key={notice.id}
                    onClick={() => setSelectedNotice(notice)}
                    className={`w-full text-left px-3 py-2.5 border-b border-border/50 transition-colors ${
                      selectedNotice.id === notice.id 
                        ? 'bg-muted border-l-2 border-l-primary' 
                        : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[10px] mb-1">
                      <span className={cn("font-medium", getTagStyle(notice.tag))}>
                        [{notice.tag}]
                      </span>
                      <span className="text-muted-foreground">{notice.date}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-xs text-foreground line-clamp-1 flex-1">{notice.title}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {notice.department}
                    </div>
                  </button>
                ))}
              </div>
              {/* 하단 남는 영역 - 전체보기 버튼 */}
              <div className="flex-1 grid items-center justify-items-end px-3">
                <button
                  onClick={handleViewAll}
                  className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  전체보기
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Notice Detail */}
          <div className="flex-1 flex flex-col bg-background min-h-0">
            {/* Detail Header */}
            <div className="px-5 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] text-primary font-medium">{selectedNotice.number}</span>
                <span className="text-[10px] text-muted-foreground">{selectedNotice.date}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground leading-relaxed flex-1">
                  {selectedNotice.title}
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/notice', { state: { openNoticeId: selectedNotice.id } });
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground border border-border hover:bg-muted rounded transition-colors shrink-0"
                >
                  상세보기
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                발신: {selectedNotice.department}
              </div>
            </div>

            {/* Detail Content - Scrollable */}
            <div ref={contentScrollRef} className="flex-1 overflow-y-scroll">
              {/* YouTube Video */}
              {selectedNotice.youtubeUrl && (
                <div className="px-5 py-3 border-b border-border">
                  <div className="aspect-video w-full bg-black rounded overflow-hidden">
                    <iframe
                      src={getYoutubeEmbedUrl(selectedNotice.youtubeUrl)}
                      title={selectedNotice.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div className="px-5 py-3">
                <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {selectedNotice.content}
                </p>
              </div>

              {/* Attachments - 개별 문서 링크 */}
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="px-5 py-3 border-t border-border">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">첨부자료</div>
                  <div className="space-y-1.5">
                    {selectedNotice.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border rounded"
                      >
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs text-foreground truncate flex-1">{attachment.name}</span>
                        <span className="text-[10px] text-muted-foreground/60 shrink-0">({attachment.size})</span>
                        <button
                          onClick={handleViewMaterials}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="상세 자료 보기"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </button>
                        <button
                          onClick={handleViewMaterials}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="출력"
                        >
                          <Printer className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between h-12 px-4 border-t border-border bg-muted/30">
          <label className="flex items-center gap-2 cursor-pointer">
            <CheckboxUI
              checked={hideToday}
              onCheckedChange={(checked) => setHideToday(checked === true)}
              className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-[11px] text-muted-foreground">
              오늘 하루 보지 않기
            </span>
          </label>
          <button 
            onClick={handleClose}
            className="h-7 px-5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
