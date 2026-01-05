import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getChildUnits, getUnitPath, getUnitById, ArmyUnit } from '@/data/armyUnits';

interface UnitCascadeSelectProps {
  value?: string;
  onChange: (unitId: string) => void;
  placeholder?: string;
  showFullPath?: boolean;
  spanFullWidth?: boolean;
  showSubLevels?: boolean;
  inline?: boolean; // 모든 select를 한 줄에 표시
  firstFullWidthRestInline?: boolean; // 첫 번째만 전체 너비, 나머지는 인라인
}

export function UnitCascadeSelect({ 
  value, 
  onChange, 
  placeholder = '부대 선택',
  showFullPath = true,
  spanFullWidth = false,
  showSubLevels = true,
  inline = false,
  firstFullWidthRestInline = false
}: UnitCascadeSelectProps) {
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

  const handleClear = (level: number) => {
    if (level === 0) {
      setSelections([]);
      onChange('');
    } else {
      const newSelections = selections.slice(0, level);
      setSelections(newSelections);
      onChange(newSelections[newSelections.length - 1] || '');
    }
  };

  // 각 레벨별로 선택 가능한 부대 목록 생성
  const getLevelOptions = (level: number): ArmyUnit[] => {
    if (level === 0) {
      return getChildUnits(null); // 최상위 (육군본부)
    }
    const parentId = selections[level - 1];
    if (!parentId) return [];
    return getChildUnits(parentId);
  };

  // 현재 표시할 드롭다운 개수
  const getVisibleLevels = (): number => {
    if (selections.length === 0) return 1;
    const lastSelected = selections[selections.length - 1];
    const hasMoreChildren = getChildUnits(lastSelected).length > 0;
    return selections.length + (hasMoreChildren ? 1 : 0);
  };

  const visibleLevels = getVisibleLevels();

  // 선택된 부대의 전체 경로 표시
  const getDisplayPath = (): string => {
    if (selections.length === 0) return '';
    return selections
      .map(id => getUnitById(id)?.name || '')
      .filter(Boolean)
      .join(' > ');
  };

  // 첫 번째 레벨 옵션 (육군본부/전체)
  const firstLevelOptions = getLevelOptions(0);
  const firstLevelValue = selections[0] || '';

  // 하위 레벨들 (군단, 사단 등)
  const subLevels = Array.from({ length: Math.max(0, visibleLevels - 1) }).map((_, idx) => idx + 1);

  // 인라인 모드: 모든 select를 한 줄에 표시
  if (inline) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* 첫 번째 레벨 */}
        <Select
          value={firstLevelValue}
          onValueChange={(val) => handleSelect(0, val)}
        >
          <SelectTrigger className="w-32 min-w-[128px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 z-[300]">
            <SelectItem value="all">전체 부대</SelectItem>
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
                value={currentValue}
                onValueChange={(val) => handleSelect(level, val)}
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

  // firstFullWidthRestInline 모드: 첫 번째만 전체 너비, 나머지는 인라인
  if (firstFullWidthRestInline) {
    return (
      <div className="space-y-2">
        {/* 첫 번째 레벨: 전체 너비 */}
        <Select
          value={firstLevelValue}
          onValueChange={(val) => handleSelect(0, val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 z-[300]">
            <SelectItem value="all">전체 부대</SelectItem>
            {firstLevelOptions.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 하위 레벨들: 인라인으로 한 줄에 */}
        {showSubLevels && subLevels.length > 0 && selections.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {subLevels.map((level) => {
              const options = getLevelOptions(level);
              const currentValue = selections[level] || '';
              
              if (options.length === 0) return null;
              
              return (
                <div key={level} className="flex items-center gap-1 flex-shrink-0">
                  {level > 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <Select
                    value={currentValue}
                    onValueChange={(val) => handleSelect(level, val)}
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
        )}
        
        {showFullPath && selections.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {getDisplayPath()}
          </p>
        )}
      </div>
    );
  }

  // 기본 모드: 첫 번째 레벨과 하위 레벨 분리
  return (
    <div className="space-y-2">
      {/* 첫 번째 레벨: 육군본부/전체 선택 */}
      <Select
        value={firstLevelValue}
        onValueChange={(val) => handleSelect(0, val)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60 z-[300]">
          <SelectItem value="all">전체 부대</SelectItem>
          {firstLevelOptions.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 하위 레벨: 군단, 사단 등 - spanFullWidth 적용 시 왼쪽으로 확장 */}
      {showSubLevels && subLevels.length > 0 && selections.length > 0 && (
        <div 
          className={spanFullWidth ? "flex items-center gap-2 overflow-x-auto" : "flex flex-wrap items-center gap-2"}
          style={spanFullWidth ? { marginLeft: 'calc(-100% - 12px)', width: 'calc(200% + 12px)' } : {}}
        >
          {subLevels.map((level) => {
            const options = getLevelOptions(level);
            const currentValue = selections[level] || '';
            
            // 옵션이 없으면 표시하지 않음
            if (options.length === 0) return null;
            
            return (
              <div key={level} className="flex items-center gap-1 flex-shrink-0">
                {level > 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <Select
                  value={currentValue}
                  onValueChange={(val) => handleSelect(level, val)}
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
      )}
      
      {showFullPath && selections.length > 0 && (
        <p 
          className="text-xs text-muted-foreground"
          style={spanFullWidth ? { marginLeft: 'calc(-100% - 12px)' } : {}}
        >
          {getDisplayPath()}
        </p>
      )}
    </div>
  );
}
