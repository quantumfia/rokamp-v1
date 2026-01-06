import { useState } from 'react';
import { Filter, ChevronDown, AlertTriangle, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { UnitTreeSelect } from '@/components/unit';
interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface UnitFilterPanelProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  selectedUnit: string;
  riskLevels: string[];
}

const RISK_LEVELS: FilterOption[] = [
  { id: 'high', label: '고위험 (60% 이상)', count: 3 },
  { id: 'medium', label: '중위험 (30-60%)', count: 12 },
  { id: 'low', label: '저위험 (30% 미만)', count: 15 },
];

export function UnitFilterPanel({ onFilterChange }: UnitFilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    selectedUnit: '',
    riskLevels: [],
  });

  const [openSections, setOpenSections] = useState({
    unit: true,
    riskLevels: true,
  });

  const handleRiskLevelChange = (id: string) => {
    setFilters((prev) => {
      const current = prev.riskLevels;
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      
      const newFilters = { ...prev, riskLevels: updated };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const handleUnitChange = (unitId: string) => {
    const newFilters = { ...filters, selectedUnit: unitId };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = { selectedUnit: '', riskLevels: [] };
    setFilters(emptyFilters);
    onFilterChange?.(emptyFilters);
  };

  const totalFilters = filters.riskLevels.length + (filters.selectedUnit ? 1 : 0);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">필터</span>
          {totalFilters > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {totalFilters}
            </span>
          )}
        </div>
        {totalFilters > 0 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAllFilters}>
            초기화
          </Button>
        )}
      </div>

      {/* 필터 섹션들 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* 위험도 필터 (상단) */}
        <Collapsible open={openSections.riskLevels} onOpenChange={() => setOpenSections((prev) => ({ ...prev, riskLevels: !prev.riskLevels }))}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">위험도</span>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', openSections.riskLevels && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-3 py-2 space-y-1">
              {RISK_LEVELS.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={filters.riskLevels.includes(option.id)}
                      onCheckedChange={() => handleRiskLevelChange(option.id)}
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </div>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">{option.count}</span>
                  )}
                </label>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 부대 선택 */}
        <Collapsible open={openSections.unit} onOpenChange={() => setOpenSections((prev) => ({ ...prev, unit: !prev.unit }))}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">부대 선택</span>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', openSections.unit && 'rotate-180')} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-1 py-2">
              <UnitTreeSelect
                value={filters.selectedUnit}
                onChange={handleUnitChange}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* 요약 */}
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground">
          역할에 따라 조회 가능한 부대가 필터링됩니다.
        </div>
      </div>
    </div>
  );
}
