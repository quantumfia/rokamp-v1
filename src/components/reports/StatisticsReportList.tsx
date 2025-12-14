import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StatReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  period: string;
  generatedAt: string;
  unit: string;
}

const MOCK_STAT_REPORTS: StatReport[] = [
  { id: '1', title: '2024년 12월 2주차 사고 위험도 분석', type: 'weekly', period: '2024.12.08 ~ 2024.12.14', generatedAt: '2024-12-14', unit: '제1사단' },
  { id: '2', title: '2024년 12월 1주차 사고 위험도 분석', type: 'weekly', period: '2024.12.01 ~ 2024.12.07', generatedAt: '2024-12-07', unit: '제1사단' },
  { id: '3', title: '2024년 11월 월간 안전 통계', type: 'monthly', period: '2024.11.01 ~ 2024.11.30', generatedAt: '2024-12-01', unit: '제1사단' },
  { id: '4', title: '2024년 11월 4주차 사고 위험도 분석', type: 'weekly', period: '2024.11.24 ~ 2024.11.30', generatedAt: '2024-11-30', unit: '제1사단' },
  { id: '5', title: '2024년 11월 3주차 사고 위험도 분석', type: 'weekly', period: '2024.11.17 ~ 2024.11.23', generatedAt: '2024-11-23', unit: '제1사단' },
  { id: '6', title: '2024년 10월 월간 안전 통계', type: 'monthly', period: '2024.10.01 ~ 2024.10.31', generatedAt: '2024-11-01', unit: '제1사단' },
];

export function StatisticsReportList() {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = MOCK_STAT_REPORTS.filter((report) => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDownload = (report: StatReport) => {
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
          className="w-40 bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
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
                  onClick={() => handleDownload(report)}
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
