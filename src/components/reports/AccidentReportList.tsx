import { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  ArrowLeft, 
  Printer,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react';
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

// 사고 보고서 타입
interface AccidentReport {
  id: string;
  title: string;
  unit: string;
  date: string;
  category: string;
  categoryDetail: string;
  location: string;
  status: 'completed' | 'pending' | 'reviewing';
  severity: 'high' | 'medium' | 'low';
  reporter: string;
  reporterRank: string;
  createdAt: string;
  content: string;
  casualties: {
    militaryDeaths: number;
    civilianDeaths: number;
    militaryInjuries: number;
    civilianInjuries: number;
  };
}

// Mock 데이터
const MOCK_ACCIDENT_REPORTS: AccidentReport[] = [
  {
    id: 'ACC-2024-00127',
    title: '훈련 중 차량 전복 사고',
    unit: '제32보병사단 > 제102연대 > 제1대대',
    date: '2024-12-10',
    category: '안전사고',
    categoryDetail: '차량사고',
    location: '강원도 인제군 훈련장',
    status: 'completed',
    severity: 'high',
    reporter: '김철수',
    reporterRank: '대위',
    createdAt: '2024-12-10 14:30',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-10 09:30
  나. 발생 장소: 강원도 인제군 훈련장 (영내 / 야외훈련장)
  다. 사고 유형: 안전사고 > 차량사고
  라. 사고 원인: 결빙된 도로에서 차량 제어 실패

2. 관련자 현황
    1) 사고자: 병장 이영호 (제1대대 3중대)
    2) 사고자: 상병 박민수 (제1대대 3중대)

3. 사고 경위
  12월 10일 09:30경, 야외 기동훈련 중 2.5톤 트럭이 결빙된 도로에서 미끄러져 도로변으로 전복됨. 당시 운전병은 병장 이영호였으며, 동승자 상병 박민수와 함께 부상을 입음.

4. 피해 현황
  가. 인명 피해: 군인 부상 2명
  나. 군 피해: 2.5톤 트럭 1대 파손 (수리 필요)
  다. 민간 피해: 없음

5. 조치 사항
  - 부상자 즉시 후송 및 치료 (현재 안정)
  - 사고 현장 통제 및 증거 확보
  - 관련자 진술 확보

6. 재발 방지 대책
  가. 단기 대책:
    - 동절기 차량 운행 시 도로 상태 사전 점검 의무화
    - 결빙 구간 우회 또는 운행 중단 기준 마련
  나. 중장기 대책:
    - 동절기 운전 교육 강화
    - 차량별 윈터타이어 및 체인 확보

7. 보고자
  대위 김철수 (010-1234-5678)

※ 본 보고서는 사고 발생 당일 작성되었으며, 추가 조사 결과에 따라 내용이 보완될 수 있습니다.`,
    casualties: {
      militaryDeaths: 0,
      civilianDeaths: 0,
      militaryInjuries: 2,
      civilianInjuries: 0,
    },
  },
  {
    id: 'ACC-2024-00126',
    title: '내무반 폭행 사건',
    unit: '제7기동군단 > 제11기계화보병사단 > 제33연대',
    date: '2024-12-08',
    category: '군기사고',
    categoryDetail: '폭행사고',
    location: '경기도 포천시 부대 내무반',
    status: 'reviewing',
    severity: 'medium',
    reporter: '박지훈',
    reporterRank: '중위',
    createdAt: '2024-12-08 22:15',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-08 21:00
  나. 발생 장소: 경기도 포천시 부대 내무반 (영내 / 생활관)
  다. 사고 유형: 군기사고 > 폭행사고
  라. 사고 원인: 선임병의 후임병에 대한 가혹행위

2. 관련자 현황
    1) 피의자: 병장 최동훈 (제33연대 2중대)
    2) 피해자: 일병 김태우 (제33연대 2중대)

3. 사고 경위
  12월 8일 21:00경, 내무반에서 병장 최동훈이 일병 김태우에게 청소 상태를 빌미로 폭행을 가함. 동료 병사의 신고로 사건이 인지됨.

4. 피해 현황
  가. 인명 피해: 군인 부상 1명 (타박상)
  나. 군 피해: 없음
  다. 민간 피해: 없음

5. 조치 사항
  - 피해자 의무대 진료 및 상담 조치
  - 가해자 격리 조치
  - 헌병대 조사 의뢰

6. 보고자
  중위 박지훈 (010-2345-6789)`,
    casualties: {
      militaryDeaths: 0,
      civilianDeaths: 0,
      militaryInjuries: 1,
      civilianInjuries: 0,
    },
  },
  {
    id: 'ACC-2024-00125',
    title: '탄약고 보안 장비 고장',
    unit: '육군본부 > 군수사령부 > 제5보급단',
    date: '2024-12-07',
    category: '기타',
    categoryDetail: '장비고장',
    location: '충청남도 계룡시 탄약고',
    status: 'completed',
    severity: 'low',
    reporter: '이상민',
    reporterRank: '소령',
    createdAt: '2024-12-07 16:45',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-07 15:00
  나. 발생 장소: 충청남도 계룡시 탄약고 (영내 / 보안시설)
  다. 사고 유형: 기타 > 장비고장
  라. 사고 원인: CCTV 시스템 노후화로 인한 고장

2. 사고 경위
  탄약고 주변 CCTV 3대 중 2대가 동시 고장 발생. 즉시 인력 경계로 전환하고 긴급 수리 요청함.

3. 피해 현황
  가. 인명 피해: 없음
  나. 군 피해: CCTV 장비 2대 (교체 필요)
  다. 민간 피해: 없음

4. 조치 사항
  - 인력 경계 강화 (2인 1조 순찰)
  - 긴급 장비 수리 요청
  - 야간 조명 추가 설치

5. 보고자
  소령 이상민 (010-3456-7890)`,
    casualties: {
      militaryDeaths: 0,
      civilianDeaths: 0,
      militaryInjuries: 0,
      civilianInjuries: 0,
    },
  },
  {
    id: 'ACC-2024-00124',
    title: '사격훈련 중 오발 사고',
    unit: '제2작전사령부 > 제6군단 > 특수전여단',
    date: '2024-12-05',
    category: '안전사고',
    categoryDetail: '훈련사고',
    location: '경기도 양주시 사격장',
    status: 'completed',
    severity: 'high',
    reporter: '정우성',
    reporterRank: '대위',
    createdAt: '2024-12-05 11:20',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-05 10:15
  나. 발생 장소: 경기도 양주시 사격장 (영내 / 훈련시설)
  다. 사고 유형: 안전사고 > 훈련사고
  라. 사고 원인: 사격 절차 미준수

2. 관련자 현황
    1) 사고자: 하사 윤현준 (특수전여단 1대대)

3. 사고 경위
  사격훈련 중 사격 통제관의 지시 전 조기 발사로 오발 발생. 인명 피해는 없으나 안전 사고로 분류.

4. 피해 현황
  가. 인명 피해: 없음
  나. 군 피해: 없음
  다. 민간 피해: 없음

5. 조치 사항
  - 훈련 즉시 중단 및 안전 점검
  - 관련자 면담 및 재교육 실시
  - 사격장 안전 수칙 재교육

6. 보고자
  대위 정우성 (010-4567-8901)`,
    casualties: {
      militaryDeaths: 0,
      civilianDeaths: 0,
      militaryInjuries: 0,
      civilianInjuries: 0,
    },
  },
  {
    id: 'ACC-2024-00123',
    title: '휴가 복귀 중 교통사고',
    unit: '제3야전군사령부 > 제8군단 > 제21보병사단',
    date: '2024-12-03',
    category: '안전사고',
    categoryDetail: '차량사고',
    location: '서울특별시 강남구 교차로',
    status: 'pending',
    severity: 'medium',
    reporter: '한승우',
    reporterRank: '중위',
    createdAt: '2024-12-03 19:30',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-03 18:45
  나. 발생 장소: 서울특별시 강남구 교차로 (영외 / 일반도로)
  다. 사고 유형: 안전사고 > 차량사고
  라. 사고 원인: 신호 위반 차량과의 충돌

2. 관련자 현황
    1) 사고자: 상병 조민혁 (제21보병사단 본부대대)

