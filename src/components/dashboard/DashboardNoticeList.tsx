import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Notice {
  id: string;
  title: string;
  date: string;
  department: string;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: '야외훈련 간 사고예방 1분 안전학습',
    date: '2025.01.05',
    department: '육군본부 안전관리과',
  },
  {
    id: '2',
    title: '겨울철 안전사고 예방 강화 기간 운영 안내',
    date: '2025.01.02',
    department: '육군본부 안전관리과',
  },
  {
    id: '3',
    title: '시스템 정기 점검 시간 안내',
    date: '2024.12.28',
    department: '정보체계관리단',
  },
  {
    id: '4',
    title: '동절기 차량 운행 주의사항 안내',
    date: '2024.12.20',
    department: '육군본부 안전관리과',
  },
];

export function DashboardNoticeList() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/notice');
  };

  const handleNoticeClick = (noticeId: string) => {
    navigate(`/notice?id=${noticeId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">공지사항</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleViewAll}
        >
          전체보기
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </div>

      {/* Notice List */}
      <div className="flex-1 overflow-y-auto px-4">
        {MOCK_NOTICES.map((notice, index) => (
          <button
            key={notice.id}
            onClick={() => handleNoticeClick(notice.id)}
            className={cn(
              "w-full flex items-start gap-3 py-3 hover:bg-muted/50 transition-colors text-left rounded-lg px-2 -mx-2",
              index < MOCK_NOTICES.length - 1 && "border-b border-border/30"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground line-clamp-1">{notice.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{notice.date}</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground truncate">{notice.department}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
