import { useState, useRef, useEffect } from 'react';
import { Download, ArrowLeft, Eye, ChevronDown, Loader2, Calendar as CalendarIcon, Printer, Trash2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText } from 'lucide-react';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { getUnitById } from '@/data/armyUnits';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, subQuarters, startOfQuarter, endOfQuarter } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import armyLogo from '@/assets/army-logo.png';
import { AddModal } from '@/components/common';

interface StatReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  period: string;
  generatedAt: string;
  unit: string;
  analysisTarget?: 'unit' | 'rank';
  summary?: string;
  stats?: {
    totalAccidents: number;
    resolved: number;
    pending: number;
    changeRate: number;
  };
  details?: {
    category: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  recommendations?: string[];
}

const MOCK_STAT_REPORTS: StatReport[] = [
  { 
    id: '1', 
    title: '2024년 12월 2주차 사고 위험도 분석', 
    type: 'weekly', 
    period: '2024.12.08 ~ 2024.12.14', 
    generatedAt: '2024-12-14', 
    unit: '제1사단',
    summary: '전주 대비 사고 위험도가 12% 감소하였으며, 동절기 차량 사고 예방 교육 실시 후 관련 사고 발생률이 현저히 줄어들었습니다.',
    stats: { totalAccidents: 8, resolved: 7, pending: 1, changeRate: -12 },
    details: [
      { category: '차량 사고', count: 2, trend: 'down' },
      { category: '훈련 사고', count: 3, trend: 'stable' },
      { category: '시설 안전', count: 1, trend: 'down' },
      { category: '개인 부주의', count: 2, trend: 'up' },
    ],
    recommendations: [
      '동절기 차량 점검 체크리스트 지속 활용',
      '야간 훈련 시 안전요원 추가 배치 권고',
      '신병 대상 안전교육 강화 필요',
    ]
  },
  { 
    id: '2', 
    title: '2024년 12월 1주차 사고 위험도 분석', 
    type: 'weekly', 
    period: '2024.12.01 ~ 2024.12.07', 
    generatedAt: '2024-12-07', 
    unit: '제1사단',
    summary: '월초 훈련 증가로 인해 사고 위험도가 상승하였습니다. 특히 야간 훈련 관련 사고가 증가 추세입니다.',
    stats: { totalAccidents: 11, resolved: 9, pending: 2, changeRate: 8 },
    details: [
      { category: '차량 사고', count: 3, trend: 'up' },
      { category: '훈련 사고', count: 5, trend: 'up' },
      { category: '시설 안전', count: 2, trend: 'stable' },
      { category: '개인 부주의', count: 1, trend: 'down' },
    ],
    recommendations: [
      '야간 훈련 전 안전 브리핑 의무화',
      '결빙 구간 표지판 추가 설치',
      '훈련 강도 조절 검토',
    ]
  },
  { 
    id: '3', 
    title: '2024년 11월 월간 안전 통계', 
    type: 'monthly', 
    period: '2024.11.01 ~ 2024.11.30', 
    generatedAt: '2024-12-01', 
    unit: '제1사단',
    summary: '11월 전체 사고 발생 건수는 전월 대비 15% 감소하였습니다. 안전교육 강화 시책이 효과를 보이고 있습니다.',
    stats: { totalAccidents: 34, resolved: 32, pending: 2, changeRate: -15 },
    details: [
      { category: '차량 사고', count: 8, trend: 'down' },
      { category: '훈련 사고', count: 12, trend: 'stable' },
      { category: '시설 안전', count: 7, trend: 'down' },
      { category: '개인 부주의', count: 7, trend: 'down' },
    ],
    recommendations: [
      '현행 안전교육 프로그램 유지',
      '12월 동절기 대비 추가 교육 실시',
      '우수 안전관리 부대 포상 검토',
    ]
  },
  { id: '4', title: '2024년 11월 4주차 사고 위험도 분석', type: 'weekly', period: '2024.11.24 ~ 2024.11.30', generatedAt: '2024-11-30', unit: '제1사단',
    summary: '월말 정비 주간으로 훈련 감소, 사고 위험도 안정세 유지.',
    stats: { totalAccidents: 6, resolved: 6, pending: 0, changeRate: -5 },
    details: [
      { category: '차량 사고', count: 1, trend: 'down' },
      { category: '훈련 사고', count: 2, trend: 'down' },
      { category: '시설 안전', count: 2, trend: 'stable' },
      { category: '개인 부주의', count: 1, trend: 'stable' },
    ],
    recommendations: ['정비 시 안전수칙 준수 강조', '12월 훈련 계획 사전 안전성 검토']
  },
  { id: '5', title: '2024년 11월 3주차 사고 위험도 분석', type: 'weekly', period: '2024.11.17 ~ 2024.11.23', generatedAt: '2024-11-23', unit: '제1사단',
    summary: '대대급 훈련 실시로 일시적 사고 증가, 대부분 경미한 사고로 분류됨.',
    stats: { totalAccidents: 9, resolved: 8, pending: 1, changeRate: 3 },
    details: [
      { category: '차량 사고', count: 2, trend: 'stable' },
      { category: '훈련 사고', count: 4, trend: 'up' },
      { category: '시설 안전', count: 1, trend: 'down' },
      { category: '개인 부주의', count: 2, trend: 'stable' },
    ],
    recommendations: ['훈련 전 안전점검 체크리스트 활용 강화', '경미 사고도 보고체계 준수']
  },
  { id: '6', title: '2024년 10월 월간 안전 통계', type: 'monthly', period: '2024.10.01 ~ 2024.10.31', generatedAt: '2024-11-01', unit: '제1사단',
    summary: '10월 사고 발생 건수는 평년 수준 유지. 계절 변화에 따른 대비 필요.',
    stats: { totalAccidents: 40, resolved: 38, pending: 2, changeRate: 2 },
    details: [
      { category: '차량 사고', count: 10, trend: 'stable' },
      { category: '훈련 사고', count: 14, trend: 'stable' },
      { category: '시설 안전', count: 9, trend: 'up' },
      { category: '개인 부주의', count: 7, trend: 'stable' },
    ],
    recommendations: ['동절기 대비 안전교육 사전 실시', '노후 시설물 점검 강화']
  },
];

