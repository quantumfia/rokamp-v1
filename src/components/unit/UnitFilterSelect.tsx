/**
 * 통합 부대 필터 선택 컴포넌트
 * 용도: 목록 상단 필터링 (예: 사용자 목록, 예보 분석, 보고서 등)
 * 
 * 두 가지 모드 지원:
 * 1. popover: 팝오버 + 트리 (기본, 복잡한 부대 구조용)
 * 2. cascade: 단계별 드롭다운 (간단한 필터용)
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UnitTreeSelect } from '@/components/unit/UnitTreeSelect';
import { getUnitById, getChildUnits, ArmyUnit } from '@/data/armyUnits';
import { cn } from '@/lib/utils';

type FilterMode = 'popover' | 'cascade';

interface UnitFilterSelectProps {
  value: string;
  onChange: (unitId: string) => void;
  /** 표시 모드: popover(기본) 또는 cascade */
  mode?: FilterMode;
  /** 라벨 표시 여부 */
  showLabel?: boolean;
  /** 라벨 텍스트 */
  label?: string;
  /** 플레이스홀더 */
  placeholder?: string;
  /** cascade 모드에서 인라인 표시 여부 */
  inline?: boolean;
  /** cascade 모드에서 하위 레벨 표시 여부 */
  showSubLevels?: boolean;
  /** 팝오버 컨텐츠 너비 클래스 */
  popoverWidth?: string;
  /** 컨테이너 너비 클래스 */
  containerWidth?: string;
}

export function UnitFilterSelect({
  value,
  onChange,
  mode = 'popover',
  showLabel = false,
  label = '부대',
  placeholder = '전체 부대',
  inline = true,
  showSubLevels = true,
  popoverWidth = 'w-[360px]',
  containerWidth,
}: UnitFilterSelectProps) {
  const [open, setOpen] = useState(false);

  // 표시 텍스트
  const displayText = useMemo(() => {
    if (!value || value === 'all' || value === '') return placeholder;
    return getUnitById(value)?.name || placeholder;
  }, [value, placeholder]);

  // Popover 모드
  if (mode === 'popover') {
    const handleChange = (unitId: string) => {
      onChange(unitId || 'all');
      setOpen(false);
    };

    return (
      <div className={cn("flex-shrink-0", containerWidth || "w-[320px]")}>
        {showLabel && (
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-between border-border bg-card/60 hover:bg-card',
                'h-10 px-3'
              )}
            >
              <span className="text-sm truncate">{displayText}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className={cn(
              popoverWidth,
              'p-3 bg-popover',
              'border-border shadow-md'
            )}
          >
            <div className="max-h-[420px] overflow-y-auto pr-1">
              <UnitTreeSelect
                value={value === 'all' ? '' : value}
                onChange={handleChange}
                useRoleFilter={true}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Cascade 모드
  return (
    <CascadeFilter
      value={value}
      onChange={onChange}
      showLabel={showLabel}
      label={label}
      placeholder={placeholder}
      inline={inline}
      showSubLevels={showSubLevels}
    />
  );
}

// Cascade 필터 내부 컴포넌트
interface CascadeFilterProps {
  value: string;
  onChange: (unitId: string) => void;
  showLabel?: boolean;
  label?: string;
  placeholder?: string;
  inline?: boolean;
  showSubLevels?: boolean;
}

function CascadeFilter({
  value,
  onChange,
  showLabel = false,
  label = '부대',
  placeholder = '전체',
  inline = true,
  showSubLevels = true,
}: CascadeFilterProps) {
  const [selections, setSelections] = useState<string[]>(() => {
    if (value && value !== 'all') {
      const path = getUnitPathIds(value);
      return path;
    }
    return [];
  });

  // value 변경 시 selections 동기화
  useMemo(() => {
    if (value && value !== 'all' && value !== '') {
      const path = getUnitPathIds(value);
      if (JSON.stringify(path) !== JSON.stringify(selections)) {
        setSelections(path);
      }
    } else if (!value || value === 'all' || value === '') {
      if (selections.length > 0) {
        setSelections([]);
      }
    }
  }, [value]);

  const handleSelect = (level: number, unitId: string) => {
    if (unitId === 'all') {
      setSelections([]);
      onChange('');
      return;
    }
    const newSelections = [...selections.slice(0, level), unitId];
    setSelections(newSelections);
    onChange(unitId);
  };

  const getLevelOptions = (level: number): ArmyUnit[] => {
    if (level === 0) {
      return getChildUnits(null);
    }
    const parentId = selections[level - 1];
    if (!parentId) return [];
    return getChildUnits(parentId);
  };

  const getVisibleLevels = (): number => {
    if (selections.length === 0) return 1;
    const lastSelected = selections[selections.length - 1];
    const hasMoreChildren = getChildUnits(lastSelected).length > 0;
    return selections.length + (hasMoreChildren ? 1 : 0);
  };

  const visibleLevels = getVisibleLevels();
  const firstLevelOptions = getLevelOptions(0);
  const firstLevelValue = selections[0] || '';
  const subLevels = Array.from({ length: Math.max(0, visibleLevels - 1) }).map((_, idx) => idx + 1);

  return (
    <div className={cn("flex items-center gap-2", inline ? "flex-wrap" : "flex-col items-start")}>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{label}:</span>
      )}
      
      {/* 첫 번째 레벨 */}
      <Select
        value={firstLevelValue || 'all'}
        onValueChange={(val) => handleSelect(0, val)}
      >
        <SelectTrigger className="w-32 min-w-[128px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 z-[300]">
          <SelectItem value="all">{placeholder}</SelectItem>
          {firstLevelOptions.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 하위 레벨들 */}
      {showSubLevels && subLevels.map((level) => {
        const options = getLevelOptions(level);
        const currentValue = selections[level] || '';
        
        if (options.length === 0) return null;
        
        return (
          <div key={level} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Select
              value={currentValue || 'none'}
              onValueChange={(val) => val !== 'none' && handleSelect(level, val)}
            >
              <SelectTrigger className="w-32 min-w-[128px]">
                <SelectValue placeholder="선택..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 z-[300]">
                {options.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}

// 유틸리티: unitId로부터 경로 ID 배열 추출
function getUnitPathIds(unitId: string): string[] {
  const path: string[] = [];
  let current = getUnitById(unitId);
  
  while (current) {
    path.unshift(current.id);
    if (current.parentId) {
      current = getUnitById(current.parentId);
    } else {
      break;
    }
  }
  
  return path;
}
