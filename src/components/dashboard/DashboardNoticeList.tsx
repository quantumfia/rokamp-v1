import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Notice {
  id: string;
  title: string;
  date: string;
  department: string;
  tag: '일반' | '인사' | '행사';
}

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: '야외훈련 간 사고예방 1분 안전학습',
    date: '2026.01.05',
    department: '육군본부 안전관리과',
    tag: '일반',
  },
  {
    id: '2',
    title: '겨울철 안전사고 예방 강화 기간 운영 안내',
    date: '2026.01.02',
    department: '육군본부 안전관리과',
    tag: '일반',
  },
  {
    id: '3',
    title: '시스템 정기 점검 시간 안내',
    date: '2025.12.28',
    department: '정보체계관리단',
    tag: '일반',
  },
  {
    id: '4',
    title: '동절기 차량 운행 주의사항 안내',
    date: '2025.12.26',
    department: '육군본부 군사경찰실',
    tag: '일반',
  },
  {
    id: '5',
    title: '2026년 상반기 진급심사 일정 공고',
    date: '2025.12.22',
    department: '육군본부 인사사령부',
    tag: '인사',
  },
  {
    id: '6',
    title: '창군기념일 행사 참석 안내',
    date: '2025.12.20',
    department: '육군본부 공보정훈실',
    tag: '행사',
  },
  {
    id: '7',
    title: '신년 안전점검 주간 운영 계획',
    date: '2025.12.18',
    department: '육군본부 안전관리과',
    tag: '일반',
  },
  {
    id: '8',
    title: '동계 휴가 일정 조정 안내',
    date: '2025.12.15',
    department: '육군본부 인사사령부',
    tag: '인사',
  },
  {
    id: '9',
    title: '연말 송년 행사 일정 안내',
    date: '2025.12.12',
    department: '육군본부 공보정훈실',
    tag: '행사',
  },
  {
    id: '10',
    title: '동절기 난방시설 점검 결과',
    date: '2025.12.10',
    department: '육군본부 시설관리과',
    tag: '일반',
  },
];

const TAG_FILTERS = ['전체', '일반', '인사', '행사'] as const;
type TagFilter = typeof TAG_FILTERS[number];

const getTagStyle = (tag: Notice['tag']) => {
  switch (tag) {
    case '인사':
      return 'text-primary';
    case '행사':
      return 'text-status-warning';
    default:
      return 'text-muted-foreground';
  }
};

export function DashboardNoticeList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<TagFilter>('전체');

  const handleViewAll = () => {
    navigate('/admin/notice');
  };

  const handleNoticeClick = (noticeId: string) => {
    navigate(`/admin/notice/${noticeId}`);
  };

  const filteredNotices = (activeFilter === '전체' 
    ? MOCK_NOTICES 
    : MOCK_NOTICES.filter(notice => notice.tag === activeFilter)
  ).slice(0, 8);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-sm font-semibold text-foreground">공지사항</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleViewAll}
        >
          전체보기
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </div>

      {/* Tag Filter Tabs - 밑줄 스타일 */}
      <div className="flex items-center px-4 pb-2">
        {TAG_FILTERS.map((filter, idx) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "relative px-3 py-1.5 text-xs transition-colors",
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

      {/* Notice List - 컴팩트 한 줄 형식 */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotices.map((notice) => (
          <button
            key={notice.id}
            onClick={() => handleNoticeClick(notice.id)}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors text-left border-b border-border/30"
          >
            {/* 태그 + 제목 + 부서 */}
            <div className="flex-1 min-w-0 flex items-center gap-1 text-xs">
              <span className={cn("shrink-0 font-medium", getTagStyle(notice.tag))}>
                [{notice.tag}]
              </span>
              <span className="text-foreground truncate">{notice.title}</span>
              <span className="text-muted-foreground shrink-0">·</span>
              <span className="text-muted-foreground truncate shrink-0 max-w-[140px]">{notice.department}</span>
            </div>
            {/* 날짜 */}
            <span className="text-[11px] text-muted-foreground shrink-0">{notice.date}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
