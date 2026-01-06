import { useState, useMemo } from 'react';
import { Info, ChevronUp, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { 
  ARMY_UNITS, 
  UNIT_LOCATIONS, 
  getUnitFullName, 
  getUnitById, 
  getAllDescendants 
} from '@/data/armyUnits';
import type { FilterState } from './UnitFilterPanel';

interface UnitListCompactProps {
  onUnitClick?: (unitId: string) => void;
  selectedUnitId?: string | null;
  filters?: FilterState;
  searchQuery?: string;
}

type SortField = 'name' | 'risk';
type SortDirection = 'asc' | 'desc';

// 모든 부대 (CATEGORY 제외)
const getDisplayUnits = () => {
  return ARMY_UNITS
    .filter((unit) => unit.level !== 'CATEGORY')
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
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const allUnits = useMemo(() => getDisplayUnits(), []);

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
        const riskMatch = filters.riskLevels.some((level) => {
          if (level === 'high') return unit.risk >= 60;
          if (level === 'medium') return unit.risk >= 30 && unit.risk < 60;
          if (level === 'low') return unit.risk < 30;
          return false;
        });
        if (!riskMatch) return false;
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getRiskStyle = (risk: number) => {
    if (risk >= 60) return { bg: 'bg-status-error', text: 'text-white' };
    if (risk >= 30) return { bg: 'bg-status-warning', text: 'text-black' };
    return { bg: 'bg-status-success', text: 'text-white' };
  };

  return (
    <div className="h-full flex flex-col">

      {/* 테이블 헤더 */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => handleSort('name')}
        >
          부대 <SortIcon field="name" />
        </button>
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => handleSort('risk')}
        >
          위험도 <SortIcon field="risk" />
        </button>
      </div>

      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {sortedUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">검색 결과가 없습니다</span>
          </div>
        ) : (
          sortedUnits.map((unit) => {
            const riskStyle = getRiskStyle(unit.risk);
            return (
              <button
                key={unit.id}
                onClick={() => onUnitClick?.(unit.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors text-left',
                  selectedUnitId === unit.id && 'bg-primary/5 border-l-2 border-l-primary'
                )}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="font-medium text-sm text-foreground truncate">{unit.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">{unit.fullPath}</div>
                </div>
                <div className={cn(
                  'shrink-0 w-12 h-7 flex items-center justify-center rounded text-xs font-bold',
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
      <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        총 <span className="font-medium text-foreground">{sortedUnits.length}</span>개 부대
      </div>
    </div>
  );
}
