import { useState } from 'react';
import { X, Pin, Calendar, ChevronRight } from 'lucide-react';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned?: boolean;
  category?: string;
}

interface NoticeModalProps {
  onClose: () => void;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: '겨울철 안전사고 예방 강화 기간 운영',
    content: '2024년 12월 1일부터 2025년 2월 28일까지 겨울철 안전사고 예방 강화 기간으로 운영됩니다. 모든 부대는 동파 및 화재 예방에 각별히 유의하시기 바랍니다. 세부 지침은 별도 공문을 참고하시기 바랍니다.',
    date: '2024-12-01',
    isPinned: true,
    category: '안전',
  },
  {
    id: '2',
    title: '시스템 정기 점검 안내',
    content: '매주 일요일 02:00-04:00 시스템 정기 점검이 진행됩니다. 해당 시간에는 서비스 이용이 제한될 수 있습니다.',
    date: '2024-11-28',
    isPinned: false,
    category: '시스템',
  },
  {
    id: '3',
    title: '12월 예보 모델 업데이트 완료',
    content: '사고 예측 모델이 최신 데이터로 업데이트되었습니다. 기상 변수 및 훈련 강도에 대한 예측 정확도가 향상되었습니다.',
    date: '2024-11-25',
    isPinned: false,
    category: '업데이트',
  },
];

export function NoticeModal({ onClose }: NoticeModalProps) {
  const [hideToday, setHideToday] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(MOCK_NOTICES[0]?.id || null);

  const handleClose = () => {
    if (hideToday) {
      const expiry = new Date();
      expiry.setHours(23, 59, 59, 999);
      localStorage.setItem('hideNoticeUntil', expiry.toISOString());
    }
    onClose();
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case '안전': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case '시스템': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case '업데이트': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">공지사항</h2>
              <p className="text-xs text-muted-foreground">총 {MOCK_NOTICES.length}건의 공지</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Notice List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {MOCK_NOTICES.map((notice, index) => (
            <div
              key={notice.id}
              className={`
                border-b border-border last:border-b-0 cursor-pointer transition-colors
                ${expandedId === notice.id ? 'bg-muted/30' : 'hover:bg-muted/20'}
              `}
              onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
            >
              {/* Notice Header */}
              <div className="px-6 py-4">
                <div className="flex items-start gap-3">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Title Row */}
                    <div className="flex items-center gap-2 mb-1">
                      {notice.isPinned && (
                        <Pin className="w-3 h-3 text-primary flex-shrink-0" />
                      )}
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {notice.title}
                      </h3>
                    </div>
                    
                    {/* Meta Row */}
                    <div className="flex items-center gap-2">
                      {notice.category && (
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getCategoryColor(notice.category)}`}>
                          {notice.category}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{notice.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${expandedId === notice.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === notice.id && (
                <div className="px-6 pb-4">
                  <div className="ml-9 pl-4 border-l-2 border-primary/30">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <label className="flex items-center gap-2 cursor-pointer group">
            <CheckboxUI
              checked={hideToday}
              onCheckedChange={(checked) => setHideToday(checked === true)}
              className="border-muted-foreground/50"
            />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              오늘 하루 보지 않기
            </span>
          </label>
          <button 
            onClick={handleClose}
            className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
