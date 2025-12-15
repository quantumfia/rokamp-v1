import { useState, useRef } from 'react';
import { Download, Copy, FileText, ChevronDown, Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import armyLogo from '@/assets/army-logo.png';

interface ReportPreviewProps {
  content: string;
  onContentChange: (content: string) => void;
  reporterInfo?: {
    name: string;
    rank: string;
  };
}

export function ReportPreview({ content, onContentChange, reporterInfo }: ReportPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;
  const formattedTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({
      title: '복사 완료',
      description: '보고서 내용이 클립보드에 복사되었습니다.',
    });
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: '인쇄 실패',
        description: '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const printContent = printRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>사고보고서</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif; 
              padding: 20mm;
              background: white;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // 폰트 로딩 대기 후 인쇄
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    toast({
      title: '인쇄',
      description: '인쇄 대화상자가 열립니다.',
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
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted/50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              인쇄
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:bg-muted/50 transition-colors"
                  disabled={isGeneratingPDF}
                >
                  <Download className="w-3.5 h-3.5" />
                  {isGeneratingPDF ? '생성 중...' : '다운로드'}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
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
              className="flex-1 bg-white rounded overflow-auto cursor-pointer hover:shadow-lg transition-shadow min-h-[500px] shadow-md relative"
              onClick={() => setIsEditing(true)}
            >
              {/* 워터마크 로고 */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
                style={{ top: '30%' }}
              >
                <img 
                  src={armyLogo} 
                  alt="" 
                  className="w-64 h-64 opacity-[0.06]"
                  style={{ filter: 'grayscale(100%)' }}
                />
              </div>

              {/* PDF 스타일 문서 */}
              <div className="p-8 relative z-10" style={{ fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif" }}>
                {/* 문서 헤더 - 기관 정보 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={armyLogo} alt="육군본부" className="w-12 h-12" />
                    <div>
                      <p className="text-xs text-gray-500">대한민국 육군</p>
                      <p className="text-sm font-bold text-black">육군본부</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>문서번호: ACC-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(5, '0')}</p>
                    <p>작성일시: {formattedDate} {formattedTime}</p>
                    {reporterInfo && (
                      <p>작 성 자: {reporterInfo.rank} {reporterInfo.name}</p>
                    )}
                  </div>
                </div>

                {/* 문서 제목 */}
                <div className="text-center border-y-2 border-black py-4 mb-6">
                  <h1 className="text-xl font-bold text-black tracking-widest">사 고 보 고 서</h1>
                  <p className="text-xs text-gray-500 mt-1">ACCIDENT REPORT</p>
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
                    // 관련자 번호 (1), 2) 등)
                    if (line.match(/^\s+\d+\)/)) {
                      return (
                        <p key={idx} className="ml-6">{line}</p>
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

                {/* 결재란 */}
                <div className="mt-10 flex justify-end">
                  <table className="border-collapse text-xs text-black">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 px-4 py-1 bg-gray-100">담당</th>
                        <th className="border border-gray-400 px-4 py-1 bg-gray-100">검토</th>
                        <th className="border border-gray-400 px-4 py-1 bg-gray-100">승인</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 px-4 py-4 h-12 w-16"></td>
                        <td className="border border-gray-400 px-4 py-4 h-12 w-16"></td>
                        <td className="border border-gray-400 px-4 py-4 h-12 w-16"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 문서 푸터 */}
                <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-center">
                  <p className="text-xs text-gray-400">본 문서는 대외비로 취급하시기 바랍니다.</p>
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
