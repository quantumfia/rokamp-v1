import { useState, useRef } from 'react';
import { Download, ArrowLeft, Eye, ChevronDown, Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react';
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

export function StatisticsReportList() {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<StatReport | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 보고서 생성 관련 상태
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
      setShowCreateForm(false);
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
    return matchesType && matchesSearch;
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
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
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
      
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
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

  // PDF 미리보기 뷰
  if (selectedReport && showPreview) {
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

        {/* PDF 스타일 미리보기 */}
        <div className="flex justify-center">
          <div 
            ref={previewRef}
            className="bg-white text-black shadow-2xl relative"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              padding: '20mm',
              fontFamily: "'Noto Sans KR', 'Malgun Gothic', serif"
            }}
          >
            {/* 문서 헤더 */}
            <div className="text-center border-b-2 border-black pb-6 mb-8">
              <p className="text-sm tracking-widest mb-2">육군 안전관리단</p>
              <h1 className="text-2xl font-bold tracking-wide">통 계 보 고 서</h1>
            </div>

            {/* 기본 정보 테이블 */}
            <table className="w-full border-collapse mb-8 text-sm">
              <tbody>
                <tr className="border border-black">
                  <td className="border border-black bg-gray-100 p-2 w-28 font-semibold">분석 대상</td>
                  <td className="border border-black p-2">{selectedReport.unit}</td>
                  <td className="border border-black bg-gray-100 p-2 w-28 font-semibold">보고서 유형</td>
                  <td className="border border-black p-2">{getTypeLabel(selectedReport.type)} 보고서</td>
                </tr>
                <tr className="border border-black">
                  <td className="border border-black bg-gray-100 p-2 font-semibold">분석 기간</td>
                  <td className="border border-black p-2">{selectedReport.period}</td>
                  <td className="border border-black bg-gray-100 p-2 font-semibold">생성일</td>
                  <td className="border border-black p-2">{selectedReport.generatedAt}</td>
                </tr>
              </tbody>
            </table>

            {/* 보고서 제목 */}
            <div className="text-center mb-8">
              <h2 className="text-lg font-bold">{selectedReport.title}</h2>
            </div>

            {/* 1. 개요 */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 border-b-2 border-black pb-1">1. 개요</h3>
              <div className="pl-4 space-y-2 text-sm">
                <p><strong>가. 목적</strong></p>
                <p className="pl-4 text-justify">본 보고서는 분석 기간 내 발생한 사고 및 안전 현황을 종합적으로 분석하여, 향후 사고 예방 및 안전관리 개선을 위한 기초자료로 활용하고자 함.</p>
                <p className="mt-2"><strong>나. 분석 범위</strong></p>
                <p className="pl-4">- 분석 대상: {selectedReport.unit}</p>
                <p className="pl-4">- 분석 기간: {selectedReport.period}</p>
              </div>
            </div>

            {/* 2. 요약 */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 border-b-2 border-black pb-1">2. 주요 현황 요약</h3>
              <p className="text-sm leading-relaxed pl-4 text-justify">{selectedReport.summary}</p>
            </div>

            {/* 3. 주요 통계 */}
            {selectedReport.stats && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 border-b-2 border-black pb-1">3. 사고 통계 현황</h3>
                <table className="w-full border-collapse text-sm mb-4">
                  <thead>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2">구분</th>
                      <th className="border border-black bg-gray-100 p-2">총 발생</th>
                      <th className="border border-black bg-gray-100 p-2">처리 완료</th>
                      <th className="border border-black bg-gray-100 p-2">처리 중</th>
                      <th className="border border-black bg-gray-100 p-2">처리율</th>
                      <th className="border border-black bg-gray-100 p-2">전기 대비</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center bg-gray-50">사고 건수</td>
                      <td className="border border-black p-2 text-center font-semibold">{selectedReport.stats.totalAccidents}건</td>
                      <td className="border border-black p-2 text-center">{selectedReport.stats.resolved}건</td>
                      <td className="border border-black p-2 text-center">{selectedReport.stats.pending}건</td>
                      <td className="border border-black p-2 text-center">{getProcessingRate(selectedReport.stats)}%</td>
                      <td className="border border-black p-2 text-center font-semibold">
                        {selectedReport.stats.changeRate > 0 ? '▲' : selectedReport.stats.changeRate < 0 ? '▼' : '-'} {Math.abs(selectedReport.stats.changeRate)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-600 pl-4">
                  ※ 전기 대비: {selectedReport.stats.changeRate > 0 ? '증가' : selectedReport.stats.changeRate < 0 ? '감소' : '동일'} 
                  ({selectedReport.stats.changeRate > 0 ? '+' : ''}{selectedReport.stats.changeRate}%)
                </p>
              </div>
            )}

            {/* 4. 유형별 현황 */}
            {selectedReport.details && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 border-b-2 border-black pb-1">4. 사고 유형별 분석</h3>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left w-12">순번</th>
                      <th className="border border-black bg-gray-100 p-2 text-left">사고 유형</th>
                      <th className="border border-black bg-gray-100 p-2 w-24 text-center">발생 건수</th>
                      <th className="border border-black bg-gray-100 p-2 w-20 text-center">비율</th>
                      <th className="border border-black bg-gray-100 p-2 w-24 text-center">전기 대비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.details.map((detail, idx) => {
                      const totalCount = selectedReport.details?.reduce((sum, d) => sum + d.count, 0) || 1;
                      const percentage = Math.round((detail.count / totalCount) * 100);
                      return (
                        <tr key={idx}>
                          <td className="border border-black p-2 text-center">{idx + 1}</td>
                          <td className="border border-black p-2">{detail.category}</td>
                          <td className="border border-black p-2 text-center">{detail.count}건</td>
                          <td className="border border-black p-2 text-center">{percentage}%</td>
                          <td className="border border-black p-2 text-center">
                            {detail.trend === 'up' ? '▲ 증가' : detail.trend === 'down' ? '▼ 감소' : '- 유지'}
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
              <div className="mb-6">
                <h3 className="font-bold mb-3 border-b-2 border-black pb-1">5. 권고사항 및 개선방안</h3>
                <div className="pl-4 text-sm space-y-2">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <p key={idx}><strong>{String.fromCharCode(97 + idx)}.</strong> {rec}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 6. 결론 */}
            <div className="mb-6">
              <h3 className="font-bold mb-3 border-b-2 border-black pb-1">6. 결론</h3>
              <p className="text-sm leading-relaxed pl-4 text-justify">
                상기 분석 결과를 바탕으로 지속적인 안전관리 활동 및 예방 조치를 시행하여 사고 발생률 저감에 기여하고자 함. 
                각 부대는 본 보고서의 권고사항을 참고하여 자체 안전관리 계획을 수립·시행할 것을 권고함.
              </p>
            </div>

            {/* 문서 푸터 */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-500" style={{ padding: '0 20mm' }}>
              <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                <span>육군 안전관리단</span>
                <span>- 1 / 1 -</span>
                <span>{selectedReport.generatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 상세 페이지 뷰
  if (selectedReport) {
    return (
      <div className="space-y-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setSelectedReport(null); setShowPreview(false); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded text-sm hover:bg-muted/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
              미리보기
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
                <DropdownMenuItem onClick={() => { setShowPreview(true); setTimeout(() => handleDownloadPDF(selectedReport), 500); }}>
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

        {/* 보고서 본문 */}
        <div className="border border-border rounded-lg overflow-hidden">
          {/* 보고서 헤더 */}
          <div className="p-6 border-b border-border bg-muted/20">
            <p className="text-xs text-muted-foreground text-center mb-2">육군 안전관리단</p>
            <h1 className="text-xl font-semibold text-center">{selectedReport.title}</h1>
          </div>

          {/* 기본 정보 테이블 */}
          <div className="border-b border-border">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="grid grid-cols-[100px_1fr] divide-x divide-border">
                <div className="p-3 bg-muted/30 text-sm font-medium">분석 대상</div>
                <div className="p-3 text-sm">{selectedReport.unit}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] divide-x divide-border">
                <div className="p-3 bg-muted/30 text-sm font-medium">보고서 유형</div>
                <div className="p-3 text-sm">{getTypeLabel(selectedReport.type)} 보고서</div>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
              <div className="grid grid-cols-[100px_1fr] divide-x divide-border">
                <div className="p-3 bg-muted/30 text-sm font-medium">분석 기간</div>
                <div className="p-3 text-sm">{selectedReport.period}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] divide-x divide-border">
                <div className="p-3 bg-muted/30 text-sm font-medium">생성일</div>
                <div className="p-3 text-sm">{selectedReport.generatedAt}</div>
              </div>
            </div>
          </div>

          {/* 1. 개요 */}
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-semibold mb-4">1. 개요</h2>
            <div className="pl-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground mb-1">가. 목적</p>
                <p className="text-muted-foreground pl-4">본 보고서는 분석 기간 내 발생한 사고 및 안전 현황을 종합적으로 분석하여, 향후 사고 예방 및 안전관리 개선을 위한 기초자료로 활용하고자 함.</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">나. 분석 범위</p>
                <p className="text-muted-foreground pl-4">• 분석 대상: {selectedReport.unit}</p>
                <p className="text-muted-foreground pl-4">• 분석 기간: {selectedReport.period}</p>
              </div>
            </div>
          </div>

          {/* 2. 요약 */}
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-semibold mb-3">2. 주요 현황 요약</h2>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">{selectedReport.summary}</p>
          </div>

          {/* 3. 주요 통계 */}
          {selectedReport.stats && (
            <div className="p-6 border-b border-border">
              <h2 className="text-sm font-semibold mb-4">3. 사고 통계 현황</h2>
              <div className="grid grid-cols-5 gap-px bg-border ml-4 rounded overflow-hidden">
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">총 발생</p>
                  <p className="text-xl font-semibold">{selectedReport.stats.totalAccidents}건</p>
                </div>
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">처리 완료</p>
                  <p className="text-xl font-semibold text-status-success">{selectedReport.stats.resolved}건</p>
                </div>
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">처리 중</p>
                  <p className="text-xl font-semibold text-status-warning">{selectedReport.stats.pending}건</p>
                </div>
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">처리율</p>
                  <p className="text-xl font-semibold">{getProcessingRate(selectedReport.stats)}%</p>
                </div>
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">전기 대비</p>
                  <p className={`text-xl font-semibold ${selectedReport.stats.changeRate > 0 ? 'text-status-error' : selectedReport.stats.changeRate < 0 ? 'text-status-success' : ''}`}>
                    {selectedReport.stats.changeRate > 0 ? '▲' : selectedReport.stats.changeRate < 0 ? '▼' : '-'} {Math.abs(selectedReport.stats.changeRate)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. 유형별 현황 */}
          {selectedReport.details && (
            <div className="p-6 border-b border-border">
              <h2 className="text-sm font-semibold mb-4">4. 사고 유형별 분석</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/30">
                    <th className="text-left p-3 font-medium w-12">순번</th>
                    <th className="text-left p-3 font-medium">사고 유형</th>
                    <th className="text-right p-3 font-medium w-24">발생 건수</th>
                    <th className="text-right p-3 font-medium w-20">비율</th>
                    <th className="text-right p-3 font-medium w-24">전기 대비</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedReport.details.map((detail, idx) => {
                    const totalCount = selectedReport.details?.reduce((sum, d) => sum + d.count, 0) || 1;
                    const percentage = Math.round((detail.count / totalCount) * 100);
                    return (
                      <tr key={idx}>
                        <td className="p-3 text-center text-muted-foreground">{idx + 1}</td>
                        <td className="p-3">{detail.category}</td>
                        <td className="p-3 text-right font-medium">{detail.count}건</td>
                        <td className="p-3 text-right text-muted-foreground">{percentage}%</td>
                        <td className={`p-3 text-right ${detail.trend === 'up' ? 'text-status-error' : detail.trend === 'down' ? 'text-status-success' : 'text-muted-foreground'}`}>
                          {detail.trend === 'up' ? '▲ 증가' : detail.trend === 'down' ? '▼ 감소' : '- 유지'}
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
            <div className="p-6 border-b border-border">
              <h2 className="text-sm font-semibold mb-3">5. 권고사항 및 개선방안</h2>
              <div className="space-y-2 pl-4">
                {selectedReport.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{String.fromCharCode(97 + idx)}.</span> {rec}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 6. 결론 */}
          <div className="p-6">
            <h2 className="text-sm font-semibold mb-3">6. 결론</h2>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">
              상기 분석 결과를 바탕으로 지속적인 안전관리 활동 및 예방 조치를 시행하여 사고 발생률 저감에 기여하고자 함. 
              각 부대는 본 보고서의 권고사항을 참고하여 자체 안전관리 계획을 수립·시행할 것을 권고함.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <input 
            placeholder="보고서 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-transparent border border-border rounded px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-40 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="all">전체</option>
            <option value="weekly">주간 보고서</option>
            <option value="monthly">월간 보고서</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          새 보고서 생성
        </button>
      </div>

      {/* 보고서 생성 폼 */}
      {showCreateForm && (
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold">통계 보고서 자동 생성</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              취소
            </button>
          </div>

          {/* Row 1: 분석 대상 + 보고서 유형 + 기간 선택 */}
          <div className="flex gap-4 mb-4">
            {/* 분석 대상 */}
            <div className="w-32">
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
            <div className="w-28">
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

            {/* 기간 유형 */}
            <div className="w-32">
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

            {/* 프리셋 기간 or 커스텀 날짜 */}
            {createForm.periodType === 'preset' ? (
              <div className="w-32">
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
              <>
                <div className="w-36">
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
                    <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
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
                <div className="w-36">
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
                    <PopoverContent className="w-auto p-0 bg-card border-border z-50" align="start">
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
              </>
            )}
          </div>

          {/* Row 2: 부대 선택 (분석 대상이 부대인 경우) 또는 계급 선택 (분석 대상이 계급인 경우) */}
          {createForm.analysisTarget === 'unit' ? (
            <div className="mb-4">
              <label className="block text-xs text-muted-foreground mb-2">분석 대상 부대</label>
              <UnitCascadeSelect
                value={createForm.unitId}
                onChange={(value) => setCreateForm(prev => ({ ...prev, unitId: value }))}
                placeholder="부대 선택"
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-xs text-muted-foreground mb-2">분석 대상 계급</label>
              <select
                value={createForm.rankType}
                onChange={(e) => setCreateForm(prev => ({ ...prev, rankType: e.target.value as 'all' | 'enlisted' | 'nco' | 'officer' }))}
                className="w-64 bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
              >
                <option value="all">전체 계급</option>
                <option value="enlisted">병사 (이병~병장)</option>
                <option value="nco">부사관 (하사~원사)</option>
                <option value="officer">장교 (소위~대장)</option>
              </select>
            </div>
          )}

          {/* 선택된 기간 표시 */}
          <div className="text-xs text-muted-foreground mb-4">
            분석 기간: <span className="text-foreground font-medium">{getSelectedPeriodLabel()}</span>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              선택한 조건으로 사고 데이터를 자동 집계하여 보고서를 생성합니다.
            </p>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || (createForm.analysisTarget === 'unit' && !createForm.unitId)}
              className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  보고서 생성
                </>
              )}
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
}
