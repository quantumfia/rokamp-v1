import { useState, useEffect } from 'react';
import { MapView } from '@/components/dashboard/MapView';
import { RiskSummaryPanel } from '@/components/dashboard/RiskSummaryPanel';
import { UnitDetailPanel } from '@/components/dashboard/UnitDetailPanel';
import { TickerBar } from '@/components/dashboard/TickerBar';
import { StatusHeader } from '@/components/dashboard/StatusHeader';
import { TrendCharts } from '@/components/dashboard/TrendCharts';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchContext } from '@/components/layout/MainLayout';
import { X, List, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  RiskSummarySkeleton,
  UnitDetailSkeleton,
  TrendChartsSkeleton,
  StatusHeaderSkeleton,
  TickerBarSkeleton,
  MapSkeleton,
} from '@/components/skeletons';

export default function DashboardPage() {
  const { user } = useAuth();
  const searchContext = useSearchContext();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 반응형 패널 상태
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showCharts, setShowCharts] = useState(false); // 기본값 접힌 상태

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

  const showTicker = true;

  const handleMarkerClick = (unitId: string) => {
    setSelectedUnitId(unitId);
    setShowLeftPanel(false); // 모바일에서 부대 선택 시 좌측 패널 닫기
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Status Bar */}
      <div className="shrink-0 border-b border-border bg-card/50">
        {isLoading ? <StatusHeaderSkeleton /> : <StatusHeader />}
      </div>

      {/* Ticker Bar */}
      {showTicker && (
        <div className="shrink-0 border-b border-border">
          {isLoading ? <TickerBarSkeleton /> : <TickerBar />}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Risk Summary (Desktop: always visible, Mobile: overlay) */}
        <div
          className={cn(
            'shrink-0 border-r border-border bg-card overflow-hidden transition-all duration-300',
            // Desktop: 고정 너비
            'hidden lg:block lg:w-72',
          )}
        >
          {isLoading ? <RiskSummarySkeleton /> : <RiskSummaryPanel onUnitClick={handleMarkerClick} />}
        </div>

        {/* Mobile Left Panel Overlay */}
        {showLeftPanel && (
          <div className="lg:hidden absolute inset-0 z-30 flex">
            <div className="w-72 max-w-[85vw] bg-card border-r border-border overflow-hidden animate-slide-in-left">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-foreground">부대 목록</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowLeftPanel(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-[calc(100%-41px)] overflow-hidden">
                <RiskSummaryPanel onUnitClick={handleMarkerClick} />
              </div>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setShowLeftPanel(false)} />
          </div>
        )}

        {/* Center - Map (expands when right panel is hidden) */}
        <div className="flex-1 relative bg-map-bg">
          {isLoading ? (
            <MapSkeleton />
          ) : (
            <MapView
              className="absolute inset-0"
              onMarkerClick={handleMarkerClick}
              selectedUnitId={selectedUnitId}
            />
          )}

          {/* Map overlay header - Mobile only */}
          <div className="absolute top-3 left-3 lg:hidden pointer-events-none z-10">
            <Button
              variant="secondary"
              size="sm"
              className="pointer-events-auto h-8 bg-panel-dark/90 backdrop-blur-sm border border-sidebar-border text-white hover:bg-panel-dark"
              onClick={() => setShowLeftPanel(true)}
            >
              <List className="w-4 h-4 mr-1.5" />
              부대 목록
            </Button>
          </div>
        </div>

        {/* Right Panel - Unit Detail (선택 시에만 표시) */}
        {selectedUnitId && (
          <div
            className={cn(
              'shrink-0 border-l border-border bg-card overflow-hidden transition-all duration-300',
              // Desktop: 고정 너비
              'hidden xl:block xl:w-80',
            )}
          >
            {isLoading ? (
              <UnitDetailSkeleton />
            ) : (
              <UnitDetailPanel unitId={selectedUnitId} onClose={() => setSelectedUnitId(null)} />
            )}
          </div>
        )}

        {/* Mobile/Tablet Right Panel Overlay */}
        {selectedUnitId && (
          <div className="xl:hidden absolute inset-0 z-30 flex justify-end">
            <div className="flex-1 bg-black/50" onClick={() => setSelectedUnitId(null)} />
            <div className="w-80 max-w-[90vw] bg-card border-l border-border overflow-hidden animate-slide-in-right">
              <UnitDetailPanel unitId={selectedUnitId} onClose={() => setSelectedUnitId(null)} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom - Trend Charts (collapsible) */}
      <div className="shrink-0 border-t border-border bg-card">
        {/* Toggle button */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:bg-muted/30 transition-colors border-b border-border"
          onClick={() => setShowCharts(!showCharts)}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>예측 트렌드 분석</span>
          {showCharts ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
        <div className={cn(
          'transition-all duration-300 overflow-hidden',
          showCharts ? 'max-h-[200px]' : 'max-h-0'
        )}>
          {isLoading ? <TrendChartsSkeleton /> : <TrendCharts />}
        </div>
      </div>
    </div>
  );
}