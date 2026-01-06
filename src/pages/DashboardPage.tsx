import { useState, useEffect } from 'react';
import { IncidentTicker } from '@/components/dashboard/IncidentTicker';
import { StatusHeader } from '@/components/dashboard/StatusHeader';
import { UnitFilterPanel, FilterState } from '@/components/dashboard/UnitFilterPanel';
import { UnitListCompact } from '@/components/dashboard/UnitListCompact';
import { UnitDetailPanelHorizontal } from '@/components/dashboard/UnitDetailPanelHorizontal';
import { TrendAnalysisPanel } from '@/components/dashboard/TrendAnalysisPanel';
import { DashboardNoticeList } from '@/components/dashboard/DashboardNoticeList';
import { RiskLevelPanel } from '@/components/dashboard/RiskLevelGauge';
import { useSearchContext } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { X, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  RiskSummarySkeleton,
  TrendChartsSkeleton,
  StatusHeaderSkeleton,
  TickerBarSkeleton,
} from '@/components/skeletons';

export default function DashboardPage() {
  const searchContext = useSearchContext();
  const { user } = useAuth();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    selectedUnit: '',
    riskLevels: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // 반응형 패널 상태
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  // 대대급(BN)은 자동으로 자기 부대 상세 표시
  const isBattalionRole = user?.role === 'ROLE_BN';

  // 초기 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // BN 역할일 때 자동으로 자기 부대 선택
  useEffect(() => {
    if (isBattalionRole && user?.unitId && !selectedUnitId) {
      setSelectedUnitId(user.unitId);
    }
  }, [isBattalionRole, user?.unitId, selectedUnitId]);

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
    // BN 역할은 상세 닫기 불가 (항상 자기 부대 표시)
    if (!isBattalionRole) {
      setSelectedUnitId(null);
    }
  };

  const handleIncidentDetail = () => {
    console.log('사고 상세 보기');
  };

  return (
    <div className="h-full flex flex-col bg-muted/30 overflow-auto lg:overflow-hidden">
      {/* Top Status Bar - 3개 섹션: 날짜/시간/날씨 + 사고사례 + 사용자 정보 */}
      <div className="shrink-0 m-3 mb-0 rounded-lg border border-border bg-card">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:divide-x divide-border">
          {/* 섹션 1: 날짜/시간/날씨 */}
          <div className="shrink-0">
            {isLoading ? <StatusHeaderSkeleton /> : <StatusHeader />}
          </div>
          
          {/* 섹션 2: 사고사례 실시간 카드 */}
          <div className="flex-1 min-w-0 border-t lg:border-t-0 border-border">
            {isLoading ? <TickerBarSkeleton /> : <IncidentTicker onClickDetail={handleIncidentDetail} />}
          </div>
          
          {/* 섹션 3: 위험도 게이지 */}
          <div className="shrink-0 hidden lg:block">
            <RiskLevelPanel />
          </div>
        </div>
      </div>

      {/* Main Content - 좌측 (트렌드 + 공지) + 우측 부대 리스트/상세 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 gap-3 min-h-0">
        {/* Left Section - 트렌드 + 공지사항 (60%) */}
        <div className="lg:w-[60%] flex flex-col gap-3 overflow-hidden min-h-[400px] lg:min-h-0">
          {/* 상단 - 트렌드 분석 */}
          <div className="flex-1 lg:h-1/2 min-h-[200px] rounded-lg border border-border bg-card overflow-hidden">
            {isLoading ? <TrendChartsSkeleton /> : <TrendAnalysisPanel />}
          </div>

          {/* 하단 - 공지사항 리스트 */}
          <div className="flex-1 lg:h-1/2 min-h-[200px] rounded-lg border border-border bg-card overflow-hidden">
            <DashboardNoticeList />
          </div>
        </div>

        {/* Right Section - 부대 리스트 또는 상세 (40%) */}
        <div className="lg:w-[40%] flex flex-col rounded-lg border border-border bg-card overflow-hidden relative min-h-[300px] lg:min-h-0">
          {selectedUnitId ? (
            /* 부대 상세 패널 */
            <UnitDetailPanelHorizontal 
              unitId={selectedUnitId} 
              onClose={handleCloseDetail}
              showBackButton={!isBattalionRole} // BN은 뒤로가기 버튼 숨김
            />
          ) : (
            <>
              {/* 필터 버튼 + 검색창 툴바 */}
              <div className="flex items-center gap-2 p-3 bg-card">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={() => setShowLeftPanel(!showLeftPanel)}
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
            </>
          )}

          {/* 필터 패널 오버레이 (우측에서 열림) */}
          {showLeftPanel && !selectedUnitId && (
            <>
              {/* 어두운 배경 오버레이 */}
              <div 
                className="absolute inset-0 bg-black/40 z-10"
                onClick={() => setShowLeftPanel(false)}
              />
              {/* 필터 패널 */}
              <div className="absolute top-0 right-0 h-full w-64 bg-card border-l border-border z-20 animate-in slide-in-from-right duration-200 flex flex-col shadow-xl">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                  <span className="text-xs font-medium text-foreground">필터</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowLeftPanel(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  {isLoading ? <RiskSummarySkeleton /> : <UnitFilterPanel onFilterChange={setFilters} />}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
