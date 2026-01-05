import { FileText, ChevronRight, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  isPinned: boolean;
  isNew: boolean;
}

const MOCK_NOTICES: NoticeItem[] = [
  { id: '1', title: '겨울철 안전사고 예방 강화 기간 운영 안내', date: '2026-01-05', isPinned: true, isNew: true },
  { id: '2', title: '2026년 1분기 안전교육 일정 공지', date: '2026-01-04', isPinned: true, isNew: true },
  { id: '3', title: '시스템 정기 점검 안내 (매주 일요일 02:00-04:00)', date: '2026-01-03', isPinned: false, isNew: false },
  { id: '4', title: '사고예방시스템 신규 기능 업데이트 안내', date: '2026-01-02', isPinned: false, isNew: false },
  { id: '5', title: '12월 안전사고 통계 보고서 발간', date: '2025-12-30', isPinned: false, isNew: false },
  { id: '6', title: '연말연시 비상연락망 운영 안내', date: '2025-12-28', isPinned: false, isNew: false },
  { id: '7', title: '한파 대비 시설물 점검 지침', date: '2025-12-25', isPinned: false, isNew: false },
  { id: '8', title: '2025년 4분기 우수부대 시상 결과', date: '2025-12-23', isPinned: false, isNew: false },
];

export function NoticeListPanel() {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">공지사항</span>
        </div>
        <button className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <span>전체보기</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 공지 목록 */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {MOCK_NOTICES.map((notice) => (
            <button
              key={notice.id}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-2">
                {/* 고정 아이콘 */}
                {notice.isPinned && (
                  <Pin className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn(
                      'text-sm truncate',
                      notice.isPinned ? 'font-medium text-foreground' : 'text-foreground/90'
                    )}>
                      {notice.title}
                    </p>
                    {notice.isNew && (
                      <span className="px-1 py-0.5 text-[9px] font-bold bg-status-error text-white rounded shrink-0">
                        N
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {notice.date}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
