import { useState, useEffect } from 'react';
import { IncidentTicker } from '@/components/dashboard/IncidentTicker';
import { StatusHeader } from '@/components/dashboard/StatusHeader';
import { RiskLevelPanel } from '@/components/dashboard/RiskLevelGauge';
import { UnitFilterPanel, FilterState } from '@/components/dashboard/UnitFilterPanel';
import { UnitListTable } from '@/components/dashboard/UnitListTable';
import { UnitDetailPanel } from '@/components/dashboard/UnitDetailPanel';
import { TrendChartsVertical } from '@/components/dashboard/TrendChartsVertical';
import { NoticeListPanel } from '@/components/dashboard/NoticeListPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchContext } from '@/components/layout/MainLayout';
import { X, Filter, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  RiskSummarySkeleton,
  UnitDetailSkeleton,
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
  
  // 반응형 패널 상태
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

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
    // TODO: 사고 상세 페이지로 이동
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

      {/* Main Content - 3단 구조 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - 필터 (Desktop: always visible, Mobile: overlay) */}
        <div
          className={cn(
            'shrink-0 border-r border-border bg-card overflow-hidden transition-all duration-300',
            'hidden lg:block lg:w-64',
          )}
        >
          {isLoading ? <RiskSummarySkeleton /> : <UnitFilterPanel onFilterChange={setFilters} />}
        </div>

        {/* Mobile Left Panel Overlay */}
        {showLeftPanel && (
          <div className="lg:hidden absolute inset-0 z-30 flex">
            <div className="w-64 max-w-[85vw] bg-card border-r border-border overflow-hidden animate-slide-in-left">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">필터</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowLeftPanel(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-41px)] overflow-hidden">
                <UnitFilterPanel onFilterChange={setFilters} />
              </div>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setShowLeftPanel(false)} />
          </div>
        )}

        {/* Center - 부대 목록 테이블 */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          {/* 모바일 툴바 */}
          <div className="lg:hidden flex items-center gap-2 p-2 border-b border-border bg-card/50">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setShowLeftPanel(true)}
            >
              <Filter className="w-4 h-4 mr-1.5" />
              필터
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 xl:hidden"
              onClick={() => setShowRightPanel(true)}
            >
              <BarChart3 className="w-4 h-4 mr-1.5" />
              트렌드
            </Button>
          </div>

          {/* 테이블 */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <UnitListTable
                onUnitClick={handleUnitClick}
                selectedUnitId={selectedUnitId}
                filters={filters}
              />
            )}
          </div>
        </div>

        {/* Right Panel - 트렌드 차트 또는 부대 상세 (Desktop) */}
        <div
          className={cn(
            'shrink-0 border-l border-border bg-card overflow-hidden transition-all duration-300',
            'hidden xl:block xl:w-72',
          )}
        >
          {isLoading ? (
            <TrendChartsSkeleton />
          ) : selectedUnitId ? (
            <UnitDetailPanel 
              unitId={selectedUnitId} 
              onClose={handleCloseDetail}
              showBackButton
            />
          ) : (
            <TrendChartsVertical />
          )}
        </div>

        {/* Right Panel 2 - 공지사항 (Desktop) */}
        <div
          className={cn(
            'shrink-0 border-l border-border bg-card overflow-hidden transition-all duration-300',
            'hidden 2xl:block 2xl:w-[374px]',
          )}
        >
          <NoticeListPanel />
        </div>

        {/* Mobile/Tablet Right Panel Overlay - 부대 상세 */}
        {selectedUnitId && (
          <div className="xl:hidden absolute inset-0 z-30 flex justify-end">
            <div className="flex-1 bg-black/50" onClick={handleCloseDetail} />
            <div className="w-80 max-w-[90vw] bg-card border-l border-border overflow-hidden animate-slide-in-right">
              <UnitDetailPanel 
                unitId={selectedUnitId} 
                onClose={handleCloseDetail}
                showBackButton
              />
            </div>
          </div>
        )}

        {/* Mobile/Tablet Right Panel Overlay - 트렌드 차트 */}
        {showRightPanel && !selectedUnitId && (
          <div className="xl:hidden absolute inset-0 z-30 flex justify-end">
            <div className="flex-1 bg-black/50" onClick={() => setShowRightPanel(false)} />
            <div className="w-80 max-w-[90vw] bg-card border-l border-border overflow-hidden animate-slide-in-right">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">트렌드 분석</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowRightPanel(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-41px)] overflow-hidden">
                <TrendChartsVertical />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