3. 사고 경위
  휴가 복귀 중 개인 차량으로 이동 중 신호 위반 차량과 충돌. 경상을 입고 인근 병원에서 치료 후 귀대.

4. 피해 현황
  가. 인명 피해: 군인 부상 1명 (경상)
  나. 군 피해: 없음
  다. 민간 피해: 상대 차량 파손

5. 조치 사항
  - 부상자 응급 치료 후 귀대
  - 교통사고 보험 처리 진행
  - 휴가자 안전 교육 강화 예정

6. 보고자
  중위 한승우 (010-5678-9012)`,
    casualties: {
      militaryDeaths: 0,
      civilianDeaths: 0,
      militaryInjuries: 1,
      civilianInjuries: 0,
    },
  },
];

// A4 페이지 상수
const A4_WIDTH_PX = 595;
const A4_HEIGHT_PX = 842;
const PAGE_PADDING_X = 50;
const PAGE_PADDING_TOP = 50;
const PAGE_PADDING_BOTTOM = 60;

export function AccidentReportList() {
  const [selectedReport, setSelectedReport] = useState<AccidentReport | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPrinting, setIsPrinting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // 필터링된 보고서
  const filteredReports = MOCK_ACCIDENT_REPORTS.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '처리완료';
      case 'pending': return '처리중';
      case 'reviewing': return '검토중';
      default: return status;
    }
  };

  // 상태 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'reviewing': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // 심각도 스타일
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return '긴급';
      case 'medium': return '보통';
      case 'low': return '경미';
      default: return severity;
    }
  };

  // PDF 다운로드
  const handleDownloadPDF = async (report: AccidentReport) => {
    if (!previewRef.current) {
      toast({
        title: '미리보기 필요',
        description: '먼저 미리보기를 열어주세요.',
      });
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageElements = previewRef.current.querySelectorAll('.a4-page');
      
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i] as HTMLElement;
        
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        
        if (i > 0) {
          pdf.addPage();
        }
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
      }

      pdf.save(`${report.id}_${report.title}.pdf`);
      
      toast({
        title: 'PDF 다운로드 완료',
        description: '사고 보고서가 PDF 형식으로 다운로드되었습니다.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF 생성 실패',
        description: 'PDF 파일 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 인쇄 기능
  const handlePrint = async (report: AccidentReport) => {
    if (!previewRef.current) {
      toast({
        title: '미리보기 필요',
        description: '먼저 미리보기를 열어주세요.',
      });
      return;
    }

    setIsPrinting(true);

    try {
      const pageElements = Array.from(previewRef.current.querySelectorAll('.a4-page')) as HTMLElement[];
      if (pageElements.length === 0) return;

      const pageImages: string[] = [];
      for (const pageEl of pageElements) {
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        pageImages.push(canvas.toDataURL('image/png'));
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: '인쇄 실패',
          description: '팝업이 차단되었습니다. 팝업 차단을 해제해주세요.',
          variant: 'destructive',
        });
        return;
      }

      const imgsHtml = pageImages
        .map(
          (src) => `
            <div class="page">
              <img src="${src}" alt="print-page" />
            </div>
          `
        )
        .join('');

      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${report.title} 인쇄</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; }
    .page { width: 210mm; height: 297mm; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    img { width: 210mm; height: 297mm; object-fit: contain; display: block; background: #fff; }
    @page { size: A4; margin: 0; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  ${imgsHtml}
  <script>
    const imgs = Array.from(document.images);
    const wait = imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => img.onload = img.onerror = res));
    Promise.all(wait).then(() => {
      setTimeout(() => window.print(), 50);
    });
    window.onafterprint = () => window.close();
  </script>
</body>
</html>`);

      printWindow.document.close();

      toast({
        title: '인쇄',
        description: '미리보기와 동일한 형태로 인쇄합니다.',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  // HWP 다운로드
  const handleDownloadHWP = (report: AccidentReport) => {
    const blob = new Blob([report.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${report.title}.hwp`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'HWP 다운로드',
      description: '보고서가 HWP 형식으로 다운로드되었습니다. (텍스트 기반)',
    });
  };

  // 콘텐츠를 페이지별로 분할
  const splitContentToPages = (content: string) => {
    const lines = content.split('\n');
    const firstPageLines = 22;
    const otherPageLines = 30;
    const result: string[][] = [];
    
    if (lines.length > 0) {
      result.push(lines.slice(0, firstPageLines));
    }
    
    for (let i = firstPageLines; i < lines.length; i += otherPageLines) {
      result.push(lines.slice(i, i + otherPageLines));
    }
    
    return result.length > 0 ? result : [lines];
  };

  const renderLine = (line: string, idx: number) => {
    if (line.match(/^\d+\.\s/)) {
      return <p key={idx} className="font-bold mt-3 mb-1 text-[11px]">{line}</p>;
    }
    if (line.match(/^\s+[가-힣]\.\s/)) {
      return <p key={idx} className="font-medium ml-3 text-[11px]">{line}</p>;
    }
    if (line.match(/^\s+-\s/)) {
      return <p key={idx} className="ml-6 text-[11px]">{line}</p>;
    }
    if (line.match(/^\s+\d+\)/)) {
      return <p key={idx} className="ml-4 text-[11px]">{line}</p>;
    }
    if (line.startsWith('※')) {
      return <p key={idx} className="text-[9px] text-gray-500 mt-4 pt-2 border-t border-gray-200">{line}</p>;
    }
    return <p key={idx} className="text-[11px] leading-[1.6]">{line || '\u00A0'}</p>;
  };

  // PDF 미리보기 뷰
  if (selectedReport && showPreview) {
    const pages = splitContentToPages(selectedReport.content);

    return (
      <div className="space-y-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            상세로 돌아가기
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handlePrint(selectedReport)}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? '인쇄 준비중...' : '인쇄'}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded text-sm hover:opacity-80 transition-opacity">
                  <Download className="w-4 h-4" />
                  다운로드
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownloadPDF(selectedReport)}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF 형식 (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadHWP(selectedReport)}>
                  <FileText className="w-4 h-4 mr-2" />
                  한글 형식 (.hwp)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* PDF 스타일 미리보기 */}
        <div 
          ref={previewRef}
          className="flex flex-col items-center gap-6"
          style={{ backgroundColor: '#e5e5e5', padding: '20px' }}
        >
          {pages.map((pageLines, pageIdx) => (
            <div 
              key={pageIdx}
              className="a4-page bg-white shadow-lg relative"
              style={{ 
                width: `${A4_WIDTH_PX}px`, 
                height: `${A4_HEIGHT_PX}px`,
                overflow: 'hidden',
                paddingLeft: `${PAGE_PADDING_X}px`,
                paddingRight: `${PAGE_PADDING_X}px`,
                paddingTop: `${PAGE_PADDING_TOP}px`,
                paddingBottom: `${PAGE_PADDING_BOTTOM}px`,
                fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
              }}
            >
              {/* 워터마크 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img src={armyLogo} alt="" className="w-48 h-48 opacity-[0.05]" style={{ filter: 'grayscale(100%)' }} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                {/* 첫 페이지 헤더 */}
                {pageIdx === 0 && (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <img src={armyLogo} alt="육군본부" className="w-10 h-10" />
                        <div>
                          <p className="text-[9px] text-gray-500">대한민국 육군</p>
                          <p className="text-[11px] font-bold text-black">육군본부</p>
                        </div>
                      </div>
                      <div className="text-right text-[9px] text-gray-500">
                        <p>문서번호: {selectedReport.id}</p>
                        <p>작성일시: {selectedReport.createdAt}</p>
                        <p>작 성 자: {selectedReport.reporterRank} {selectedReport.reporter}</p>
                      </div>
                    </div>

                    <div className="text-center border-y-2 border-black py-3 mb-6">
                      <h1 className="text-base font-bold text-black tracking-widest">사 고 보 고 서</h1>
                      <p className="text-[9px] text-gray-500 mt-0.5">ACCIDENT REPORT</p>
                    </div>

                    <table className="w-full border-collapse mb-4 text-[10px]">
                      <tbody>
                        <tr>
                          <td className="border border-black bg-gray-100 p-1.5 w-20 font-semibold">보고 부대</td>
                          <td className="border border-black p-1.5">{selectedReport.unit}</td>
                        </tr>
                        <tr>
                          <td className="border border-black bg-gray-100 p-1.5 font-semibold">사고 유형</td>
                          <td className="border border-black p-1.5">{selectedReport.category} &gt; {selectedReport.categoryDetail}</td>
                        </tr>
                        <tr>
                          <td className="border border-black bg-gray-100 p-1.5 font-semibold">발생 일시</td>
                          <td className="border border-black p-1.5">{selectedReport.date}</td>
                        </tr>
                        <tr>
                          <td className="border border-black bg-gray-100 p-1.5 font-semibold">발생 장소</td>
                          <td className="border border-black p-1.5">{selectedReport.location}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {/* 2페이지 이후 헤더 */}
                {pageIdx > 0 && (
                  <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
                    <p className="text-[9px] text-gray-400">사고보고서 (계속)</p>
                    <p className="text-[9px] text-gray-400">문서번호: {selectedReport.id}</p>
                  </div>
                )}

                {/* 본문 */}
                <div className="flex-1 text-black whitespace-pre-wrap">
                  {pageLines.map((line, idx) => renderLine(line, idx))}
                </div>

                {/* 마지막 페이지 결재란 */}
                {pageIdx === pages.length - 1 && (
                  <div className="mt-6 flex justify-end">
                    <table className="border-collapse text-[9px] text-black">
                      <thead>
                        <tr>
                          <th className="border border-gray-400 px-3 py-1 bg-gray-100">담당</th>
                          <th className="border border-gray-400 px-3 py-1 bg-gray-100">검토</th>
                          <th className="border border-gray-400 px-3 py-1 bg-gray-100">승인</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 px-3 py-3 h-10 w-12"></td>
                          <td className="border border-gray-400 px-3 py-3 h-10 w-12"></td>
                          <td className="border border-gray-400 px-3 py-3 h-10 w-12"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 푸터 */}
                <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center">
                  <p className="text-[8px] text-gray-400">본 문서는 대외비로 취급하시기 바랍니다.</p>
                  <p className="text-[9px] text-gray-400">- {pageIdx + 1} / {pages.length} -</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 상세보기
  if (selectedReport) {
    return (
      <div className="space-y-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedReport(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </button>
          <button 
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded text-sm hover:opacity-80 transition-opacity"
          >
            <Eye className="w-4 h-4" />
            PDF 미리보기
          </button>
        </div>

        {/* 보고서 정보 */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs ${getSeverityStyle(selectedReport.severity)}`}>
                {getSeverityLabel(selectedReport.severity)}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(selectedReport.status)}`}>
                {getStatusLabel(selectedReport.status)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{selectedReport.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{selectedReport.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">보고 부대</p>
              <p className="text-sm">{selectedReport.unit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">발생 일시</p>
              <p className="text-sm">{selectedReport.date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">사고 유형</p>
              <p className="text-sm">{selectedReport.category} &gt; {selectedReport.categoryDetail}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">발생 장소</p>
              <p className="text-sm">{selectedReport.location}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">보고자</p>
              <p className="text-sm">{selectedReport.reporterRank} {selectedReport.reporter}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">작성일시</p>
              <p className="text-sm">{selectedReport.createdAt}</p>
            </div>
          </div>

          {/* 피해 현황 */}
          <div>
            <h3 className="text-sm font-medium mb-3">피해 현황</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">군인 사망</p>
                <p className="text-lg font-semibold text-red-400">{selectedReport.casualties.militaryDeaths}</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">민간 사망</p>
                <p className="text-lg font-semibold text-red-400">{selectedReport.casualties.civilianDeaths}</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">군인 부상</p>
                <p className="text-lg font-semibold text-yellow-400">{selectedReport.casualties.militaryInjuries}</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground mb-1">민간 부상</p>
                <p className="text-lg font-semibold text-yellow-400">{selectedReport.casualties.civilianInjuries}</p>
              </div>
            </div>
          </div>

          {/* 보고서 내용 */}
          <div>
            <h3 className="text-sm font-medium mb-3">보고서 내용</h3>
            <div className="bg-muted/20 rounded p-4 text-sm whitespace-pre-wrap font-mono">
              {selectedReport.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 목록 뷰
  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="보고서 검색 (제목, 부대, 문서번호)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded text-sm focus:outline-none focus:border-foreground"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-muted/50 transition-colors">
              <Filter className="w-4 h-4" />
              상태: {statusFilter === 'all' ? '전체' : getStatusLabel(statusFilter)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>전체</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>처리완료</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>처리중</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('reviewing')}>검토중</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 테이블 */}
      <div className="border border-border rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">문서번호</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">제목</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">부대</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">유형</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">발생일</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">심각도</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">상태</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr 
                key={report.id} 
                className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <td className="px-4 py-3 text-sm font-mono">{report.id}</td>
                <td className="px-4 py-3 text-sm">{report.title}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{report.unit.split(' > ').pop()}</td>
                <td className="px-4 py-3 text-sm">{report.categoryDetail}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{report.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${getSeverityStyle(report.severity)}`}>
                    {getSeverityLabel(report.severity)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReport(report);
                    }}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReports.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">총 {filteredReports.length}건의 보고서</p>
    </div>
  );
}
