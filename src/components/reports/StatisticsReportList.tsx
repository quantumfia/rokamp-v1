import { useState } from 'react';
import { Download, ArrowLeft, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StatReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  period: string;
  generatedAt: string;
  unit: string;
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

  const filteredReports = MOCK_STAT_REPORTS.filter((report) => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDownload = (report: StatReport, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toast({
      title: '다운로드 시작',
      description: `${report.title} 파일을 다운로드합니다.`,
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly':
        return '주간';
      case 'monthly':
        return '월간';
      default:
        return type;
    }
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
          <button 
            onClick={() => handleDownload(selectedReport)}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded text-sm hover:opacity-80 transition-opacity"
          >
            <Download className="w-4 h-4" />
            다운로드
          </button>
        </div>

        {/* PDF 스타일 미리보기 */}
        <div className="flex justify-center">
          <div 
            className="bg-white text-black shadow-2xl relative"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              padding: '20mm',
              fontFamily: 'serif'
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
                  <td className="border border-black bg-gray-100 p-2 w-28 font-semibold">부대</td>
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

            {/* 1. 요약 */}
            <div className="mb-6">
              <h3 className="font-bold mb-2 border-b border-black pb-1">1. 요약</h3>
              <p className="text-sm leading-relaxed pl-4 text-justify">{selectedReport.summary}</p>
            </div>

            {/* 2. 주요 통계 */}
            {selectedReport.stats && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 border-b border-black pb-1">2. 주요 통계</h3>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2">총 사고 건수</th>
                      <th className="border border-black bg-gray-100 p-2">처리 완료</th>
                      <th className="border border-black bg-gray-100 p-2">처리 중</th>
                      <th className="border border-black bg-gray-100 p-2">전기 대비 증감</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-2 text-center font-semibold">{selectedReport.stats.totalAccidents}건</td>
                      <td className="border border-black p-2 text-center">{selectedReport.stats.resolved}건</td>
                      <td className="border border-black p-2 text-center">{selectedReport.stats.pending}건</td>
                      <td className="border border-black p-2 text-center font-semibold">
                        {selectedReport.stats.changeRate > 0 ? '+' : ''}{selectedReport.stats.changeRate}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. 유형별 현황 */}
            {selectedReport.details && (
              <div className="mb-6">
                <h3 className="font-bold mb-3 border-b border-black pb-1">3. 유형별 사고 현황</h3>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border border-black bg-gray-100 p-2 text-left">사고 유형</th>
                      <th className="border border-black bg-gray-100 p-2 w-24 text-center">발생 건수</th>
                      <th className="border border-black bg-gray-100 p-2 w-24 text-center">추세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.details.map((detail, idx) => (
                      <tr key={idx}>
                        <td className="border border-black p-2">{detail.category}</td>
                        <td className="border border-black p-2 text-center">{detail.count}건</td>
                        <td className="border border-black p-2 text-center">
                          {detail.trend === 'up' ? '▲ 증가' : detail.trend === 'down' ? '▼ 감소' : '- 유지'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. 권고사항 */}
            {selectedReport.recommendations && (
              <div className="mb-6">
                <h3 className="font-bold mb-2 border-b border-black pb-1">4. 권고사항</h3>
                <ol className="pl-8 text-sm space-y-1" style={{ listStyleType: 'lower-alpha' }}>
                  {selectedReport.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* 문서 푸터 */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-500" style={{ padding: '0 20mm' }}>
              <div className="border-t border-gray-300 pt-4">
                - 1 / 1 -
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
            <button 
              onClick={() => handleDownload(selectedReport)}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded text-sm hover:opacity-80 transition-opacity"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
          </div>
        </div>

        {/* 보고서 본문 */}
        <div className="border border-border rounded-lg">
          {/* 보고서 헤더 */}
          <div className="p-6 border-b border-border text-center">
            <h1 className="text-xl font-semibold">{selectedReport.title}</h1>
          </div>

          {/* 기본 정보 테이블 */}
          <div className="border-b border-border">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="grid grid-cols-[100px_1fr] divide-x divide-border">
                <div className="p-3 bg-muted/30 text-sm font-medium">부대</div>
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

          {/* 1. 요약 */}
          <div className="p-6 border-b border-border">
            <h2 className="text-sm font-semibold mb-3">1. 요약</h2>
            <p className="text-sm text-muted-foreground leading-relaxed pl-4">{selectedReport.summary}</p>
          </div>

          {/* 2. 주요 통계 */}
          {selectedReport.stats && (
            <div className="p-6 border-b border-border">
              <h2 className="text-sm font-semibold mb-4">2. 주요 통계</h2>
              <div className="grid grid-cols-4 gap-px bg-border ml-4">
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">총 사고 건수</p>
                  <p className="text-xl font-semibold">{selectedReport.stats.totalAccidents}건</p>
                </div>
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">처리 완료</p>
                  <p className="text-xl font-semibold">{selectedReport.stats.resolved}건</p>
                </div>
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">처리 중</p>
                  <p className="text-xl font-semibold">{selectedReport.stats.pending}건</p>
                </div>
                <div className="bg-background p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">전기 대비 증감</p>
                  <p className="text-xl font-semibold">
                    {selectedReport.stats.changeRate > 0 ? '+' : ''}{selectedReport.stats.changeRate}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. 유형별 현황 */}
          {selectedReport.details && (
            <div className="p-6 border-b border-border">
              <h2 className="text-sm font-semibold mb-4">3. 유형별 사고 현황</h2>
              <table className="w-full ml-4 text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/30">
                    <th className="text-left p-3 font-medium">사고 유형</th>
                    <th className="text-right p-3 font-medium w-24">발생 건수</th>
                    <th className="text-right p-3 font-medium w-24">추세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedReport.details.map((detail, idx) => (
                    <tr key={idx}>
                      <td className="p-3">{detail.category}</td>
                      <td className="p-3 text-right">{detail.count}건</td>
                      <td className="p-3 text-right text-muted-foreground">
                        {detail.trend === 'up' ? '증가' : detail.trend === 'down' ? '감소' : '유지'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. 권고사항 */}
          {selectedReport.recommendations && (
            <div className="p-6">
              <h2 className="text-sm font-semibold mb-3">4. 권고사항</h2>
              <ul className="space-y-2 pl-4">
                {selectedReport.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                    <span>{String.fromCharCode(97 + idx)}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input 
          placeholder="보고서 검색..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-sm bg-transparent border border-border rounded px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
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

      {/* Reports Table */}
      <div>
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_180px_100px_100px_50px] gap-4 py-3 text-xs text-muted-foreground border-y border-border">
          <div>유형</div>
          <div>제목</div>
          <div>기간</div>
          <div>부대</div>
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
                  onClick={(e) => handleDownload(report, e)}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
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
