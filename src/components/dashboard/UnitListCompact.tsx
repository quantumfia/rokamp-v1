import { useState, useMemo } from 'react';
import { Info, ArrowUpAZ, ArrowDownAZ, ArrowUp01, ArrowDown10 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { 
  ARMY_UNITS, 
  UNIT_LOCATIONS, 
  getUnitFullName, 
  getUnitById, 
  getAllDescendants 
} from '@/data/armyUnits';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleUnitIds } from '@/lib/rbac';
import type { FilterState } from './UnitFilterPanel';
import { getRiskGradeFromScore, RISK_GRADE_BG_COLORS, RISK_GRADE_COLORS } from '@/types/entities';

interface UnitListCompactProps {
  onUnitClick?: (unitId: string) => void;
  selectedUnitId?: string | null;
  filters?: FilterState;
  searchQuery?: string;
}

type SortField = 'name' | 'risk';
type SortDirection = 'asc' | 'desc';

// 역할 기반 필터링된 부대 목록 반환
const getDisplayUnits = (accessibleIds: Set<string>) => {
  return ARMY_UNITS
    .filter((unit) => accessibleIds.has(unit.id))
    .map((unit) => {
      const location = UNIT_LOCATIONS[unit.id];
      const baseRisk = location?.risk ?? Math.floor(Math.random() * 60) + 10;
      
      return {
        id: unit.id,
        name: unit.name,
        fullPath: getUnitFullName(unit.id),
        risk: baseRisk,
      };
    });
};

export function UnitListCompact({ 
  onUnitClick, 
  selectedUnitId, 
  filters,
  searchQuery = ''
}: UnitListCompactProps) {
  const { user } = useAuth();
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 역할 기반 접근 가능한 부대 ID
  const accessibleIds = useMemo(() => {
    const ids = getAccessibleUnitIds(user?.role, user?.unitId);
    return new Set(ids);
  }, [user?.role, user?.unitId]);

  const allUnits = useMemo(() => getDisplayUnits(accessibleIds), [accessibleIds]);

  // 필터 및 검색 적용
  const filteredUnits = useMemo(() => {
    return allUnits.filter((unit) => {
      // 검색 필터
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!unit.name.toLowerCase().includes(searchLower) && 
            !unit.fullPath.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (!filters) return true;

      // 부대 선택 필터
      if (filters.selectedUnit && filters.selectedUnit !== 'all') {
        const selectedUnitData = getUnitById(filters.selectedUnit);
        if (selectedUnitData) {
          const descendantIds = getAllDescendants(filters.selectedUnit).map(u => u.id);
          if (unit.id !== filters.selectedUnit && !descendantIds.includes(unit.id)) {
            return false;
          }
        }
      }

      // 위험도 필터
      if (filters.riskLevels.length > 0) {
        const grade = getRiskGradeFromScore(unit.risk);
        if (!filters.riskLevels.includes(grade)) {
          return false;
        }
      }

      return true;
    });
  }, [allUnits, searchQuery, filters]);

  // 정렬
  const sortedUnits = useMemo(() => {
    return [...filteredUnits].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ko');
          break;
        case 'risk':
          comparison = a.risk - b.risk;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredUnits, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const NameSortIcon = () => {
    if (sortField !== 'name') return <ArrowUpAZ className="w-3.5 h-3.5 opacity-40" />;
    return sortDirection === 'asc' ? (
      <ArrowUpAZ className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDownAZ className="w-3.5 h-3.5 text-primary" />
    );
  };

  const RiskSortIcon = () => {
    if (sortField !== 'risk') return <ArrowDown10 className="w-3.5 h-3.5 opacity-40" />;
    return sortDirection === 'desc' ? (
      <ArrowDown10 className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowUp01 className="w-3.5 h-3.5 text-primary" />
    );
  };

  const getRiskStyle = (risk: number) => {
    const grade = getRiskGradeFromScore(risk);
    return { bg: RISK_GRADE_BG_COLORS[grade], text: RISK_GRADE_COLORS[grade] };
  };

  return (
    <div className="h-full flex flex-col">

      {/* 테이블 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground">
        <button
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
            sortField === 'name' ? "text-foreground bg-muted" : "hover:text-foreground hover:bg-muted/50"
          )}
          onClick={() => handleSort('name')}
          title={sortField === 'name' && sortDirection === 'asc' ? '가→하 정렬' : '하→가 정렬'}
        >
          가나다 <NameSortIcon />
        </button>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
            sortField === 'risk' ? "text-foreground bg-muted" : "hover:text-foreground hover:bg-muted/50"
          )}
          onClick={() => handleSort('risk')}
          title={sortField === 'risk' && sortDirection === 'desc' ? '높은순 정렬' : '낮은순 정렬'}
        >
          위험도 <RiskSortIcon />
        </button>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto px-4">
        {sortedUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">검색 결과가 없습니다</span>
          </div>
        ) : (
          sortedUnits.map((unit, index) => {
            const riskStyle = getRiskStyle(unit.risk);
            return (
              <button
                key={unit.id}
                onClick={() => onUnitClick?.(unit.id)}
                className={cn(
                  'w-full flex items-center justify-between py-3 hover:bg-muted/50 transition-colors text-left rounded-lg px-2 -mx-2',
                  selectedUnitId === unit.id && 'bg-primary/5 ring-1 ring-primary/20',
                  index < sortedUnits.length - 1 && 'border-b border-border/30'
                )}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-medium text-base text-foreground truncate">{unit.name}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{unit.fullPath}</div>
                </div>
                <div className={cn(
                  'shrink-0 w-14 h-8 flex items-center justify-center rounded text-sm font-bold',
                  riskStyle.bg, riskStyle.text
                )}>
                  {unit.risk}%
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 푸터 */}
      <div className="px-4 py-3 text-sm text-muted-foreground">
        총 <span className="font-medium text-foreground">{sortedUnits.length}</span>개 부대
        {user?.role !== 'ROLE_HQ' && (
          <span className="ml-1">(접근 가능)</span>
        )}
      </div>
    </div>
  );
}