// 차트 색상
const CHART_COLORS = ['#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

// 기간별 추세 데이터 생성
const generateTrendData = (type: 'weekly' | 'monthly' | 'quarterly' | 'custom') => {
  if (type === 'weekly') {
    return [
      { name: '월', 차량사고: 1, 훈련사고: 2, 시설안전: 0, 개인부주의: 1 },
      { name: '화', 차량사고: 0, 훈련사고: 1, 시설안전: 1, 개인부주의: 0 },
      { name: '수', 차량사고: 1, 훈련사고: 0, 시설안전: 0, 개인부주의: 1 },
      { name: '목', 차량사고: 0, 훈련사고: 2, 시설안전: 1, 개인부주의: 0 },
      { name: '금', 차량사고: 0, 훈련사고: 1, 시설안전: 0, 개인부주의: 0 },
      { name: '토', 차량사고: 0, 훈련사고: 0, 시설안전: 0, 개인부주의: 0 },
      { name: '일', 차량사고: 0, 훈련사고: 0, 시설안전: 0, 개인부주의: 0 },
    ];
  } else if (type === 'monthly') {
    return [
      { name: '1주', 차량사고: 3, 훈련사고: 5, 시설안전: 2, 개인부주의: 1 },
      { name: '2주', 차량사고: 2, 훈련사고: 3, 시설안전: 1, 개인부주의: 2 },
      { name: '3주', 차량사고: 2, 훈련사고: 4, 시설안전: 2, 개인부주의: 3 },
      { name: '4주', 차량사고: 1, 훈련사고: 2, 시설안전: 2, 개인부주의: 1 },
    ];
  } else {
    return [
      { name: '1월', 차량사고: 8, 훈련사고: 12, 시설안전: 5, 개인부주의: 4 },
      { name: '2월', 차량사고: 6, 훈련사고: 10, 시설안전: 6, 개인부주의: 5 },
      { name: '3월', 차량사고: 7, 훈련사고: 14, 시설안전: 4, 개인부주의: 3 },
    ];
  }
};

interface StatisticsReportListProps {
  showModal?: boolean;
  onCloseModal?: () => void;
}

export function StatisticsReportList({ showModal = false, onCloseModal }: StatisticsReportListProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<StatReport | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 보고서 생성 관련 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [reports, setReports] = useState<StatReport[]>(MOCK_STAT_REPORTS);
  const [createForm, setCreateForm] = useState({
    reportType: 'weekly' as 'weekly' | 'monthly' | 'quarterly',
    periodType: 'preset' as 'preset' | 'custom',
    presetPeriod: 'previous' as 'current' | 'previous',
    customStartDate: undefined as Date | undefined,
    customEndDate: undefined as Date | undefined,
    analysisTarget: 'unit' as 'unit' | 'rank',
    unitId: '',
    rankType: 'all' as 'all' | 'enlisted' | 'nco' | 'officer',
  });

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!showModal) {
      setCreateForm({
        reportType: 'weekly',
        periodType: 'preset',
        presetPeriod: 'previous',
        customStartDate: undefined,
        customEndDate: undefined,
        analysisTarget: 'unit',
        unitId: '',
        rankType: 'all',
      });
    }
  }, [showModal]);

  // 기간 계산 함수
  const calculatePeriod = (reportType: 'weekly' | 'monthly' | 'quarterly', periodType: 'current' | 'previous') => {
    const now = new Date();
    let start: Date, end: Date;
    
    if (reportType === 'weekly') {
      if (periodType === 'current') {
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
      } else {
        const lastWeek = subWeeks(now, 1);
        start = startOfWeek(lastWeek, { weekStartsOn: 1 });
        end = endOfWeek(lastWeek, { weekStartsOn: 1 });
      }
    } else if (reportType === 'monthly') {
      if (periodType === 'current') {
        start = startOfMonth(now);
        end = endOfMonth(now);
      } else {
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
      }
    } else {
      // quarterly
      if (periodType === 'current') {
        start = startOfQuarter(now);
        end = endOfQuarter(now);
      } else {
        const lastQuarter = subQuarters(now, 1);
        start = startOfQuarter(lastQuarter);
        end = endOfQuarter(lastQuarter);
      }
    }
    
    return {
      start: format(start, 'yyyy.MM.dd'),
      end: format(end, 'yyyy.MM.dd'),
      label: `${format(start, 'yyyy.MM.dd')} ~ ${format(end, 'yyyy.MM.dd')}`
    };
  };

  // 현재 선택된 기간 표시
  const getSelectedPeriodLabel = () => {
    if (createForm.periodType === 'custom') {
      if (createForm.customStartDate && createForm.customEndDate) {
        return `${format(createForm.customStartDate, 'yyyy.MM.dd')} ~ ${format(createForm.customEndDate, 'yyyy.MM.dd')}`;
      }
      return '날짜를 선택하세요';
    }
    return calculatePeriod(createForm.reportType, createForm.presetPeriod).label;
  };

  // 랜덤 통계 데이터 생성 (실제로는 DB에서 집계)
  const generateMockStats = () => {
    const totalAccidents = Math.floor(Math.random() * 20) + 5;
    const resolved = Math.floor(totalAccidents * (0.7 + Math.random() * 0.25));
    const changeRate = Math.floor(Math.random() * 40) - 20;
    
    return {
      totalAccidents,
      resolved,
      pending: totalAccidents - resolved,
      changeRate
    };
  };

  const generateMockDetails = () => {
    const categories = ['차량 사고', '훈련 사고', '시설 안전', '개인 부주의'];
    return categories.map(category => ({
      category,
      count: Math.floor(Math.random() * 8) + 1,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    }));
  };

  const generateRecommendations = (stats: { changeRate: number }) => {
    const recommendations = [
      '안전교육 프로그램 지속 실시',
      '훈련 전 안전점검 체크리스트 활용 강화',
      '야간 훈련 시 안전요원 추가 배치 권고',
      '신병 대상 안전교육 강화 필요',
      '정비 시 안전수칙 준수 강조',
      '동절기 차량 점검 체크리스트 활용',
      '결빙 구간 표지판 추가 설치',
      '응급처치 교육 정기 실시',
    ];
    
    // 랜덤으로 3개 선택
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // 보고서 자동 생성
  const handleGenerateReport = () => {
    // 분석 대상이 부대인 경우에만 부대 선택 필수
    if (createForm.analysisTarget === 'unit' && !createForm.unitId) {
      toast({
        title: '부대 선택 필요',
        description: '보고서를 생성할 부대를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    // 커스텀 기간일 때 날짜 검증
    if (createForm.periodType === 'custom' && (!createForm.customStartDate || !createForm.customEndDate)) {
      toast({
        title: '기간 선택 필요',
        description: '시작일과 종료일을 모두 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    // 시뮬레이션: 2초 후 생성 완료
    setTimeout(() => {
      const unit = createForm.analysisTarget === 'unit' ? getUnitById(createForm.unitId) : null;
      
      // 기간 결정
      let periodLabel: string;
      let reportTypeForTitle: 'weekly' | 'monthly' | 'quarterly' | 'custom';
      
      if (createForm.periodType === 'custom' && createForm.customStartDate && createForm.customEndDate) {
        periodLabel = `${format(createForm.customStartDate, 'yyyy.MM.dd')} ~ ${format(createForm.customEndDate, 'yyyy.MM.dd')}`;
        reportTypeForTitle = 'custom';
      } else {
        const period = calculatePeriod(createForm.reportType, createForm.presetPeriod);
        periodLabel = period.label;
        reportTypeForTitle = createForm.reportType;
      }

      const stats = generateMockStats();
      const details = generateMockDetails();
      const recommendations = generateRecommendations(stats);

      // 계급 라벨
      const rankLabels: Record<string, string> = {
        all: '전체 계급',
        enlisted: '병사',
        nco: '부사관',
        officer: '장교',
      };

      // 제목 생성
      const targetLabel = createForm.analysisTarget === 'unit' 
        ? (unit?.name || '전체') 
        : rankLabels[createForm.rankType];
      
      const typeLabels: Record<string, string> = {
        weekly: '주간',
        monthly: '월간',
        quarterly: '분기',
        custom: '기간'
      };
      
      const titleType = typeLabels[reportTypeForTitle] || '기간';

      const summaryTemplates = [
        `분석 기간 동안 총 ${stats.totalAccidents}건의 사고가 발생하였으며, 전기 대비 ${stats.changeRate > 0 ? '증가' : '감소'} 추세입니다.`,
        `해당 기간 사고 발생률이 ${Math.abs(stats.changeRate)}% ${stats.changeRate > 0 ? '상승' : '하락'}하였습니다. 지속적인 안전관리가 필요합니다.`,
        `전체 ${stats.totalAccidents}건 중 ${stats.resolved}건이 처리 완료되었으며, ${stats.pending}건이 처리 진행 중입니다.`,
      ];

      // 대상 표시 문자열
      const unitDisplayLabel = createForm.analysisTarget === 'unit' 
        ? (unit?.name || '전체') 
        : rankLabels[createForm.rankType];

      const newReport: StatReport = {
        id: `generated-${Date.now()}`,
        title: `${targetLabel} ${titleType} 사고 위험도 분석`,
        type: reportTypeForTitle,
        period: periodLabel,
        generatedAt: format(new Date(), 'yyyy-MM-dd'),
        unit: unitDisplayLabel,
        analysisTarget: createForm.analysisTarget,
        summary: summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)],
        stats,
        details,
        recommendations,
      };

      setReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
      onCloseModal?.();
      setSelectedReport(newReport);
      
      toast({
        title: '보고서 생성 완료',
        description: `${newReport.title} 보고서가 생성되었습니다.`,
      });
    }, 2000);
  };

  const filteredReports = reports.filter((report) => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    // 대상 필터: unit이면 부대명에 '사단' 등이 포함된 것, rank면 '계급' 포함
    const matchesTarget = filterTarget === 'all' || 
      (filterTarget === 'unit' && !report.unit.includes('계급')) ||
      (filterTarget === 'rank' && report.unit.includes('계급'));
    return matchesType && matchesSearch && matchesTarget;
  });

  const handleDownloadPDF = async (report: StatReport) => {
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

      // 각 A4 페이지를 개별적으로 캡처
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

      pdf.save(`${report.title}.pdf`);
      
      toast({
        title: 'PDF 다운로드 완료',
        description: '통계 보고서가 PDF 형식으로 다운로드되었습니다.',
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
  const handlePrint = async (report: StatReport) => {
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

  const handleDownloadHWP = (report: StatReport) => {
    const content = `${report.title}\n\n부대: ${report.unit}\n기간: ${report.period}\n\n1. 요약\n${report.summary}\n\n2. 주요 통계\n총 사고 건수: ${report.stats?.totalAccidents}건\n처리 완료: ${report.stats?.resolved}건\n처리 중: ${report.stats?.pending}건\n전기 대비 증감: ${report.stats?.changeRate}%\n\n3. 권고사항\n${report.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title}.hwp`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'HWP 다운로드',
      description: '보고서가 HWP 형식으로 다운로드되었습니다. (텍스트 기반)',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly':
        return '주간';
      case 'monthly':
        return '월간';
      case 'quarterly':
        return '분기';
      case 'custom':
        return '기간';
      default:
        return type;
    }
  };

  // 처리율 계산
  const getProcessingRate = (stats: StatReport['stats']) => {
    if (!stats || stats.totalAccidents === 0) return 0;
    return Math.round((stats.resolved / stats.totalAccidents) * 100);
  };

  // A4 페이지 상수
  const A4_WIDTH_PX = 595;
  const A4_HEIGHT_PX = 842;
  const PAGE_PADDING_X = 50;
  const PAGE_PADDING_TOP = 28;
  const PAGE_PADDING_BOTTOM = 80;

  // 상세보기 (좌: 상세 정보, 우: PDF 미리보기)
  if (selectedReport) {
    // CSS 기반 바 차트 데이터
    const totalCount = selectedReport.details?.reduce((sum, d) => sum + d.count, 0) || 1;
    const barChartData = selectedReport.details?.map((d, i) => ({
      ...d,
      percentage: Math.round((d.count / totalCount) * 100),
      color: CHART_COLORS[i % CHART_COLORS.length]
    })) || [];

    return (
      <div className="space-y-4">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setSelectedReport(null); setShowPreview(false); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </button>
          <div className="flex items-center gap-2">
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
            {/* 보고서 헤더 */}
            <div className="p-4 border-b border-border bg-muted/20 rounded-t-lg">
              <p className="text-xs text-muted-foreground text-center mb-2">육군 안전관리단</p>
              <h1 className="text-lg font-semibold text-center">{selectedReport.title}</h1>
            </div>

            {/* 기본 정보 테이블 */}
            <div className="border-x border-b border-border">
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
                  <div className="p-2 bg-muted/30 text-xs font-medium">분석 대상</div>
                  <div className="p-2 text-xs">{selectedReport.unit}</div>
                </div>
                <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
                  <div className="p-2 bg-muted/30 text-xs font-medium">보고서 유형</div>
                  <div className="p-2 text-xs">{getTypeLabel(selectedReport.type)} 보고서</div>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
                  <div className="p-2 bg-muted/30 text-xs font-medium">분석 기간</div>
                  <div className="p-2 text-xs">{selectedReport.period}</div>
                </div>
                <div className="grid grid-cols-[80px_1fr] divide-x divide-border">
                  <div className="p-2 bg-muted/30 text-xs font-medium">생성일</div>
                  <div className="p-2 text-xs">{selectedReport.generatedAt}</div>
                </div>
              </div>
            </div>

            {/* 1. 개요 */}
            <div className="p-4 border-x border-b border-border">
              <h2 className="text-sm font-semibold mb-3">1. 개요</h2>
              <div className="pl-3 space-y-2 text-xs">
                <div>
                  <p className="font-medium text-foreground mb-1">가. 목적</p>
                  <p className="text-muted-foreground pl-3">본 보고서는 분석 기간 내 발생한 사고 및 안전 현황을 종합적으로 분석하여, 향후 사고 예방 및 안전관리 개선을 위한 기초자료로 활용하고자 함.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">나. 분석 범위</p>
                  <p className="text-muted-foreground pl-3">• 분석 대상: {selectedReport.unit}</p>
                  <p className="text-muted-foreground pl-3">• 분석 기간: {selectedReport.period}</p>
                </div>
              </div>
            </div>

            {/* 2. 요약 */}
            <div className="p-4 border-x border-b border-border">
              <h2 className="text-sm font-semibold mb-2">2. 주요 현황 요약</h2>
              <p className="text-xs text-muted-foreground leading-relaxed pl-3">{selectedReport.summary}</p>
            </div>

            {/* 3. 주요 통계 */}
            {selectedReport.stats && (
              <div className="p-4 border-x border-b border-border">
                <h2 className="text-sm font-semibold mb-3">3. 사고 통계 현황</h2>
                <div className="grid grid-cols-5 gap-px bg-border ml-3 rounded overflow-hidden">
                  <div className="bg-background p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">총 발생</p>
                    <p className="text-base font-semibold">{selectedReport.stats.totalAccidents}건</p>
                  </div>
                  <div className="bg-background p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">처리 완료</p>
                    <p className="text-base font-semibold text-status-success">{selectedReport.stats.resolved}건</p>
                  </div>
                  <div className="bg-background p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">처리 중</p>
                    <p className="text-base font-semibold text-status-warning">{selectedReport.stats.pending}건</p>
                  </div>
                  <div className="bg-background p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">처리율</p>
                    <p className="text-base font-semibold">{getProcessingRate(selectedReport.stats)}%</p>
                  </div>
                  <div className="bg-background p-3 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">전기 대비</p>
                    <p className={`text-base font-semibold ${selectedReport.stats.changeRate > 0 ? 'text-status-error' : selectedReport.stats.changeRate < 0 ? 'text-status-success' : ''}`}>
                      {selectedReport.stats.changeRate > 0 ? '▲' : selectedReport.stats.changeRate < 0 ? '▼' : '-'} {Math.abs(selectedReport.stats.changeRate)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. 유형별 현황 */}
            {selectedReport.details && (
              <div className="p-4 border-x border-b border-border">
                <h2 className="text-sm font-semibold mb-3">4. 사고 유형별 분석</h2>
                
                {/* 차트 영역 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* 파이차트 */}
                  <div className="border border-border rounded p-3">
                    <h3 className="text-[10px] font-medium text-muted-foreground mb-2">유형별 분포</h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedReport.details.map((d, i) => ({
                              name: d.category,
                              value: d.count,
                              color: CHART_COLORS[i % CHART_COLORS.length]
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {selectedReport.details.map((_, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 라인차트 */}
                  <div className="border border-border rounded p-3">
                    <h3 className="text-[10px] font-medium text-muted-foreground mb-2">기간별 추세</h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateTrendData(selectedReport.type)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="차량사고" stroke={CHART_COLORS[0]} strokeWidth={1.5} dot={{ r: 2 }} />
                          <Line type="monotone" dataKey="훈련사고" stroke={CHART_COLORS[1]} strokeWidth={1.5} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* 테이블 */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-y border-border bg-muted/30">
                      <th className="text-left p-2 font-medium w-8">순번</th>
                      <th className="text-left p-2 font-medium">사고 유형</th>
                      <th className="text-right p-2 font-medium w-16">발생</th>
                      <th className="text-right p-2 font-medium w-12">비율</th>
                      <th className="text-right p-2 font-medium w-16">전기대비</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedReport.details.map((detail, idx) => {
                      const percentage = Math.round((detail.count / totalCount) * 100);
                      return (
                        <tr key={idx}>
                          <td className="p-2 text-center text-muted-foreground">{idx + 1}</td>
                          <td className="p-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                            {detail.category}
                          </td>
                          <td className="p-2 text-right font-medium">{detail.count}건</td>
                          <td className="p-2 text-right text-muted-foreground">{percentage}%</td>
                          <td className={`p-2 text-right ${detail.trend === 'up' ? 'text-status-error' : detail.trend === 'down' ? 'text-status-success' : 'text-muted-foreground'}`}>
                            {detail.trend === 'up' ? '▲' : detail.trend === 'down' ? '▼' : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. 권고사항 */}
            {selectedReport.recommendations && (
              <div className="p-4 border-x border-b border-border">
                <h2 className="text-sm font-semibold mb-2">5. 권고사항 및 개선방안</h2>
                <div className="space-y-1.5 pl-3">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{String.fromCharCode(97 + idx)}.</span> {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 6. 결론 */}
            <div className="p-4 border-x border-b border-border rounded-b-lg">
              <h2 className="text-sm font-semibold mb-2">6. 결론</h2>
              <p className="text-xs text-muted-foreground leading-relaxed pl-3">
                상기 분석 결과를 바탕으로 지속적인 안전관리 활동 및 예방 조치를 시행하여 사고 발생률 저감에 기여하고자 함.
              </p>
            </div>
          </div>

          {/* 우측: PDF 미리보기 */}
          <div 
            ref={previewRef}
            className="overflow-y-auto flex flex-col items-center gap-4"
            style={{ backgroundColor: '#e5e5e5', padding: '16px', borderRadius: '8px' }}
          >
            {/* 1페이지 */}
            <div 
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
                lineHeight: '1.55',
                transform: 'scale(0.75)',
                transformOrigin: 'top center',
                marginBottom: '-210px',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img src={armyLogo} alt="" className="w-48 h-48 opacity-[0.05]" style={{ filter: 'grayscale(100%)' }} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={armyLogo} alt="육군본부" className="w-10 h-10" />
                    <div>
                      <p className="text-[9px] text-gray-500">대한민국 육군</p>
                      <p className="text-[11px] font-bold text-black">육군본부</p>
                    </div>
                  </div>
                  <div className="text-right text-[9px] text-gray-500">
                    <p>문서번호: STAT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 10000)).padStart(5, '0')}</p>
                    <p>생성일: {selectedReport.generatedAt}</p>
                  </div>
                </div>

                <div className="text-center border-y-2 border-black py-3 mb-6">
                  <h1 className="text-base font-bold text-black tracking-widest">통 계 보 고 서</h1>
                  <p className="text-[9px] text-gray-500 mt-0.5">STATISTICS REPORT</p>
                </div>

                <table className="w-full border-collapse mb-6 text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-black bg-gray-100 p-1.5 w-20 font-semibold">분석 대상</td>
                      <td className="border border-black p-1.5">{selectedReport.unit}</td>
                      <td className="border border-black bg-gray-100 p-1.5 w-20 font-semibold">보고서 유형</td>
                      <td className="border border-black p-1.5">{getTypeLabel(selectedReport.type)} 보고서</td>
                    </tr>
                    <tr>
                      <td className="border border-black bg-gray-100 p-1.5 font-semibold">분석 기간</td>
                      <td className="border border-black p-1.5">{selectedReport.period}</td>
                      <td className="border border-black bg-gray-100 p-1.5 font-semibold">생성일</td>
                      <td className="border border-black p-1.5">{selectedReport.generatedAt}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-center mb-6">
                  <h2 className="text-sm font-bold">{selectedReport.title}</h2>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold mb-2 border-b-2 border-black pb-1 text-[11px]">1. 개요</h3>
                  <div className="pl-3 space-y-1 text-[10px]">
                    <p><strong>가. 목적</strong></p>
                    <p className="pl-3 text-justify">본 보고서는 분석 기간 내 발생한 사고 및 안전 현황을 종합적으로 분석하여, 향후 사고 예방 및 안전관리 개선을 위한 기초자료로 활용하고자 함.</p>
                    <p className="mt-1"><strong>나. 분석 범위</strong></p>
                    <p className="pl-3">- 분석 대상: {selectedReport.unit}</p>
                    <p className="pl-3">- 분석 기간: {selectedReport.period}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold mb-2 border-b-2 border-black pb-1 text-[11px]">2. 주요 현황 요약</h3>
                  <p className="text-[10px] leading-relaxed pl-3 text-justify">{selectedReport.summary}</p>
                </div>

                {selectedReport.stats && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2 border-b-2 border-black pb-1 text-[11px]">3. 사고 통계 현황</h3>
                    <table className="w-full border-collapse text-[10px] mb-2">
                      <thead>
                        <tr>
                          <th className="border border-black bg-gray-100 p-1.5">구분</th>
                          <th className="border border-black bg-gray-100 p-1.5">총 발생</th>
                          <th className="border border-black bg-gray-100 p-1.5">처리 완료</th>
                          <th className="border border-black bg-gray-100 p-1.5">처리 중</th>
                          <th className="border border-black bg-gray-100 p-1.5">처리율</th>
                          <th className="border border-black bg-gray-100 p-1.5">전기 대비</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-1.5 text-center bg-gray-50">사고 건수</td>
                          <td className="border border-black p-1.5 text-center font-semibold">{selectedReport.stats.totalAccidents}건</td>
                          <td className="border border-black p-1.5 text-center">{selectedReport.stats.resolved}건</td>
                          <td className="border border-black p-1.5 text-center">{selectedReport.stats.pending}건</td>
                          <td className="border border-black p-1.5 text-center">{getProcessingRate(selectedReport.stats)}%</td>
                          <td className="border border-black p-1.5 text-center font-semibold">
                            {selectedReport.stats.changeRate > 0 ? '▲' : selectedReport.stats.changeRate < 0 ? '▼' : '-'} {Math.abs(selectedReport.stats.changeRate)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center">
                  <p className="text-[8px] text-gray-400">본 문서는 대외비로 취급하시기 바랍니다.</p>
                  <p className="text-[9px] text-gray-400">- 1 / 2 -</p>
                </div>
              </div>
            </div>

            {/* 2페이지 */}
            <div 
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
                lineHeight: '1.55',
                transform: 'scale(0.75)',
                transformOrigin: 'top center',
                marginBottom: '-210px',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
                <img src={armyLogo} alt="" className="w-48 h-48 opacity-[0.05]" style={{ filter: 'grayscale(100%)' }} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <p className="text-[9px] text-gray-400">통계보고서 (계속)</p>
                  <p className="text-[9px] text-gray-400">{selectedReport.title}</p>
                </div>

                {selectedReport.details && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2 border-b-2 border-black pb-1 text-[11px]">4. 사고 유형별 분석</h3>
                    
                    <div className="mb-4 p-3 border border-gray-200 rounded">
                      <p className="text-[9px] font-medium text-gray-600 mb-2">유형별 분포</p>
                      <div className="space-y-2">
                        {barChartData.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[9px] w-16 truncate">{item.category}</span>
                            <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
                              <div 
                                className="h-full rounded"
                                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                              />
                            </div>
                            <span className="text-[9px] w-8 text-right">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr>
                          <th className="border border-black bg-gray-100 p-1.5 text-left w-10">순번</th>
                          <th className="border border-black bg-gray-100 p-1.5 text-left">사고 유형</th>
                          <th className="border border-black bg-gray-100 p-1.5 w-20 text-center">발생 건수</th>
                          <th className="border border-black bg-gray-100 p-1.5 w-16 text-center">비율</th>
                          <th className="border border-black bg-gray-100 p-1.5 w-20 text-center">전기 대비</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.details.map((detail, idx) => {
                          const percentage = Math.round((detail.count / totalCount) * 100);
                          return (
                            <tr key={idx}>
                              <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                              <td className="border border-black p-1.5">
                                <span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                {detail.category}
                              </td>
                              <td className="border border-black p-1.5 text-center">{detail.count}건</td>
                              <td className="border border-black p-1.5 text-center">{percentage}%</td>
                              <td className="border border-black p-1.5 text-center">
                                {detail.trend === 'up' ? '▲ 증가' : detail.trend === 'down' ? '▼ 감소' : '- 유지'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedReport.recommendations && (
                  <div className="mb-4">
                    <h3 className="font-bold mb-2 border-b-2 border-black pb-1 text-[11px]">5. 권고사항 및 개선방안</h3>
                    <div className="pl-3 text-[10px] space-y-1">
                      {selectedReport.recommendations.map((rec, idx) => (
                        <p key={idx}><strong>{String.fromCharCode(97 + idx)}.</strong> {rec}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-bold mb-2 border-b-2 border-black pb-1 text-[11px]">6. 결론</h3>
                  <p className="text-[10px] leading-relaxed pl-3 text-justify">
                    상기 분석 결과를 바탕으로 지속적인 안전관리 활동 및 예방 조치를 시행하여 사고 발생률 저감에 기여하고자 함.
                  </p>
                </div>

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

                <div className="mt-auto pt-4 border-t border-gray-300 flex justify-between items-center">
                  <p className="text-[8px] text-gray-400">본 문서는 대외비로 취급하시기 바랍니다.</p>
                  <p className="text-[9px] text-gray-400">- 2 / 2 -</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 이제 상세보기와 미리보기가 합쳐짐 (위에서 처리)

  // 모달 폼 컨텐츠
  const StatReportFormContent = (
    <div className="space-y-4">
      {/* Row 1: 분석 대상 + 보고서 유형 + 기간 선택 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 분석 대상 */}
        <div>
          <label className="block text-xs text-muted-foreground mb-2">분석 대상</label>
          <select
            value={createForm.analysisTarget}
            onChange={(e) => setCreateForm(prev => ({ ...prev, analysisTarget: e.target.value as 'unit' | 'rank' }))}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="unit">부대별</option>
            <option value="rank">계급별</option>
          </select>
        </div>

        {/* 보고서 유형 */}
        <div>
          <label className="block text-xs text-muted-foreground mb-2">보고서 유형</label>
          <select
            value={createForm.reportType}
            onChange={(e) => setCreateForm(prev => ({ ...prev, reportType: e.target.value as 'weekly' | 'monthly' | 'quarterly' }))}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="weekly">주간</option>
            <option value="monthly">월간</option>
            <option value="quarterly">분기</option>
          </select>
        </div>
      </div>

      {/* Row 2: 기간 유형 + 프리셋/커스텀 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-2">기간 선택</label>
          <select
            value={createForm.periodType}
            onChange={(e) => setCreateForm(prev => ({ ...prev, periodType: e.target.value as 'preset' | 'custom' }))}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="preset">프리셋</option>
            <option value="custom">직접 입력</option>
          </select>
        </div>

        {createForm.periodType === 'preset' ? (
          <div>
            <label className="block text-xs text-muted-foreground mb-2">기간</label>
            <select
              value={createForm.presetPeriod}
              onChange={(e) => setCreateForm(prev => ({ ...prev, presetPeriod: e.target.value as 'current' | 'previous' }))}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
            >
              <option value="current">
                {createForm.reportType === 'weekly' ? '이번 주' : createForm.reportType === 'monthly' ? '이번 달' : '이번 분기'}
              </option>
              <option value="previous">
                {createForm.reportType === 'weekly' ? '지난 주' : createForm.reportType === 'monthly' ? '지난 달' : '지난 분기'}
              </option>
            </select>
          </div>
        ) : (
          <div className="col-span-1" />
        )}
      </div>

      {/* 커스텀 날짜 선택 */}
      {createForm.periodType === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">시작일</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 bg-background border border-border rounded px-3 py-2 text-sm text-left focus:outline-none focus:border-foreground transition-colors",
                    !createForm.customStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {createForm.customStartDate ? format(createForm.customStartDate, 'yyyy.MM.dd') : '선택'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border z-[300]" align="start">
                <Calendar
                  mode="single"
                  selected={createForm.customStartDate}
                  onSelect={(date) => setCreateForm(prev => ({ ...prev, customStartDate: date }))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-2">종료일</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 bg-background border border-border rounded px-3 py-2 text-sm text-left focus:outline-none focus:border-foreground transition-colors",
                    !createForm.customEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {createForm.customEndDate ? format(createForm.customEndDate, 'yyyy.MM.dd') : '선택'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border z-[300]" align="start">
                <Calendar
                  mode="single"
                  selected={createForm.customEndDate}
                  onSelect={(date) => setCreateForm(prev => ({ ...prev, customEndDate: date }))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* 부대 선택 또는 계급 선택 */}
      {createForm.analysisTarget === 'unit' ? (
        <div>
          <label className="block text-xs text-muted-foreground mb-2">분석 대상 부대</label>
          <UnitCascadeSelect
            value={createForm.unitId}
            onChange={(value) => setCreateForm(prev => ({ ...prev, unitId: value }))}
            placeholder="부대 선택"
            firstFullWidthRestInline={true}
          />
        </div>
      ) : (
        <div>
          <label className="block text-xs text-muted-foreground mb-2">분석 대상 계급</label>
          <select
            value={createForm.rankType}
            onChange={(e) => setCreateForm(prev => ({ ...prev, rankType: e.target.value as 'all' | 'enlisted' | 'nco' | 'officer' }))}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="all">전체 계급</option>
            <option value="enlisted">병사 (이병~병장)</option>
            <option value="nco">부사관 (하사~원사)</option>
            <option value="officer">장교 (소위~대장)</option>
          </select>
        </div>
      )}

      {/* 선택된 기간 표시 */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
        분석 기간: <span className="text-foreground font-medium">{getSelectedPeriodLabel()}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 검색/필터 영역 */}
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="보고서 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-border rounded text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-32 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
        >
          <option value="all">전체</option>
          <option value="weekly">주간</option>
          <option value="monthly">월간</option>
        </select>
        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          className="w-32 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
        >
          <option value="all">대상: 전체</option>
          <option value="unit">부대별</option>
          <option value="rank">계급별</option>
        </select>
      </div>

      {/* Reports Table */}
      <div>
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_180px_100px_100px_50px] gap-4 py-3 text-xs text-muted-foreground border-y border-border">
          <div>유형</div>
          <div>제목</div>
          <div>기간</div>
          <div>대상</div>
          <div>생성일</div>
          <div></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {filteredReports.map((report) => (
            <div 
              key={report.id} 
              onClick={() => setSelectedReport(report)}
              className="grid grid-cols-[80px_1fr_180px_100px_100px_50px] gap-4 py-3 items-center hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="text-sm text-muted-foreground">
                {getTypeLabel(report.type)}
              </div>
              <div className="text-sm font-medium truncate">{report.title}</div>
              <div className="text-sm text-muted-foreground tabular-nums">
                {report.period}
              </div>
              <div className="text-sm text-muted-foreground">
                {report.unit}
              </div>
              <div className="text-sm text-muted-foreground tabular-nums">
                {report.generatedAt}
              </div>
              <div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownloadHWP(report); }}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="다운로드"
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
        title="통계 보고서 생성"
        description="조건을 선택하면 사고 데이터를 자동 집계하여 보고서를 생성합니다"
        inputTypes={[
          { id: 'form', label: '생성 옵션', content: StatReportFormContent }
        ]}
        onSubmit={handleGenerateReport}
        submitLabel={isGenerating ? '생성 중...' : '보고서 생성'}
        isSubmitDisabled={isGenerating || (createForm.analysisTarget === 'unit' && !createForm.unitId)}
      />
    </div>
  );
}
