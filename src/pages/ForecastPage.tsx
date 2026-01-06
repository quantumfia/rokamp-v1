import { useState, useEffect } from 'react';
import { ForecastSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { useAuth } from '@/contexts/AuthContext';
import { getSelectableUnitsForRole } from '@/lib/rbac';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import WeeklyForecastTab from '@/components/forecast/WeeklyForecastTab';
import TrendAnalysisTab from '@/components/forecast/TrendAnalysisTab';

const FORECAST_TABS = [
  { id: 'weekly', label: '주간 예보' },
  { id: 'trends', label: '경향 분석' },
];

export default function ForecastPage() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const isLoading = usePageLoading(1000);
  const { user } = useAuth();

  // 역할 기반 초기 부대 설정
  useEffect(() => {
    if (user) {
      const { units, isFixed } = getSelectableUnitsForRole(user.role, user.unitId);
      if (isFixed && units.length === 1) {
        setSelectedUnit(units[0].id);
      } else if (user.role === 'ROLE_HQ') {
        setSelectedUnit('all');
      }
    }
  }, [user]);

  if (isLoading) {
    return <ForecastSkeleton />;
  }

  const { isFixed } = getSelectableUnitsForRole(user?.role, user?.unitId);

  const handleUnitChange = (unitId: string) => {
    setSelectedUnit(unitId || 'all');
  };

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <div className="flex items-start justify-between gap-6">
        <PageHeader 
          title="예보 분석" 
          description="부대별 위험도 예보 및 사고 경향 분석" 
        />

        {/* 부대 선택 필터 - 캐스케이드 방식 */}
        <div className="flex-shrink-0 w-[320px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">분석 대상 부대</span>
          </div>
          {isFixed ? (
            <div className="text-sm font-medium px-3 py-2 bg-muted/50 rounded-md border border-border">
              {user?.unit || '소속 부대'}
            </div>
          ) : (
            <UnitCascadeSelect
              value={selectedUnit === 'all' ? '' : selectedUnit}
              onChange={handleUnitChange}
              placeholder="전체 부대 (전군)"
              showFullPath={false}
              showSubLevels={true}
            />
          )}
        </div>
      </div>

      <TabNavigation tabs={FORECAST_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* 주간 예보 탭 */}
      {activeTab === 'weekly' && <WeeklyForecastTab selectedUnit={selectedUnit} />}

      {/* 경향 분석 탭 */}
      {activeTab === 'trends' && <TrendAnalysisTab selectedUnit={selectedUnit} />}

      {/* 데이터 출처 명시 */}
      <div className="text-center py-3 bg-muted/30 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground">
          ※ 본 데이터는 최근 10년간 사고 데이터를 기반으로 분석한 결과입니다.
        </p>
      </div>
    </div>
  );
}
