import { useState } from 'react';
import { Download, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReportPreviewProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function ReportPreview({ content, onContentChange }: ReportPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({
      title: '복사 완료',
      description: '보고서 내용이 클립보드에 복사되었습니다.',
    });
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `사고보고서_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: '다운로드 완료',
      description: '보고서 파일이 다운로드되었습니다.',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground">보고서 미리보기</h2>
        {content && (
          <div className="flex gap-2">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted/50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              복사
            </button>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted/50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              다운로드
            </button>
          </div>
        )}
      </div>
      
      {content ? (
        <div className="flex-1 flex flex-col">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              className="flex-1 min-h-[400px] bg-transparent border border-border rounded px-4 py-3 font-mono text-sm resize-none focus:outline-none focus:border-foreground transition-colors"
              autoFocus
            />
          ) : (
            <div 
              className="flex-1 px-4 py-3 border border-border rounded overflow-auto whitespace-pre-wrap font-mono text-sm cursor-pointer hover:bg-muted/30 transition-colors min-h-[400px]"
              onClick={() => setIsEditing(true)}
            >
              {content}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {isEditing ? '편집 중 - 외부 클릭 시 저장' : '클릭하여 편집'}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border border-dashed border-border rounded">
          <p className="text-sm text-muted-foreground">
            좌측 폼에서 정보를 입력하고<br />
            'AI 보고서 초안 생성' 버튼을 클릭하세요
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            과거 유사 보고서 패턴을 학습한 AI가<br />
            육군 표준 서식에 맞춰 초안을 작성합니다
          </p>
        </div>
      )}
    </div>
  );
}
