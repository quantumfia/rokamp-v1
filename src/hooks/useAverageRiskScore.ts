import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAccessibleUnitIds } from '@/lib/rbac';
import { ARMY_UNITS, UNIT_LOCATIONS } from '@/data/armyUnits';

export function useAverageRiskScore() {
  const { user } = useAuth();

  const averageRiskScore = useMemo(() => {
    const accessibleIds = new Set(getAccessibleUnitIds(user?.role, user?.unitId));
    const accessibleUnits = ARMY_UNITS.filter(u => accessibleIds.has(u.id));
    
    const riskyUnits = accessibleUnits
      .map(u => UNIT_LOCATIONS[u.id]?.risk)
      .filter((r): r is number => r !== undefined);
    
    return riskyUnits.length > 0 
      ? Math.round((riskyUnits.reduce((a, b) => a + b, 0) / riskyUnits.length) * 10) / 10
      : 0;
  }, [user?.role, user?.unitId]);

  return averageRiskScore;
}
