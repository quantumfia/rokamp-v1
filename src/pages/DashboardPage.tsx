import { useState, useEffect } from 'react';
import { IncidentTicker } from '@/components/dashboard/IncidentTicker';
import { StatusHeader } from '@/components/dashboard/StatusHeader';
import { RiskLevelPanel } from '@/components/dashboard/RiskLevelGauge';
import { UnitFilterPanel, FilterState } from '@/components/dashboard/UnitFilterPanel';
import { UnitListCompact } from '@/components/dashboard/UnitListCompact';
import { UnitDetailPanelHorizontal } from '@/components/dashboard/UnitDetailPanelHorizontal';
import { TrendAnalysisPanel } from '@/components/dashboard/TrendAnalysisPanel';
import { DashboardNoticeList } from '@/components/dashboard/DashboardNoticeList';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchContext } from '@/components/layout/MainLayout';
import { X, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  RiskSummarySkeleton,
  TrendChartsSkeleton,
  StatusHeaderSkeleton,
  TickerBarSkeleton,
} from '@/components/skeletons';

export default function DashboardPage() {
  const { user } = useAuth();
  const searchContext = useSearchContext();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    selectedUnit: '',
    riskLevels: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // 반응형 패널 상태
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  // 초기 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // GNB 검색에서 부대 선택 시 처리
  useEffect(() => {
    if (searchContext?.selectedUnitFromSearch) {
      setSelectedUnitId(searchContext.selectedUnitFromSearch);
      searchContext.setSelectedUnitFromSearch(null);
    }
  }, [searchContext?.selectedUnitFromSearch]);

  const handleUnitClick = (unitId: string) => {
    setSelectedUnitId(unitId);
    setShowLeftPanel(false);
  };

  const handleCloseDetail = () => {
    setSelectedUnitId(null);
  };

  const handleIncidentDetail = () => {
    console.log('사고 상세 보기');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Status Bar - 3개 섹션: 날짜/시간/날씨 + 사고사례 + 위험도 */}
      <div className="shrink-0 border-b border-border bg-card/50">
        <div className="flex items-stretch divide-x divide-border">
          {/* 섹션 1: 날짜/시간/날씨 */}
          <div className="shrink-0">
            {isLoading ? <StatusHeaderSkeleton /> : <StatusHeader />}
          </div>
          
          {/* 섹션 2: 사고사례 실시간 카드 */}
          <div className="flex-1 min-w-0">
            {isLoading ? <TickerBarSkeleton /> : <IncidentTicker onClickDetail={handleIncidentDetail} />}
          </div>
          
          {/* 섹션 3: 위험도 게이지 */}
          <div className="shrink-0 hidden md:flex items-center">
            <RiskLevelPanel />
          </div>
        </div>
      </div>

      {/* Main Content - 좌측 부대 리스트 + 우측 (상단 트렌드/상세 + 하단 공지) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - 필터 (오버레이) */}
        {showLeftPanel && (
          <div className="absolute inset-0 z-30 flex">
            <div className="w-64 max-w-[85vw] bg-card border-r border-border overflow-hidden animate-slide-in-left">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">필터</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowLeftPanel(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-41px)] overflow-hidden">
                {isLoading ? <RiskSummarySkeleton /> : <UnitFilterPanel onFilterChange={setFilters} />}
              </div>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setShowLeftPanel(false)} />
          </div>
        )}

        {/* Left Section - 부대 리스트 (전체의 50%) */}
        <div className="w-1/2 flex flex-col border-r border-border bg-background overflow-hidden">
          {/* 필터 버튼 + 검색창 툴바 */}
          <div className="flex items-center gap-2 p-2 border-b border-border bg-card/50">
            <Button
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              onClick={() => setShowLeftPanel(true)}
            >
              <Filter className="w-4 h-4 mr-1.5" />
              필터
            </Button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="부대 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          {/* 부대 리스트 */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <UnitListCompact
                onUnitClick={handleUnitClick}
                selectedUnitId={selectedUnitId}
                filters={filters}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </div>

        {/* Right Section - 트렌드/상세 + 공지사항 (전체의 50%) */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {/* 상단 - 트렌드 분석 또는 부대 상세 */}
          <div className="h-1/2 border-b border-border overflow-hidden">
            {isLoading ? (
              <TrendChartsSkeleton />
            ) : selectedUnitId ? (
              <UnitDetailPanelHorizontal 
                unitId={selectedUnitId} 
                onClose={handleCloseDetail}
                showBackButton
              />
            ) : (
              <TrendAnalysisPanel />
            )}
          </div>

          {/* 하단 - 공지사항 리스트 */}
          <div className="h-1/2 overflow-hidden">
            <DashboardNoticeList />
          </div>
        </div>
      </div>
    </div>
  );
}
