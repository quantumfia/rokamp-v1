import { useState } from 'react';
import { X } from 'lucide-react';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface NoticeModalProps {
  onClose: () => void;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: '겨울철 안전사고 예방 강화 기간 운영',
    content: '2024년 12월 1일부터 2025년 2월 28일까지 겨울철 안전사고 예방 강화 기간으로 운영됩니다. 모든 부대는 동파 및 화재 예방에 각별히 유의하시기 바랍니다.',
    date: '2024-12-01',
  },
  {
    id: '2',
    title: '시스템 정기 점검 안내',
    content: '매주 일요일 02:00-04:00 시스템 정기 점검이 진행됩니다. 해당 시간에는 서비스 이용이 제한될 수 있습니다.',
    date: '2024-11-28',
  },
];

export function NoticeModal({ onClose }: NoticeModalProps) {
  const [hideToday, setHideToday] = useState(false);

  const handleClose = () => {
    if (hideToday) {
      const expiry = new Date();
      expiry.setHours(23, 59, 59, 999);
      localStorage.setItem('hideNoticeUntil', expiry.toISOString());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background border border-border shadow-2xl rounded-sm overflow-hidden">
        {/* Header - 하늘색 액센트 */}
        <div className="flex items-center justify-between px-5 py-3 bg-primary">
          <h2 className="text-sm font-semibold text-primary-foreground">공지사항</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>

        {/* Content - 밝은 배경 */}
        <div className="max-h-[50vh] overflow-y-auto bg-background">
          {MOCK_NOTICES.map((notice, index) => (
            <div
              key={notice.id}
              className={index < MOCK_NOTICES.length - 1 ? 'border-b border-border' : ''}
            >
              <div className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="text-sm font-medium text-foreground">{notice.title}</h3>
                  <span className="text-[10px] text-muted-foreground tabular-nums flex-shrink-0">{notice.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {notice.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
          <label className="flex items-center gap-2 cursor-pointer">
            <CheckboxUI
              checked={hideToday}
              onCheckedChange={(checked) => setHideToday(checked === true)}
            />
            <span className="text-xs text-muted-foreground">
              오늘 하루 보지 않기
            </span>
          </label>
          <button 
            onClick={handleClose}
            className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
