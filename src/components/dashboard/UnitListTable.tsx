import { useState } from 'react';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ARMY_UNITS, UNIT_LOCATIONS, UNIT_TYPE_LABELS, getUnitFullName, getUnitById } from '@/data/armyUnits';
import type { FilterState } from './UnitFilterPanel';

interface UnitListTableProps {
  onUnitClick?: (unitId: string) => void;
  selectedUnitId?: string | null;
  filters?: FilterState;
}

type SortField = 'name' | 'type' | 'region' | 'risk';
type SortDirection = 'asc' | 'desc';

// 지도에 표시되던 부대들 (위치 정보가 있는 부대)
const getDisplayUnits = () => {
  return ARMY_UNITS.filter((unit) => {
    const location = UNIT_LOCATIONS[unit.id];
    return location?.lat && location?.lng;
  }).map((unit) => {
    const location = UNIT_LOCATIONS[unit.id];
    return {
      id: unit.id,
      name: unit.name,
      fullName: getUnitFullName(unit.id),
      level: unit.level,
      type: location?.unitType || 'infantry',
      typeLabel: UNIT_TYPE_LABELS[location?.unitType || 'infantry'],
      region: location?.region || '-',
      risk: location?.risk || 0,
    };
  });
};

export function UnitListTable({ onUnitClick, selectedUnitId, filters }: UnitListTableProps) {
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const allUnits = getDisplayUnits();

  // 필터 적용
  const filteredUnits = allUnits.filter((unit) => {
    if (!filters) return true;

    // 부대 선택 필터
    if (filters.selectedUnit && filters.selectedUnit !== 'all') {
      // 선택된 부대 또는 그 하위 부대인지 확인
      const unitPath = unit.fullName;
      const selectedUnitData = getUnitById(filters.selectedUnit);
      if (selectedUnitData && !unitPath.includes(selectedUnitData.name)) {
        return false;
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

  // 정렬
  const sortedUnits = [...filteredUnits].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'ko');
        break;
      case 'type':
        comparison = a.typeLabel.localeCompare(b.typeLabel, 'ko');
        break;
      case 'region':
        comparison = a.region.localeCompare(b.region, 'ko');
        break;
      case 'risk':
        comparison = a.risk - b.risk;
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

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
    if (risk >= 60) return 'bg-status-error/10 text-status-error border-status-error/30';
    if (risk >= 30) return 'bg-status-warning/10 text-status-warning border-status-warning/30';
    return 'bg-status-success/10 text-status-success border-status-success/30';
  };

  return (
    <div className="h-full flex flex-col">
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[1fr_100px_80px_80px] gap-2 px-4 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
          onClick={() => handleSort('name')}
        >
          부대명 <SortIcon field="name" />
        </button>
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => handleSort('type')}
        >
          유형 <SortIcon field="type" />
        </button>
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={() => handleSort('region')}
        >
          지역 <SortIcon field="region" />
        </button>
        <button
          className="flex items-center gap-1 hover:text-foreground transition-colors justify-end"
          onClick={() => handleSort('risk')}
        >
          위험도 <SortIcon field="risk" />
        </button>
      </div>

      {/* 테이블 본문 */}
      <div className="flex-1 overflow-y-auto">
        {sortedUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Info className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">필터 조건에 맞는 부대가 없습니다</span>
          </div>
        ) : (
          sortedUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => onUnitClick?.(unit.id)}
              className={cn(
                'w-full grid grid-cols-[1fr_100px_80px_80px] gap-2 px-4 py-3 text-sm border-b border-border/50 hover:bg-muted/50 transition-colors text-left',
                selectedUnitId === unit.id && 'bg-primary/5 border-l-2 border-l-primary'
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{unit.name}</span>
                <span className="text-xs text-muted-foreground truncate">{unit.fullName}</span>
              </div>
              <span className="text-muted-foreground self-center">{unit.typeLabel}</span>
              <span className="text-muted-foreground self-center">{unit.region}</span>
              <div className="self-center justify-self-end">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', getRiskStyle(unit.risk))}>
                  {unit.risk}%
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* 푸터 */}
      <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        총 <span className="font-medium text-foreground">{sortedUnits.length}</span>개 부대
      </div>
    </div>
  );
}
