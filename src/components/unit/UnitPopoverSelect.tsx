import { useMemo, useState } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { UnitTreeSelect } from '@/components/unit/UnitTreeSelect';
import { getUnitById } from '@/data/armyUnits';
import { cn } from '@/lib/utils';

interface UnitPopoverSelectProps {
  value: string; // 'all' | unitId
  onChange: (unitId: string) => void;
  label?: string;
  placeholder?: string;
  contentWidthClassName?: string;
}

/**
 * 고정 높이(1줄) 트리 선택 Trigger + Portal Popover 내 스크롤 트리.
 * - 헤더 영역 높이를 늘리지 않음
 * - 리스트 길이에 영향 받지 않음
 */
export function UnitPopoverSelect({
  value,
  onChange,
  label = '분석 대상 부대',
  placeholder = '전체 부대 (전군)',
  contentWidthClassName = 'w-[360px]',
}: UnitPopoverSelectProps) {
  const [open, setOpen] = useState(false);

  const displayText = useMemo(() => {
    if (!value || value === 'all') return placeholder;
    return getUnitById(value)?.name || placeholder;
  }, [value, placeholder]);

  const handleChange = (unitId: string) => {
    const normalized = unitId ? unitId : 'all';
    onChange(normalized);
    setOpen(false);
  };

  return (
    <div className="flex-shrink-0 w-[320px]">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>

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
            contentWidthClassName,
            'p-3 bg-popover',
            'border-border shadow-md'
          )}
        >
          <div className="max-h-[320px] overflow-y-auto pr-1">
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
