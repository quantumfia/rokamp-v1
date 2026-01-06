import { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChildUnits, getUnitPath, ArmyUnit, ARMY_UNITS } from '@/data/armyUnits';
import { useAuth } from '@/contexts/AuthContext';
import { getSelectableUnitsForRole, getAccessibleUnitIds } from '@/lib/rbac';

interface UnitTreeSelectProps {
  value?: string;
  onChange: (unitId: string) => void;
  // 역할 기반 필터링 사용 여부 (기본: true)
  useRoleFilter?: boolean;
}

interface TreeNodeProps {
  unit: ArmyUnit;
  level: number;
  selectedId: string;
  expandedIds: Set<string>;
  accessibleIds: Set<string>;
  onSelect: (unitId: string) => void;
  onToggle: (unitId: string) => void;
}

function TreeNode({ unit, level, selectedId, expandedIds, accessibleIds, onSelect, onToggle }: TreeNodeProps) {
  // 접근 가능한 하위 부대만 표시
  const children = getChildUnits(unit.id).filter(child => accessibleIds.has(child.id));
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(unit.id);
  const isSelected = selectedId === unit.id;
  const isAccessible = accessibleIds.has(unit.id);

  if (!isAccessible) return null;

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
        onClick={() => {
          // 하위가 있으면 펼침/접기, 없으면 선택
          if (hasChildren) {
            onToggle(unit.id);
          } else {
            onSelect(unit.id);
          }
        }}
      >
        {/* 펼침/접기 아이콘 */}
        {hasChildren ? (
          <span className="p-0.5">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </span>
        ) : (
          <span className="w-4.5" />
        )}
        
        {/* 부대명 */}
        <span className={cn("text-sm flex-1", isSelected && "font-medium")}>
          {unit.name}
        </span>
        
        {/* 선택 버튼 (하위가 있는 부대용) */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(unit.id);
            }}
            className={cn(
              "px-2 py-0.5 text-xs rounded transition-colors",
              isSelected 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            선택
          </button>
        )}
        
        {/* 선택 표시 (하위 없는 부대용) */}
        {!hasChildren && isSelected && (
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
              accessibleIds={accessibleIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function UnitTreeSelect({ value = '', onChange, useRoleFilter = true }: UnitTreeSelectProps) {
  const { user } = useAuth();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>(value);

  // 역할 기반 접근 가능한 부대 ID 목록
  const { accessibleIds, isFixed, userUnitName } = useMemo(() => {
    if (!useRoleFilter || !user) {
      return { 
        accessibleIds: new Set(ARMY_UNITS.map(u => u.id)), 
        isFixed: false,
        userUnitName: ''
      };
    }

    const { units, isFixed } = getSelectableUnitsForRole(user.role, user.unitId);
    const ids = getAccessibleUnitIds(user.role, user.unitId);
    const userUnit = ARMY_UNITS.find(u => u.id === user.unitId);
    
    return { 
      accessibleIds: new Set(ids), 
      isFixed,
      userUnitName: userUnit?.name || user.unit
    };
  }, [user, useRoleFilter]);

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

  // 대대급(BN)은 자동으로 자기 부대 선택
  useEffect(() => {
    if (isFixed && user?.unitId && selectedId !== user.unitId) {
      setSelectedId(user.unitId);
      onChange(user.unitId);
    }
  }, [isFixed, user?.unitId]);

  const handleSelect = (unitId: string) => {
    if (isFixed) return; // 고정된 경우 선택 변경 불가
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
    if (isFixed) return; // 고정된 경우 초기화 불가
    setSelectedId('');
    onChange('');
  };

  // 최상위 부대 목록 (접근 가능한 것만)
  const topLevelUnits = useMemo(() => {
    if (!useRoleFilter || user?.role === 'ROLE_HQ') {
      return getChildUnits(null);
    }
    
    // DIV/BN은 자기 부대가 루트가 됨
    if (user?.unitId) {
      const userUnit = ARMY_UNITS.find(u => u.id === user.unitId);
      return userUnit ? [userUnit] : [];
    }
    
    return [];
  }, [user, useRoleFilter]);

  // 대대급(BN)은 고정된 부대만 표시
  if (isFixed) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 py-2 px-3 rounded-md bg-muted/50 border border-border">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{userUnitName}</span>
        </div>
        <p className="text-xs text-muted-foreground px-1">
          대대급 사용자는 소속 부대만 조회할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* 전체 부대 옵션 (HQ만) */}
      {user?.role === 'ROLE_HQ' && (
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
            전체 부대 (전군)
          </span>
          {selectedId === '' && (
            <Check className="w-4 h-4 text-primary" />
          )}
        </div>
      )}

      {/* 부대 트리 */}
      <div className="space-y-0.5">
        {topLevelUnits.map((unit) => (
          <TreeNode
            key={unit.id}
            unit={unit}
            level={0}
            selectedId={selectedId}
            expandedIds={expandedIds}
            accessibleIds={accessibleIds}
            onSelect={handleSelect}
            onToggle={handleToggle}
          />
        ))}
      </div>
      
      {/* 역할별 안내 */}
      {user?.role === 'ROLE_DIV' && (
        <p className="text-xs text-muted-foreground px-1 pt-1 border-t border-border">
          사단급 관리자는 예하 부대만 조회할 수 있습니다.
        </p>
      )}
    </div>
  );
}
