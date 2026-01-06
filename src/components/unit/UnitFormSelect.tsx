/**
 * 통합 부대 폼 입력 컴포넌트
 * 용도: 등록/수정 폼에서 부대 선택 (사용자 등록, 보고서 생성 등)
 * 
 * 두 가지 모드 지원:
 * 1. cascade: 단계별 드롭다운 (기본, 직관적인 선택)
 * 2. popover: 팝오버 + 트리 (복잡한 부대 구조용)
 */

import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react';
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
import { getUnitById, getChildUnits, getUnitPath, ArmyUnit } from '@/data/armyUnits';
import { cn } from '@/lib/utils';

type FormMode = 'cascade' | 'popover';

interface UnitFormSelectProps {
  value: string;
  onChange: (unitId: string) => void;
  /** 표시 모드: cascade(기본) 또는 popover */
  mode?: FormMode;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 전체 경로 표시 여부 */
  showFullPath?: boolean;
  /** 전체 너비 사용 */
  fullWidth?: boolean;
  /** 비활성화 */
  disabled?: boolean;
}

export function UnitFormSelect({
  value,
  onChange,
  mode = 'cascade',
  placeholder = '부대 선택',
  showFullPath = true,
  fullWidth = true,
  disabled = false,
}: UnitFormSelectProps) {
  // Popover 모드
  if (mode === 'popover') {
    return (
      <PopoverFormSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  // Cascade 모드 (기본)
  return (
    <CascadeFormSelect
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      showFullPath={showFullPath}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
}

// Cascade 폼 선택 컴포넌트
interface CascadeFormSelectProps {
  value: string;
  onChange: (unitId: string) => void;
  placeholder?: string;
  showFullPath?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
}

function CascadeFormSelect({
  value,
  onChange,
  placeholder = '부대 선택',
  showFullPath = true,
  fullWidth = true,
  disabled = false,
}: CascadeFormSelectProps) {
  const [selections, setSelections] = useState<string[]>([]);

  // value가 변경되면 selections 업데이트
  useEffect(() => {
    if (value) {
      const path = getUnitPath(value);
      setSelections(path.map(u => u.id));
    } else {
      setSelections([]);
    }
  }, [value]);

  const handleSelect = (level: number, unitId: string) => {
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

  const getDisplayPath = (): string => {
    if (selections.length === 0) return '';
    return selections
      .map(id => getUnitById(id)?.name || '')
      .filter(Boolean)
      .join(' > ');
  };

  const visibleLevels = getVisibleLevels();
  const firstLevelOptions = getLevelOptions(0);
  const firstLevelValue = selections[0] || '';
  const subLevels = Array.from({ length: Math.max(0, visibleLevels - 1) }).map((_, idx) => idx + 1);

  const inputClass = disabled
    ? "w-full px-3 py-2 text-sm bg-muted/50 border border-border rounded-md text-foreground cursor-not-allowed"
    : "w-full";

  return (
    <div className="space-y-2">
      {/* 첫 번째 레벨 */}
      <Select
        value={firstLevelValue}
        onValueChange={(val) => handleSelect(0, val)}
        disabled={disabled}
      >
        <SelectTrigger className={fullWidth ? "w-full" : "w-48"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 z-[300]">
          {firstLevelOptions.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 하위 레벨들 */}
      {subLevels.length > 0 && selections.length > 0 && (() => {
        const visibleSubLevels = subLevels.filter(level => getLevelOptions(level).length > 0);
        
        if (visibleSubLevels.length === 0) return null;
        
        return (
          <div className="flex items-center gap-2 w-full">
            {visibleSubLevels.map((level, idx) => {
              const options = getLevelOptions(level);
              const currentValue = selections[level] || '';
              
              return (
                <div key={level} className="flex items-center gap-1 flex-1 min-w-0">
                  {idx > 0 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <Select
                    value={currentValue}
                    onValueChange={(val) => handleSelect(level, val)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full min-w-0">
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
      })()}
      
      {/* 전체 경로 표시 */}
      {showFullPath && selections.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {getDisplayPath()}
        </p>
      )}
    </div>
  );
}

// Popover 폼 선택 컴포넌트
interface PopoverFormSelectProps {
  value: string;
  onChange: (unitId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function PopoverFormSelect({
  value,
  onChange,
  placeholder = '부대 선택',
  disabled = false,
}: PopoverFormSelectProps) {
  const [open, setOpen] = useState(false);

  const displayText = useMemo(() => {
    if (!value) return placeholder;
    return getUnitById(value)?.name || placeholder;
  }, [value, placeholder]);

  const handleChange = (unitId: string) => {
    onChange(unitId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-between border-border bg-background hover:bg-muted/50',
            'h-10 px-3',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className={cn("text-sm truncate", !value && "text-muted-foreground")}>
            {displayText}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-[360px] p-3 bg-popover border-border shadow-md"
      >
        <div className="max-h-[420px] overflow-y-auto pr-1">
          <UnitTreeSelect
            value={value}
            onChange={handleChange}
            useRoleFilter={false}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
