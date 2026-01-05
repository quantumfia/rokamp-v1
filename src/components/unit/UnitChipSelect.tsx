import { useState, useEffect } from 'react';
import { X, ChevronRight, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChildUnits, getUnitPath, getUnitById, ArmyUnit } from '@/data/armyUnits';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UnitChipSelectProps {
  value?: string;
  onChange: (unitId: string) => void;
  placeholder?: string;
}

export function UnitChipSelect({ 
  value, 
  onChange, 
  placeholder = '전체 부대'
}: UnitChipSelectProps) {
  const [selections, setSelections] = useState<string[]>([]);
  const [openLevel, setOpenLevel] = useState<number | null>(null);
  
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
    setOpenLevel(null);
  };

  const handleRemoveChip = (level: number) => {
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
      return getChildUnits(null);
    }
    const parentId = selections[level - 1];
    if (!parentId) return [];
    return getChildUnits(parentId);
  };

  // 다음 레벨에 선택 가능한 하위 부대가 있는지 확인
  const hasMoreLevels = (): boolean => {
    if (selections.length === 0) return true;
    const lastSelected = selections[selections.length - 1];
    return getChildUnits(lastSelected).length > 0;
  };

  // 첫 번째 레벨 옵션
  const firstLevelOptions = getLevelOptions(0);

  return (
    <div className="space-y-2">
      {/* 선택된 칩들 */}
      <div className="flex flex-wrap gap-1.5">
        {selections.length === 0 ? (
          // 아무것도 선택되지 않은 경우: 전체 부대 선택 버튼
          <Popover open={openLevel === 0} onOpenChange={(open) => setOpenLevel(open ? 0 : null)}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
                  "bg-muted/50 text-muted-foreground border border-dashed border-border",
                  "hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                )}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{placeholder}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 z-[300]" align="start">
              <ScrollArea className="max-h-64">
                <div className="p-1">
                  {firstLevelOptions.map((unit) => (
                    <button
                      key={unit.id}
                      onClick={() => handleSelect(0, unit.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md",
                        "hover:bg-accent hover:text-accent-foreground transition-colors"
                      )}
                    >
                      {unit.name}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        ) : (
          <>
            {/* 선택된 부대 칩들 */}
            {selections.map((unitId, level) => {
              const unit = getUnitById(unitId);
              if (!unit) return null;
              
              return (
                <div key={unitId} className="flex items-center gap-0.5">
                  {level > 0 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  )}
                  <Popover 
                    open={openLevel === level} 
                    onOpenChange={(open) => setOpenLevel(open ? level : null)}
                  >
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium",
                          "bg-primary/10 text-primary border border-primary/20",
                          "hover:bg-primary/20 transition-colors cursor-pointer"
                        )}
                      >
                        <span>{unit.name}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveChip(level);
                          }}
                          className="ml-0.5 p-0.5 rounded-full hover:bg-primary/30 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0 z-[300]" align="start">
                      <ScrollArea className="max-h-64">
                        <div className="p-1">
                          {getLevelOptions(level).map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleSelect(level, option.id)}
                              className={cn(
                                "w-full text-left px-3 py-2 text-sm rounded-md",
                                option.id === unitId 
                                  ? "bg-primary/10 text-primary" 
                                  : "hover:bg-accent hover:text-accent-foreground",
                                "transition-colors"
                              )}
                            >
                              {option.name}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}

            {/* 하위 부대 추가 버튼 */}
            {hasMoreLevels() && (
              <div className="flex items-center gap-0.5">
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <Popover 
                  open={openLevel === selections.length} 
                  onOpenChange={(open) => setOpenLevel(open ? selections.length : null)}
                >
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs",
                        "bg-muted/50 text-muted-foreground border border-dashed border-border",
                        "hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      )}
                    >
                      <span>하위부대</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0 z-[300]" align="start">
                    <ScrollArea className="max-h-64">
                      <div className="p-1">
                        {getLevelOptions(selections.length).map((unit) => (
                          <button
                            key={unit.id}
                            onClick={() => handleSelect(selections.length, unit.id)}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-md",
                              "hover:bg-accent hover:text-accent-foreground transition-colors"
                            )}
                          >
                            {unit.name}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
