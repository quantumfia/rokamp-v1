import { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Printer,
  ChevronDown,
  Search,
  Pencil,
  Trash2,
  Loader2
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
import { AddModal } from '@/components/common';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { getUnitById } from '@/data/armyUnits';

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
  overview: string; // 사고 경위 (간단)
  actionsTaken: string; // 조치사항
  preventionMeasures: string; // 재발 방지 대책
  content: string; // 전체 내용 (PDF용)
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
    overview: '12월 10일 09:30경, 야외 기동훈련 중 2.5톤 트럭이 결빙된 도로에서 미끄러져 도로변으로 전복됨. 당시 운전병은 병장 이영호였으며, 동승자 상병 박민수와 함께 부상을 입음.',
    actionsTaken: '- 부상자 즉시 후송 및 치료 (현재 안정)\n- 사고 현장 통제 및 증거 확보\n- 관련자 진술 확보',
    preventionMeasures: '가. 단기 대책:\n  - 동절기 차량 운행 시 도로 상태 사전 점검 의무화\n  - 결빙 구간 우회 또는 운행 중단 기준 마련\n나. 중장기 대책:\n  - 동절기 운전 교육 강화\n  - 차량별 윈터타이어 및 체인 확보',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-10 09:30
  나. 발생 장소: 강원도 인제군 훈련장 (영내 / 야외훈련장)
  다. 사고 유형: 안전사고 > 차량사고
  라. 사고 원인: 결빙된 도로에서 차량 제어 실패

2. 관련자 현황
    1) 사고자: 병장 이영호 (제1대대 3중대)
    2) 사고자: 상병 박민수 (제1대대 3중대)

3. 사고 경위
  12월 10일 09:30경, 야외 기동훈련 중 2.5톤 트럭이 결빙된 도로에서 미끄러져 도로변으로 전복됨.

4. 피해 현황
  가. 인명 피해: 군인 부상 2명
  나. 군 피해: 2.5톤 트럭 1대 파손 (수리 필요)

5. 조치 사항
  - 부상자 즉시 후송 및 치료 (현재 안정)
  - 사고 현장 통제 및 증거 확보

6. 재발 방지 대책
  가. 단기 대책: 동절기 차량 운행 시 도로 상태 사전 점검 의무화
  나. 중장기 대책: 동절기 운전 교육 강화`,
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
    overview: '12월 8일 21:00경, 내무반에서 병장 최동훈이 일병 김태우에게 청소 상태를 빌미로 폭행을 가함. 동료 병사의 신고로 사건이 인지됨.',
    actionsTaken: '- 피해자 의무대 진료 및 상담 조치\n- 가해자 격리 조치\n- 헌병대 조사 의뢰',
    preventionMeasures: '가. 단기 대책:\n  - 병영생활 고충상담 강화\n  - 선임-후임 관계 지도 강화\n나. 중장기 대책:\n  - 인성교육 프로그램 확대\n  - 익명 신고 시스템 활성화',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-08 21:00
  나. 발생 장소: 경기도 포천시 부대 내무반 (영내 / 생활관)
  다. 사고 유형: 군기사고 > 폭행사고

2. 사고 경위
  12월 8일 21:00경, 내무반에서 병장 최동훈이 일병 김태우에게 폭행을 가함.

3. 조치 사항
  - 피해자 의무대 진료 및 상담 조치
  - 가해자 격리 조치`,
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
    overview: '탄약고 주변 CCTV 3대 중 2대가 동시 고장 발생. 즉시 인력 경계로 전환하고 긴급 수리 요청함.',
    actionsTaken: '- 인력 경계 강화 (2인 1조 순찰)\n- 긴급 장비 수리 요청\n- 야간 조명 추가 설치',
    preventionMeasures: '가. 단기 대책:\n  - CCTV 장비 정기 점검 주기 단축\n  - 예비 장비 확보\n나. 중장기 대책:\n  - 노후 보안장비 교체 계획 수립',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-07 15:00
  나. 발생 장소: 충청남도 계룡시 탄약고 (영내 / 보안시설)

2. 사고 경위
  탄약고 주변 CCTV 3대 중 2대가 동시 고장 발생.

