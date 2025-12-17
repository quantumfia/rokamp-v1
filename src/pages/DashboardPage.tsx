import { useState, useEffect } from 'react';

import { MapView } from '@/components/dashboard/MapView';
import { RiskSummaryPanel } from '@/components/dashboard/RiskSummaryPanel';
import { UnitDetailPanel } from '@/components/dashboard/UnitDetailPanel';
import { TickerBar } from '@/components/dashboard/TickerBar';
import { StatusHeader } from '@/components/dashboard/StatusHeader';
import { TrendCharts } from '@/components/dashboard/TrendCharts';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchContext } from '@/components/layout/MainLayout';
import { MapPin } from 'lucide-react';
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

  // 초기 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // GNB 검색에서 부대 선택 시 처리
  useEffect(() => {
    if (searchContext?.selectedUnitFromSearch) {
      setSelectedUnitId(searchContext.selectedUnitFromSearch);
      // 처리 후 context 초기화
      searchContext.setSelectedUnitFromSearch(null);
    }
  }, [searchContext?.selectedUnitFromSearch]);

  const showTicker = true; // 모든 역할에서 실시간 경고 표시

  const handleMarkerClick = (unitId: string) => {
    setSelectedUnitId(unitId);
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Risk Summary */}
        <div className="w-72 shrink-0 border-r border-border bg-card overflow-hidden">
          {isLoading ? <RiskSummarySkeleton /> : <RiskSummaryPanel onUnitClick={handleMarkerClick} />}
        </div>

        {/* Center - Map */}
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
          
          {/* Map overlay header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="bg-panel-dark/90 backdrop-blur-sm rounded px-3 py-1.5 border border-sidebar-border pointer-events-auto">
              <span className="text-xs font-medium text-white">
                대한민국 전도 · 전군 위험도
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel - Unit Detail */}
        <div className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto">
          {isLoading ? (
            <UnitDetailSkeleton />
          ) : selectedUnitId ? (
            <UnitDetailPanel
              unitId={selectedUnitId}
              onClose={() => setSelectedUnitId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                지도에서 부대 마커를 클릭하면<br />상세 정보가 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom - Trend Charts */}
      <div className="shrink-0 border-t border-border bg-card">
        {isLoading ? <TrendChartsSkeleton /> : <TrendCharts />}
      </div>
    </div>
  );
}