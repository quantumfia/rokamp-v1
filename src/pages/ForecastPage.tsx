import { useState, useEffect } from 'react';
import { ForecastSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { useAuth } from '@/contexts/AuthContext';
import { getSelectableUnitsForRole } from '@/lib/rbac';
import { UnitPopoverSelect } from '@/components/unit/UnitPopoverSelect';
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
    if (!user) return;

    const { units, isFixed } = getSelectableUnitsForRole(user.role, user.unitId);

    if (isFixed && units.length === 1) {
      setSelectedUnit(units[0].id);
      return;
    }

    if (user.role === 'ROLE_HQ') {
      setSelectedUnit('all');
      return;
    }

    // DIV 기본값: 본인 부대
    setSelectedUnit(user.unitId);
  }, [user]);

  if (isLoading) {
    return <ForecastSkeleton />;
  }

  const { isFixed } = getSelectableUnitsForRole(user?.role, user?.unitId);

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="예보 분석" 
        description="사고 현황과 위험요소를 시각화하여 부대별·유형별 위험징후를 분석합니다." 
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <TabNavigation tabs={FORECAST_TABS} activeTab={activeTab} onChange={setActiveTab} />

        {isFixed ? (
          <div className="flex-shrink-0 w-[320px]">
            <div className="text-sm font-medium px-3 py-2 bg-muted/50 rounded-md border border-border">
              {user?.unit || '소속 부대'}
            </div>
          </div>
        ) : (
          <UnitPopoverSelect value={selectedUnit || 'all'} onChange={setSelectedUnit} />
        )}
      </div>

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