3. 조치 사항
  - 인력 경계 강화 (2인 1조 순찰)
  - 긴급 장비 수리 요청`,
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
    overview: '사격훈련 중 사격 통제관의 지시 전 조기 발사로 오발 발생. 인명 피해는 없으나 안전 사고로 분류.',
    actionsTaken: '- 훈련 즉시 중단 및 안전 점검\n- 관련자 면담 및 재교육 실시\n- 사격장 안전 수칙 재교육',
    preventionMeasures: '가. 단기 대책:\n  - 사격 전 안전교육 강화\n  - 통제관 지시 준수 철저\n나. 중장기 대책:\n  - 사격훈련 절차 재정립',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-05 10:15
  나. 발생 장소: 경기도 양주시 사격장 (영내 / 훈련시설)

2. 사고 경위
  사격훈련 중 통제관 지시 전 조기 발사로 오발 발생.

3. 조치 사항
  - 훈련 즉시 중단 및 안전 점검
  - 관련자 면담 및 재교육 실시`,
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
    overview: '휴가 복귀 중 개인 차량으로 이동 중 신호 위반 차량과 충돌. 경상을 입고 인근 병원에서 치료 후 귀대.',
    actionsTaken: '- 부상자 응급 치료 후 귀대\n- 교통사고 보험 처리 진행\n- 휴가자 안전 교육 강화 예정',
    preventionMeasures: '가. 단기 대책:\n  - 휴가 전 교통안전 교육 강화\n나. 중장기 대책:\n  - 휴가자 안전 귀대 확인 시스템 구축',
    content: `1. 사고 개요
  가. 발생 일시: 2024-12-03 18:45
  나. 발생 장소: 서울특별시 강남구 교차로 (영외 / 일반도로)

2. 사고 경위
  휴가 복귀 중 개인 차량으로 이동 중 신호 위반 차량과 충돌.

3. 조치 사항
  - 부상자 응급 치료 후 귀대
  - 교통사고 보험 처리 진행`,
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

// 사고 유형 대분류
const ACCIDENT_CATEGORIES = [
  { value: 'military_discipline', label: '군기사고' },
  { value: 'safety', label: '안전사고' },
  { value: 'crime', label: '범죄사고' },
  { value: 'other', label: '기타' },
];

interface AccidentReportListProps {
  showModal?: boolean;
  onCloseModal?: () => void;
}

