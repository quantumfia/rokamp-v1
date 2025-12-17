import { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { Checkbox as CheckboxUI } from '@/components/ui/checkbox';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface Notice {
  id: string;
  number: string;
  title: string;
  content: string;
  date: string;
  department: string;
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

const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    number: '제2024-127호',
    title: '야외훈련 간 사고예방 1분 안전학습',
    content: '야외훈련 시 발생할 수 있는 각종 안전사고 예방을 위한 1분 안전학습 영상입니다. 모든 부대는 훈련 전 본 영상을 시청하여 안전의식을 고취하시기 바랍니다.\n\n• 시청 대상: 전 장병\n• 시청 시기: 야외훈련 실시 전\n• 관련 규정: 육군 안전관리 규정 제45조',
    date: '2024.12.15',
    department: '육군본부 안전관리과',
    youtubeUrl: 'https://youtu.be/RJf8I1bpjbs?si=Fh0j2OvGx03flQ-T',
    attachments: [
      { id: 'a1', name: '야외훈련_안전수칙_체크리스트.pdf', size: '1.2MB', type: 'pdf' },
      { id: 'a2', name: '사고예방_교육자료.hwp', size: '856KB', type: 'hwp' },
    ],
  },
  {
    id: '2',
    number: '제2024-126호',
    title: '겨울철 안전사고 예방 강화 기간 운영 안내',
    content: '2024년 12월 1일부터 2025년 2월 28일까지 겨울철 안전사고 예방 강화 기간으로 운영됩니다. 모든 부대는 동파 및 화재 예방에 각별히 유의하시기 바랍니다.\n\n주요 점검 사항:\n• 난방시설 점검 및 정비\n• 소화기 비치 현황 확인\n• 비상 연락망 최신화',
    date: '2024.12.01',
    department: '육군본부 안전관리과',
    attachments: [
      { id: 'a3', name: '동절기_안전관리_지침.pdf', size: '2.4MB', type: 'pdf' },
    ],
  },
  {
    id: '3',
    number: '제2024-125호',
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

  const handleDownload = (attachment: Attachment) => {
    // 실제 구현에서는 파일 다운로드 처리
    console.log('Downloading:', attachment.name);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
      
      {/* Modal - Fixed size */}
      <div className="relative w-full max-w-3xl h-[520px] bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col">
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

        <div className="flex flex-1 min-h-0">
          {/* Left: Notice List */}
          <div className="w-48 border-r border-[#3a3a3a] bg-[#2a2a2a] flex flex-col">
            <div className="px-3 py-2 border-b border-[#3a3a3a] shrink-0">
              <span className="text-[10px] text-gray-300 uppercase tracking-wider">목록</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {MOCK_NOTICES.map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className={`w-full text-left px-3 py-3 border-b border-[#3a3a3a] transition-colors ${
                    selectedNotice.id === notice.id 
                      ? 'bg-[#404040] border-l-2 border-l-gray-400' 
                      : 'hover:bg-[#353535] border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="text-[10px] text-gray-400 mb-1">{notice.number}</div>
                  <div className="text-xs text-gray-200 line-clamp-2 leading-relaxed">{notice.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Notice Detail */}
          <div className="flex-1 flex flex-col bg-white min-h-0">
            {/* Detail Header */}
            <div className="px-5 py-3 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] text-primary font-medium">{selectedNotice.number}</span>
                <span className="text-[10px] text-gray-500">{selectedNotice.date}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 leading-relaxed">
                {selectedNotice.title}
              </h3>
              <div className="mt-1 text-[10px] text-gray-500">
                발신: {selectedNotice.department}
              </div>
            </div>

            {/* Detail Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* YouTube Video */}
              {selectedNotice.youtubeUrl && (
                <div className="px-5 py-3 border-b border-gray-100">
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
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNotice.content}
                </p>
              </div>

              {/* Attachments */}
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100">
                  <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">첨부파일</div>
                  <div className="space-y-1.5">
                    {selectedNotice.attachments.map((attachment) => (
                      <button
                        key={attachment.id}
                        onClick={() => handleDownload(attachment)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors text-left group"
                      >
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-700 truncate">{attachment.name}</div>
                          <div className="text-[10px] text-gray-400">{attachment.size}</div>
                        </div>
                        <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
