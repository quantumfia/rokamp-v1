import { useState } from 'react';
import { X } from 'lucide-react';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';

interface Notice {
  id: string;
  number: string;
  title: string;
  content: string;
  date: string;
  department: string;
}

interface NoticeModalProps {
  onClose: () => void;
}

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    number: '제2024-127호',
    title: '겨울철 안전사고 예방 강화 기간 운영 안내',
    content: '2024년 12월 1일부터 2025년 2월 28일까지 겨울철 안전사고 예방 강화 기간으로 운영됩니다. 모든 부대는 동파 및 화재 예방에 각별히 유의하시기 바랍니다.',
    date: '2024.12.01',
    department: '육군본부 안전관리과',
  },
  {
    id: '2',
    number: '제2024-126호',
    title: '시스템 정기 점검 시간 안내',
    content: '매주 일요일 02:00-04:00 시스템 정기 점검이 진행됩니다. 해당 시간에는 서비스 이용이 제한될 수 있습니다.',
    date: '2024.11.28',
    department: '정보체계관리단',
  },
];

export function NoticeModal({ onClose }: NoticeModalProps) {
  const [hideToday, setHideToday] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice>(MOCK_NOTICES[0]);

  const handleClose = () => {
    if (hideToday) {
      const expiry = new Date();
      expiry.setHours(23, 59, 59, 999);
      localStorage.setItem('hideNoticeUntil', expiry.toISOString());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between h-10 px-4 bg-[#111] border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary" />
            <span className="text-xs font-medium text-white tracking-wide">공지사항</span>
            <span className="text-[10px] text-muted-foreground ml-2">NOTICE</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex">
          {/* Left: Notice List */}
          <div className="w-48 border-r border-[#2a2a2a] bg-[#1a1a1a]">
            <div className="px-3 py-2 border-b border-[#2a2a2a]">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">목록</span>
            </div>
            <div className="max-h-[280px] overflow-y-auto">
              {MOCK_NOTICES.map((notice, index) => (
                <button
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`w-full text-left px-3 py-3 border-b border-[#2a2a2a] transition-colors ${
                    selectedNotice.id === notice.id 
                      ? 'bg-[#2a2a2a] border-l-2 border-l-gray-500' 
                      : 'hover:bg-[#252525] border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="text-[10px] text-gray-500 mb-1">{notice.number}</div>
                  <div className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{notice.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Notice Detail */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Detail Header */}
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] text-primary font-medium">{selectedNotice.number}</span>
                <span className="text-[10px] text-gray-500">{selectedNotice.date}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 leading-relaxed">
                {selectedNotice.title}
              </h3>
              <div className="mt-2 text-[10px] text-gray-500">
                발신: {selectedNotice.department}
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 px-5 py-4 max-h-[180px] overflow-y-auto">
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedNotice.content}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between h-12 px-4 border-t border-[#1a1a1a] bg-[#0d0d0d]">
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
            className="h-7 px-5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
