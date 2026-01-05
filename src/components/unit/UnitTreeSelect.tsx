import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChildUnits, getUnitPath, ArmyUnit } from '@/data/armyUnits';

interface UnitTreeSelectProps {
  value?: string;
  onChange: (unitId: string) => void;
}

interface TreeNodeProps {
  unit: ArmyUnit;
  level: number;
  selectedId: string;
  expandedIds: Set<string>;
  onSelect: (unitId: string) => void;
  onToggle: (unitId: string) => void;
}

function TreeNode({ unit, level, selectedId, expandedIds, onSelect, onToggle }: TreeNodeProps) {
  const children = getChildUnits(unit.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(unit.id);
  const isSelected = selectedId === unit.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
          isSelected 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-muted/50 text-foreground"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(unit.id)}
      >
        {/* 펼침/접기 버튼 */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(unit.id);
            }}
            className="p-0.5 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4.5" />
        )}
        
        {/* 부대명 */}
        <span className={cn("text-sm flex-1", isSelected && "font-medium")}>
          {unit.name}
        </span>
        
        {/* 선택 표시 */}
        {isSelected && (
          <Check className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* 하위 부대 */}
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              unit={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function UnitTreeSelect({ value = '', onChange }: UnitTreeSelectProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>(value);

  // value가 변경되면 해당 경로를 자동으로 펼침
  useEffect(() => {
    if (value) {
      const path = getUnitPath(value);
      const pathIds = path.map(u => u.id);
      setExpandedIds(prev => {
        const newSet = new Set(prev);
        pathIds.forEach(id => newSet.add(id));
        return newSet;
      });
      setSelectedId(value);
    } else {
      setSelectedId('');
    }
  }, [value]);

  const handleSelect = (unitId: string) => {
    setSelectedId(unitId);
    onChange(unitId);
  };

  const handleToggle = (unitId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedId('');
    onChange('');
  };

  // 최상위 부대 목록
  const topLevelUnits = getChildUnits(null);

  return (
    <div className="space-y-2">
      {/* 전체 부대 옵션 */}
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors",
          selectedId === '' 
            ? "bg-primary/10 text-primary" 
            : "hover:bg-muted/50 text-foreground"
        )}
        onClick={handleClearSelection}
      >
        <span className="w-4.5" />
        <span className={cn("text-sm flex-1", selectedId === '' && "font-medium")}>
          전체 부대
        </span>
        {selectedId === '' && (
          <Check className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* 부대 트리 */}
      <div className="space-y-0.5">
        {topLevelUnits.map((unit) => (
          <TreeNode
            key={unit.id}
            unit={unit}
            level={0}
            selectedId={selectedId}
            expandedIds={expandedIds}
            onSelect={handleSelect}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
