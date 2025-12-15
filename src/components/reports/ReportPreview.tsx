import { useState, useRef } from 'react';
import { Download, Copy, FileText, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReportPreviewProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function ReportPreview({ content, onContentChange }: ReportPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({
      title: '복사 완료',
      description: '보고서 내용이 클립보드에 복사되었습니다.',
    });
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // html2canvas로 HTML을 이미지로 변환 (한글 폰트 포함)
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // 고해상도
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // PDF 생성
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 여러 페이지 처리
      let heightLeft = imgHeight;
      let position = margin;
      let page = 1;

      // 첫 페이지
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      // 추가 페이지가 필요한 경우
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
        page++;
      }

      // 다운로드
      pdf.save(`사고보고서_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: 'PDF 다운로드 완료',
        description: '한글이 포함된 PDF가 다운로드되었습니다.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF 생성 실패',
        description: 'PDF 파일 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadHWP = () => {
    // HWP 다운로드 (실제 구현 시 서버 사이드 변환 필요)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `사고보고서_${new Date().toISOString().split('T')[0]}.hwp`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'HWP 다운로드',
      description: '보고서가 HWP 형식으로 다운로드되었습니다. (텍스트 기반)',
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted/50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  다운로드
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF 형식 (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadHWP}>
                  <FileText className="w-4 h-4 mr-2" />
                  한글 형식 (.hwp)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              className="flex-1 min-h-[500px] bg-white text-black border border-border rounded px-8 py-6 font-serif text-sm resize-none focus:outline-none focus:border-foreground transition-colors leading-relaxed"
              autoFocus
            />
          ) : (
            <div 
              ref={printRef}
              className="flex-1 bg-white rounded overflow-auto cursor-pointer hover:shadow-lg transition-shadow min-h-[500px] shadow-md"
              onClick={() => setIsEditing(true)}
            >
              {/* PDF 스타일 문서 */}
              <div className="p-8" style={{ fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif" }}>
                {/* 문서 헤더 */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                  <p className="text-xs text-gray-500 mb-2">육군 사고보고서</p>
                  <h1 className="text-lg font-bold text-black tracking-wider">사 고 보 고 서</h1>
                </div>
                
                {/* 문서 본문 */}
                <div className="text-black text-sm leading-7 whitespace-pre-wrap">
                  {content.split('\n').map((line, idx) => {
                    // 제목 스타일
                    if (line.match(/^\d+\.\s/)) {
                      return (
                        <p key={idx} className="font-bold mt-4 mb-2">{line}</p>
                      );
                    }
                    // 부제목 스타일
                    if (line.match(/^\s+[가-힣]\.\s/)) {
                      return (
                        <p key={idx} className="font-medium ml-4">{line}</p>
                      );
                    }
                    // 리스트 항목
                    if (line.match(/^\s+-\s/)) {
                      return (
                        <p key={idx} className="ml-8">{line}</p>
                      );
                    }
                    // 주석
                    if (line.startsWith('※')) {
                      return (
                        <p key={idx} className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">{line}</p>
                      );
                    }
                    return (
                      <p key={idx}>{line || '\u00A0'}</p>
                    );
                  })}
                </div>

                {/* 문서 푸터 */}
                <div className="mt-8 pt-4 border-t border-gray-300 text-center">
                  <p className="text-xs text-gray-400">- 1 / 1 -</p>
                </div>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {isEditing ? '편집 중 - 외부 클릭 시 저장' : '클릭하여 편집'}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-muted/20 rounded border border-dashed border-border min-h-[500px]">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            좌측 폼에서 정보를 입력하고<br />
            &apos;AI 보고서 초안 생성&apos; 버튼을 클릭하세요
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