export function AccidentReportList({ showModal = false, onCloseModal }: AccidentReportListProps) {
  const [selectedReport, setSelectedReport] = useState<AccidentReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<AccidentReport[]>(MOCK_ACCIDENT_REPORTS);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 간소화된 폼 상태
  const [createForm, setCreateForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    unitId: '',
    category: 'safety',
    overview: '',
  });

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!showModal) {
      setCreateForm({
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        unitId: '',
        category: 'safety',
        overview: '',
      });
    }
  }, [showModal]);

  // 필터링된 보고서
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // AI 보고서 생성
  const handleGenerateReport = () => {
    if (!createForm.overview.trim()) {
      toast({
        title: '입력 필요',
        description: '사고 경위를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    // 시뮬레이션: AI가 사고 경위를 분석하여 보고서 생성
    setTimeout(() => {
      const unit = getUnitById(createForm.unitId);
      const categoryLabel = ACCIDENT_CATEGORIES.find(c => c.value === createForm.category)?.label || '기타';
      
      // AI가 생성한 것처럼 mock 데이터
      const newReport: AccidentReport = {
        id: `ACC-2024-${String(reports.length + 128).padStart(5, '0')}`,
        title: `${categoryLabel} - ${createForm.overview.slice(0, 20)}...`,
        unit: unit?.name || '미지정 부대',
        date: createForm.date,
        category: categoryLabel,
        categoryDetail: categoryLabel,
        location: createForm.location || '미지정',
        status: 'reviewing',
        severity: 'medium',
        reporter: '홍길동',
        reporterRank: '대위',
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        overview: createForm.overview,
        actionsTaken: '- 현장 조사 진행 중\n- 관련자 면담 예정',
        preventionMeasures: '가. 단기 대책:\n  - 안전 점검 강화\n나. 중장기 대책:\n  - 교육 프로그램 보완',
        content: `1. 사고 개요
  가. 발생 일시: ${createForm.date} ${createForm.time || '시간 미상'}
  나. 발생 장소: ${createForm.location || '미지정'}
  다. 사고 유형: ${categoryLabel}

2. 사고 경위
${createForm.overview}

3. 조치 사항
  - 현장 조사 진행 중
  - 관련자 면담 예정

4. 재발 방지 대책
  가. 단기 대책: 안전 점검 강화
  나. 중장기 대책: 교육 프로그램 보완

※ 본 보고서는 AI가 생성한 초안이며, 실제 내용은 담당자가 확인 후 수정하시기 바랍니다.`,
        casualties: {
          militaryDeaths: 0,
          civilianDeaths: 0,
          militaryInjuries: 0,
          civilianInjuries: 0,
        },
      };

      setReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
      onCloseModal?.();
      setSelectedReport(newReport);
      
      toast({
        title: '보고서 생성 완료',
        description: 'AI가 사고 경위를 분석하여 보고서 초안을 생성했습니다.',
      });
    }, 2000);
  };

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

  // 상세보기 (좌: 상세 정보, 우: PDF 미리보기)
  if (selectedReport) {
    const pages = splitContentToPages(selectedReport.content);
    const inputClass = "w-full bg-muted/30 border border-border rounded px-3 py-2 text-sm";
    const labelClass = "text-xs text-muted-foreground";

    return (
      <div className="space-y-4">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedReport(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toast({ title: '수정', description: '수정 기능은 추후 구현 예정입니다.' })}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-muted/50 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              수정
            </button>
            <button 
              onClick={() => toast({ title: '삭제', description: '삭제 기능은 추후 구현 예정입니다.', variant: 'destructive' })}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-muted/50 transition-colors text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
            <button
              onClick={() => handlePrint(selectedReport)}
              disabled={isPrinting}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-muted/50 transition-colors disabled:opacity-50"
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

        {/* 좌: 상세 정보, 우: PDF 미리보기 */}
        <div className="grid grid-cols-2 gap-6" style={{ height: 'calc(100vh - 220px)' }}>
          {/* 좌측: 상세 정보 */}
          <div className="overflow-y-auto pr-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">보고서 상세 정보</h2>
              <span className="text-xs text-muted-foreground">{selectedReport.id}</span>
            </div>

            <div className="space-y-4">
              {/* 발생 일시 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>발생 일자</label>
                  <div className={inputClass}>{selectedReport.date}</div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>작성 일시</label>
                  <div className={inputClass}>{selectedReport.createdAt}</div>
                </div>
              </div>

              {/* 발생 장소 */}
              <div className="space-y-1.5">
                <label className={labelClass}>발생 장소</label>
                <div className={inputClass}>{selectedReport.location}</div>
              </div>

              {/* 보고 부대 */}
              <div className="space-y-1.5">
                <label className={labelClass}>보고 부대</label>
                <div className={inputClass}>{selectedReport.unit}</div>
              </div>

              {/* 사고 분류 */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-medium text-foreground mb-3">사고 분류</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>대분류</label>
                    <div className={inputClass}>{selectedReport.category}</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>중분류</label>
                    <div className={inputClass}>{selectedReport.categoryDetail}</div>
                  </div>
                </div>
              </div>

              {/* 피해 현황 */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-medium text-foreground mb-3">피해 현황</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className={labelClass}>군인 사망</label>
                    <div className={inputClass}>{selectedReport.casualties.militaryDeaths}명</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>민간 사망</label>
                    <div className={inputClass}>{selectedReport.casualties.civilianDeaths}명</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>군인 부상</label>
                    <div className={inputClass}>{selectedReport.casualties.militaryInjuries}명</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>민간 부상</label>
                    <div className={inputClass}>{selectedReport.casualties.civilianInjuries}명</div>
                  </div>
                </div>
              </div>

              {/* 보고자 정보 */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-medium text-foreground mb-3">보고자 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>계급</label>
                    <div className={inputClass}>{selectedReport.reporterRank}</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>성명</label>
                    <div className={inputClass}>{selectedReport.reporter}</div>
                  </div>
                </div>
              </div>

              {/* 사고 경위 */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-medium text-foreground mb-3">사고 경위</h3>
                <div className="bg-muted/30 border border-border rounded p-4 text-sm whitespace-pre-wrap">
                  {selectedReport.overview}
                </div>
              </div>

              {/* 조치 사항 */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-medium text-foreground mb-3">조치 사항</h3>
                <div className="bg-muted/30 border border-border rounded p-4 text-sm whitespace-pre-wrap">
                  {selectedReport.actionsTaken}
                </div>
              </div>

              {/* 재발 방지 대책 */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-medium text-foreground mb-3">재발 방지 대책</h3>
                <div className="bg-muted/30 border border-border rounded p-4 text-sm whitespace-pre-wrap">
                  {selectedReport.preventionMeasures}
                </div>
              </div>

              {/* 처리 상태 */}
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-xs font-medium text-foreground mb-3">처리 상태</h3>
                <div className={inputClass}>{getStatusLabel(selectedReport.status)}</div>
              </div>
            </div>
          </div>

          {/* 우측: PDF 미리보기 */}
          <div 
            ref={previewRef}
            className="overflow-y-auto flex flex-col items-center gap-4"
            style={{ backgroundColor: '#e5e5e5', padding: '16px', borderRadius: '8px' }}
          >
            {pages.map((pageLines, pageIdx) => (
              <div 
                key={pageIdx}
                className="a4-page bg-white shadow-lg relative flex-shrink-0"
                style={{ 
                  width: `${A4_WIDTH_PX}px`, 
                  height: `${A4_HEIGHT_PX}px`,
                  overflow: 'hidden',
                  paddingLeft: `${PAGE_PADDING_X}px`,
                  paddingRight: `${PAGE_PADDING_X}px`,
                  paddingTop: `${PAGE_PADDING_TOP}px`,
                  paddingBottom: `${PAGE_PADDING_BOTTOM}px`,
                  fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
                  transform: 'scale(0.75)',
                  transformOrigin: 'top center',
                  marginBottom: '-210px',
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
      </div>
    );
  }

  // 이제 상세보기와 미리보기가 합쳐짐 (위에서 처리)

  // 목록 뷰
  return (
    <div className="space-y-4">
      {/* 검색 영역 */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="보고서 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-transparent border border-border rounded text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
        />
      </div>

      {/* 테이블 */}
      <div>
        {/* Header */}
        <div className="grid grid-cols-[100px_1fr_120px_100px_100px_80px_50px] gap-4 py-3 text-xs text-muted-foreground border-y border-border">
          <div>문서번호</div>
          <div>제목</div>
          <div>부대</div>
          <div>유형</div>
          <div>발생일</div>
          <div>상태</div>
          <div></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="grid grid-cols-[100px_1fr_120px_100px_100px_80px_50px] gap-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="text-sm text-muted-foreground font-mono">
                {report.id.replace('ACC-2024-', '')}
              </div>
              <div className="text-sm font-medium truncate">{report.title}</div>
              <div className="text-sm text-muted-foreground truncate">
                {report.unit.split(' > ').pop()}
              </div>
              <div className="text-sm text-muted-foreground">
                {report.categoryDetail}
              </div>
              <div className="text-sm text-muted-foreground tabular-nums">
                {report.date}
              </div>
              <div className="text-sm text-muted-foreground">
                {getStatusLabel(report.status)}
              </div>
              <div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="상세보기"
                >
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">조건에 맞는 보고서가 없습니다.</p>
        </div>
      )}

      {/* 보고서 생성 모달 */}
      <AddModal
        isOpen={showModal}
        onClose={() => onCloseModal?.()}
        title="사고 보고서 생성"
        description="사고 경위를 입력하면 AI가 보고서 초안을 자동 생성합니다"
        inputTypes={[
          { 
            id: 'form', 
            label: '생성 옵션', 
            content: (
              <div className="space-y-4">
                {/* 발생 일시 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">발생 일자 *</label>
                    <input
                      type="date"
                      value={createForm.date}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">발생 시간</label>
                    <input
                      type="time"
                      value={createForm.time}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                </div>

                {/* 발생 장소 */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">발생 장소</label>
                  <input
                    placeholder="예: 경기도 파주시 00부대 훈련장"
                    value={createForm.location}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                {/* 보고 부대 */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">보고 부대</label>
                  <UnitCascadeSelect
                    value={createForm.unitId}
                    onChange={(value) => setCreateForm(prev => ({ ...prev, unitId: value }))}
                    placeholder="부대 선택"
                  />
                </div>

                {/* 사고 유형 */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">사고 유형</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
                  >
                    {ACCIDENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* 사고 경위 */}
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">사고 경위 *</label>
                  <textarea
                    placeholder="사고 상황을 간략히 설명해주세요. AI가 이를 바탕으로 상세 보고서를 생성합니다."
                    rows={4}
                    value={createForm.overview}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, overview: e.target.value }))}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                  />
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  AI가 입력된 사고 경위를 분석하여 관련자 정보, 피해 현황, 조치사항 등을 자동으로 추론합니다.
                </div>
              </div>
            )
          }
        ]}
        onSubmit={handleGenerateReport}
        submitLabel={isGenerating ? '생성 중...' : '보고서 생성'}
        isSubmitDisabled={isGenerating || !createForm.overview.trim()}
      />
    </div>
  );
}
