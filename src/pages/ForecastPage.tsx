import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ForecastSkeleton } from '@/components/skeletons';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { getUnitById, hasChildren } from '@/data/armyUnits';
// 월별 사고 추세 데이터
const TREND_DATA = [
  { month: '7월', current: 12, previous: 15 },
  { month: '8월', current: 18, previous: 14 },
  { month: '9월', current: 15, previous: 16 },
  { month: '10월', current: 22, previous: 19 },
  { month: '11월', current: 19, previous: 21 },
  { month: '12월', current: 14, previous: 17 },
];

// 사고 유형별 분포 데이터
const TYPE_DISTRIBUTION = [
  { name: '차량 사고', value: 35 },
  { name: '훈련 부상', value: 28 },
  { name: '시설 안전', value: 22 },
  { name: '기타', value: 15 },
];

// 계급별 위험 지수 데이터
const RANK_RISK_DATA = [
  { rank: '병사', risk: 42 },
  { rank: '부사관', risk: 28 },
  { rank: '위관', risk: 18 },
  { rank: '영관', risk: 8 },
  { rank: '장관', risk: 4 },
];

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '4px',
  fontSize: '12px'
};

interface ChecklistItem {
  id: number;
  task: string;
  completed: boolean;
  priority: '높음' | '중간' | '낮음';
  assignee: string;
}

interface InspectionItem {
  id: number;
  item: string;
  cycle: '일일' | '주간' | '월간';
  lastDate: string;
  nextDate: string;
  status: 'complete' | 'warning' | 'overdue';
}

interface TrainingItem {
  id: number;
  name: string;
  target: string;
  rate: number;
  deadline: string;
  status: 'complete' | 'inprogress';
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 1, task: '차량 일일 점검 실시 (동절기 배터리/부동액)', completed: true, priority: '높음', assignee: '수송반' },
  { id: 2, task: '동절기 안전교육 시행 (저체온증 예방)', completed: true, priority: '높음', assignee: '교육계' },
  { id: 3, task: '훈련장 안전시설 점검 (결빙 구간 표시)', completed: false, priority: '높음', assignee: '작전과' },
  { id: 4, task: '비상연락망 확인 및 업데이트', completed: false, priority: '중간', assignee: '행정반' },
  { id: 5, task: '응급처치 장비 점검 (AED, 구급함)', completed: true, priority: '중간', assignee: '의무반' },
  { id: 6, task: '야간 훈련 조명 장비 점검', completed: false, priority: '낮음', assignee: '정비반' },
];

const INITIAL_INSPECTIONS: InspectionItem[] = [
  { id: 1, item: '차량 일일 점검 (배터리, 부동액, 타이어)', cycle: '일일', lastDate: '12/15', nextDate: '12/16', status: 'complete' },
  { id: 2, item: '훈련장 안전시설 점검', cycle: '주간', lastDate: '12/14', nextDate: '12/21', status: 'complete' },
  { id: 3, item: '응급장비 점검 (AED, 구급함)', cycle: '주간', lastDate: '12/10', nextDate: '12/17', status: 'warning' },
  { id: 4, item: '소방시설 점검', cycle: '월간', lastDate: '12/01', nextDate: '01/01', status: 'complete' },
  { id: 5, item: '탄약고 안전점검', cycle: '주간', lastDate: '12/08', nextDate: '12/15', status: 'overdue' },
];

const INITIAL_TRAININGS: TrainingItem[] = [
  { id: 1, name: '동절기 안전교육', target: '전 장병', rate: 95, deadline: '12/20', status: 'complete' },
  { id: 2, name: '차량 안전운행 교육', target: '운전병', rate: 88, deadline: '12/18', status: 'inprogress' },
  { id: 3, name: '응급처치 교육 (심폐소생술)', target: '간부', rate: 72, deadline: '12/25', status: 'inprogress' },
  { id: 4, name: '화생방 대응 교육', target: '전 장병', rate: 45, deadline: '12/31', status: 'inprogress' },
  { id: 5, name: '사이버보안 교육', target: '전 장병', rate: 100, deadline: '12/10', status: 'complete' },
];

const PRIORITY_OPTIONS = ['높음', '중간', '낮음'] as const;
const ASSIGNEE_OPTIONS = ['수송반', '교육계', '작전과', '행정반', '의무반', '정비반', '보급반', '통신반'];
const CYCLE_OPTIONS = ['일일', '주간', '월간'] as const;
const TARGET_OPTIONS = ['전 장병', '간부', '운전병', '병사', '부사관'];
const STATUS_OPTIONS = ['complete', 'warning', 'overdue'] as const;
const TRAINING_STATUS_OPTIONS = ['complete', 'inprogress'] as const;

export default function ForecastPage() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  
  // 체크리스트 상태
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
  const [editingChecklist, setEditingChecklist] = useState<Partial<ChecklistItem>>({});
  
  // 점검 현황 상태
  const [inspections, setInspections] = useState<InspectionItem[]>(INITIAL_INSPECTIONS);
  const [editingInspectionId, setEditingInspectionId] = useState<number | null>(null);
  const [editingInspection, setEditingInspection] = useState<Partial<InspectionItem>>({});
  
  // 교육 현황 상태
  const [trainings, setTrainings] = useState<TrainingItem[]>(INITIAL_TRAININGS);
  const [editingTrainingId, setEditingTrainingId] = useState<number | null>(null);
  const [editingTraining, setEditingTraining] = useState<Partial<TrainingItem>>({});

  // 부대별 주간 예보 기본 목데이터 (모든 부대에 동일하게 적용)
  const DEFAULT_UNIT_FORECAST = {
    days: [28, 42, 55, 48, 38, 22, 18],
    events: ['체력단련', '사격훈련', '야외훈련', '정비점검', '안전교육', '휴일', '휴일']
  };

  // 체크리스트 핸들러
  const handleToggleComplete = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleStartEditChecklist = (item: ChecklistItem) => {
    setEditingChecklistId(item.id);
    setEditingChecklist({ ...item });
  };

  const handleSaveChecklist = (id: number) => {
    if (editingChecklist.task?.trim()) {
      setChecklist(prev => prev.map(item => 
        item.id === id ? { ...item, ...editingChecklist } as ChecklistItem : item
      ));
    }
    setEditingChecklistId(null);
    setEditingChecklist({});
  };

  const handleCancelEditChecklist = () => {
    setEditingChecklistId(null);
    setEditingChecklist({});
  };

  const handleDeleteChecklist = (id: number) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const handleAddChecklist = () => {
    const newId = Math.max(...checklist.map(c => c.id), 0) + 1;
    const newItem: ChecklistItem = {
      id: newId,
      task: '새 점검 항목',
      completed: false,
      priority: '중간',
      assignee: '행정반'
    };
    setChecklist(prev => [...prev, newItem]);
    setEditingChecklistId(newId);
    setEditingChecklist(newItem);
  };

  // 점검 현황 핸들러
  const handleStartEditInspection = (item: InspectionItem) => {
    setEditingInspectionId(item.id);
    setEditingInspection({ ...item });
  };

  const handleSaveInspection = (id: number) => {
    if (editingInspection.item?.trim()) {
      setInspections(prev => prev.map(item => 
        item.id === id ? { ...item, ...editingInspection } as InspectionItem : item
      ));
    }
    setEditingInspectionId(null);
    setEditingInspection({});
  };

  const handleCancelEditInspection = () => {
    setEditingInspectionId(null);
    setEditingInspection({});
  };

  const handleDeleteInspection = (id: number) => {
    setInspections(prev => prev.filter(item => item.id !== id));
  };

  const handleAddInspection = () => {
    const newId = Math.max(...inspections.map(c => c.id), 0) + 1;
    const newItem: InspectionItem = {
      id: newId,
      item: '새 점검 항목',
      cycle: '주간',
      lastDate: '12/15',
      nextDate: '12/22',
      status: 'complete'
    };
    setInspections(prev => [...prev, newItem]);
    setEditingInspectionId(newId);
    setEditingInspection(newItem);
  };

  // 교육 현황 핸들러
  const handleStartEditTraining = (item: TrainingItem) => {
    setEditingTrainingId(item.id);
    setEditingTraining({ ...item });
  };

  const handleSaveTraining = (id: number) => {
    if (editingTraining.name?.trim()) {
      setTrainings(prev => prev.map(item => 
        item.id === id ? { ...item, ...editingTraining } as TrainingItem : item
      ));
    }
    setEditingTrainingId(null);
    setEditingTraining({});
  };

  const handleCancelEditTraining = () => {
    setEditingTrainingId(null);
    setEditingTraining({});
  };

  const handleDeleteTraining = (id: number) => {
    setTrainings(prev => prev.filter(item => item.id !== id));
  };

  const handleAddTraining = () => {
    const newId = Math.max(...trainings.map(c => c.id), 0) + 1;
    const newItem: TrainingItem = {
      id: newId,
      name: '새 교육',
      target: '전 장병',
      rate: 0,
      deadline: '12/31',
      status: 'inprogress'
    };
    setTrainings(prev => [...prev, newItem]);
    setEditingTrainingId(newId);
    setEditingTraining(newItem);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ForecastSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="border-b border-border pb-4">
        <h1 className="text-lg font-semibold text-foreground">예보 분석</h1>
        <p className="text-sm text-muted-foreground mt-1">부대별 위험도 예보 및 사고 경향 분석</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-6 border-b border-border">
        {[
          { id: 'weekly', label: '주간 예보' },
          { id: 'trends', label: '경향 분석' },
          { id: 'prevention', label: '예방 활동' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 주간 예보 탭 */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {/* 주간 종합 위험도 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">주간 종합 위험도</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">구분</th>
                    {[
                      { date: '12/21', day: '일' },
                      { date: '12/22', day: '월' },
                      { date: '12/23', day: '화' },
                      { date: '12/24', day: '수' },
                      { date: '12/25', day: '목' },
                      { date: '12/26', day: '금' },
                      { date: '12/27', day: '토' },
                    ].map((item) => (
                      <th key={item.date} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {item.date}({item.day})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {[18, 45, 52, 78, 55, 42, 25].map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{risk}%</span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {[18, 45, 52, 78, 55, 42, 25].map((risk, index) => {
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 사고 유형별 주간 예측 위험도 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">사고 유형별 주간 위험 지수</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">구분</th>
                    {['차량 사고', '훈련 부상', '시설 안전', '장비 사고'].map((type) => (
                      <th key={type} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {type}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {[72, 45, 28, 35].map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{risk}%</span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {[72, 45, 28, 35].map((risk, index) => {
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 계급별 주간 위험 지수 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">계급별 주간 위험 지수</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">구분</th>
                    {['병사', '부사관', '위관', '영관', '장관'].map((rank) => (
                      <th key={rank} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {rank}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {[58, 35, 22, 12, 5].map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">{risk}%</span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {[58, 35, 22, 12, 5].map((risk, index) => {
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 부대별 주간 예보 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">부대별 주간 위험도 예보</h2>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-status-error">■ 경고 75%↑</span>
                <span className="text-status-warning">■ 주의 50~74%</span>
                <span className="text-status-success">■ 안전 ~49%</span>
              </div>
            </div>

            {/* 부대 선택 */}
            <div className="mb-4">
              <UnitCascadeSelect
                value={selectedUnitId}
                onChange={setSelectedUnitId}
                placeholder="부대 선택"
                showFullPath={true}
              />
            </div>

            {/* 주간 예보 테이블 */}
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-24">구분</th>
                    {[
                      { date: '12/21', day: '일' },
                      { date: '12/22', day: '월' },
                      { date: '12/23', day: '화' },
                      { date: '12/24', day: '수' },
                      { date: '12/25', day: '목' },
                      { date: '12/26', day: '금' },
                      { date: '12/27', day: '토' },
                    ].map((item) => (
                      <th key={item.date} className="py-2 text-xs font-medium text-foreground text-center border-r border-border last:border-r-0">
                        {item.date}({item.day})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 위험도 수치 */}
                  <tr className="border-b border-border">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">위험도</td>
                    {(selectedUnitId && !hasChildren(selectedUnitId)
                      ? DEFAULT_UNIT_FORECAST.days 
                      : [null, null, null, null, null, null, null]
                    ).map((risk, index) => (
                      <td key={index} className="py-3 text-center border-r border-border last:border-r-0">
                        <span className="text-lg font-semibold tabular-nums text-foreground">
                          {risk !== null ? `${risk}%` : '-'}
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* 위험 등급 */}
                  <tr className="border-b border-border bg-muted/20">
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border">등급</td>
                    {(selectedUnitId && !hasChildren(selectedUnitId)
                      ? DEFAULT_UNIT_FORECAST.days 
                      : [null, null, null, null, null, null, null]
                    ).map((risk, index) => {
                      if (risk === null) {
                        return (
                          <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                            <span className="text-xs text-muted-foreground">-</span>
                          </td>
                        );
                      }
                      const level = risk >= 75 ? '경고' : risk >= 50 ? '주의' : '안전';
                      const levelColor = risk >= 75 ? 'text-status-error' : risk >= 50 ? 'text-status-warning' : 'text-status-success';
                      return (
                        <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                          <span className={`text-xs font-medium ${levelColor}`}>{level}</span>
                        </td>
                      );
                    })}
                  </tr>
                  {/* 사건사고 예측 */}
                  <tr>
                    <td className="py-2 text-xs text-muted-foreground text-center border-r border-border bg-muted/20">비고</td>
                    {(selectedUnitId && !hasChildren(selectedUnitId)
                      ? DEFAULT_UNIT_FORECAST.events 
                      : [null, null, null, null, null, null, null]
                    ).map((event, index) => (
                      <td key={index} className="py-2 text-center border-r border-border last:border-r-0">
                        <span className="text-[10px] text-muted-foreground">
                          {event || '-'}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {!selectedUnitId && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                상단에서 부대를 선택하면 해당 부대의 주간 위험도 예보가 표시됩니다
              </p>
            )}
            
            {selectedUnitId && hasChildren(selectedUnitId) && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                최하위 부대를 선택하면 해당 부대의 주간 위험도 예보가 표시됩니다
              </p>
            )}
          </div>
        </div>
      )}

      {/* 경향 분석 탭 */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* 통계 요약 */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">전체 사고 (전년 대비)</p>
              <p className="text-2xl font-semibold text-status-success mt-1">-12%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">차량 사고 (전년 대비)</p>
              <p className="text-2xl font-semibold text-status-error mt-1">+20%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">훈련 부상 (전년 대비)</p>
              <p className="text-2xl font-semibold text-status-success mt-1">-8%</p>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          <div className="grid grid-cols-2 gap-8">
            {/* 월별 사고 추세 */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">월별 사고 추세 (전년 대비)</h2>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      name="금년"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previous" 
                      name="전년"
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--muted-foreground))', r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 사고 유형별 분포 */}
            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">사고 유형별 분포</h2>
              <div className="h-[220px] flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={TYPE_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {TYPE_DISTRIBUTION.map((_, index) => {
                          const colors = [
                            'hsl(var(--primary))',
                            'hsl(var(--status-warning))',
                            'hsl(var(--status-success))',
                            'hsl(var(--muted-foreground))'
                          ];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index]} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2">
                  {TYPE_DISTRIBUTION.map((item, index) => {
                    const colors = [
                      'bg-primary',
                      'bg-status-warning',
                      'bg-status-success',
                      'bg-muted-foreground'
                    ];
                    return (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-sm ${colors[index]}`} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">{item.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 계급별 위험 지수 */}
          <div>
            <h2 className="text-sm font-medium text-foreground mb-3">계급별 사고 비율</h2>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RANK_RISK_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number" 
                    domain={[0, 50]}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="rank" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    width={50}
                  />
                  <Tooltip 
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [`${value}%`, '비율']}
                  />
                  <Bar 
                    dataKey="risk" 
                    fill="hsl(var(--primary))"
                    radius={[0, 2, 2, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ※ 자대 및 예하 부대 데이터만 통계 처리에 포함됩니다. 원본 데이터(RAW)는 접근이 제한됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 예방 활동 탭 */}
      {activeTab === 'prevention' && (
        <div className="space-y-6">
          {/* 점검 현황 요약 */}
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">일일 점검 완료율</p>
              <p className="text-2xl font-semibold text-foreground mt-1">92%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">주간 점검 완료율</p>
              <p className="text-2xl font-semibold text-foreground mt-1">85%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">미조치 항목</p>
              <p className="text-2xl font-semibold text-status-warning mt-1">3건</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">월간 교육 이수율</p>
              <p className="text-2xl font-semibold text-foreground mt-1">78%</p>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 점검 현황 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">점검 현황</h2>
              <button
                onClick={handleAddInspection}
                className="text-xs text-primary hover:underline"
              >
                + 항목 추가
              </button>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-left px-4 border-r border-border">점검 항목</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">주기</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-24">최근 점검일</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-24">다음 점검일</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-16">상태</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center w-20">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0 group">
                      <td className="py-2.5 text-sm px-4 border-r border-border">
                        {editingInspectionId === row.id ? (
                          <input
                            type="text"
                            value={editingInspection.item || ''}
                            onChange={(e) => setEditingInspection(prev => ({ ...prev, item: e.target.value }))}
                            className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-foreground"
                            autoFocus
                          />
                        ) : (
                          <span className="text-foreground">{row.item}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingInspectionId === row.id ? (
                          <select
                            value={editingInspection.cycle || '주간'}
                            onChange={(e) => setEditingInspection(prev => ({ ...prev, cycle: e.target.value as any }))}
                            className="bg-background border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                          >
                            {CYCLE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.cycle}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingInspectionId === row.id ? (
                          <input
                            type="text"
                            value={editingInspection.lastDate || ''}
                            onChange={(e) => setEditingInspection(prev => ({ ...prev, lastDate: e.target.value }))}
                            className="w-16 bg-transparent border border-border rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-foreground"
                            placeholder="MM/DD"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.lastDate}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingInspectionId === row.id ? (
                          <input
                            type="text"
                            value={editingInspection.nextDate || ''}
                            onChange={(e) => setEditingInspection(prev => ({ ...prev, nextDate: e.target.value }))}
                            className="w-16 bg-transparent border border-border rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-foreground"
                            placeholder="MM/DD"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.nextDate}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingInspectionId === row.id ? (
                          <select
                            value={editingInspection.status || 'complete'}
                            onChange={(e) => setEditingInspection(prev => ({ ...prev, status: e.target.value as any }))}
                            className="bg-background border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                          >
                            <option value="complete">완료</option>
                            <option value="warning">임박</option>
                            <option value="overdue">지연</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-medium ${
                            row.status === 'complete' ? 'text-status-success' : 
                            row.status === 'warning' ? 'text-status-warning' : 'text-status-error'
                          }`}>
                            {row.status === 'complete' ? '완료' : row.status === 'warning' ? '임박' : '지연'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {editingInspectionId === row.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleSaveInspection(row.id)} className="text-xs text-status-success hover:underline">저장</button>
                            <button onClick={handleCancelEditInspection} className="text-xs text-muted-foreground hover:underline">취소</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEditInspection(row)} className="text-xs text-muted-foreground hover:text-foreground">수정</button>
                            <button onClick={() => handleDeleteInspection(row.id)} className="text-xs text-muted-foreground hover:text-status-error">삭제</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 교육 현황 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">교육 현황</h2>
              <button
                onClick={handleAddTraining}
                className="text-xs text-primary hover:underline"
              >
                + 항목 추가
              </button>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-left px-4 border-r border-border">교육명</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-24">대상</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">이수율</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-24">마감일</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-16">상태</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center w-20">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {trainings.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0 group">
                      <td className="py-2.5 text-sm px-4 border-r border-border">
                        {editingTrainingId === row.id ? (
                          <input
                            type="text"
                            value={editingTraining.name || ''}
                            onChange={(e) => setEditingTraining(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-foreground"
                            autoFocus
                          />
                        ) : (
                          <span className="text-foreground">{row.name}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingTrainingId === row.id ? (
                          <select
                            value={editingTraining.target || '전 장병'}
                            onChange={(e) => setEditingTraining(prev => ({ ...prev, target: e.target.value }))}
                            className="bg-background border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                          >
                            {TARGET_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.target}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingTrainingId === row.id ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingTraining.rate ?? 0}
                            onChange={(e) => setEditingTraining(prev => ({ ...prev, rate: parseInt(e.target.value) || 0 }))}
                            className="w-14 bg-transparent border border-border rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-foreground"
                          />
                        ) : (
                          <span className={`text-xs font-medium tabular-nums ${
                            row.rate >= 90 ? 'text-status-success' : 
                            row.rate >= 70 ? 'text-status-warning' : 'text-foreground'
                          }`}>
                            {row.rate}%
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingTrainingId === row.id ? (
                          <input
                            type="text"
                            value={editingTraining.deadline || ''}
                            onChange={(e) => setEditingTraining(prev => ({ ...prev, deadline: e.target.value }))}
                            className="w-16 bg-transparent border border-border rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-foreground"
                            placeholder="MM/DD"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">{row.deadline}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingTrainingId === row.id ? (
                          <select
                            value={editingTraining.status || 'inprogress'}
                            onChange={(e) => setEditingTraining(prev => ({ ...prev, status: e.target.value as any }))}
                            className="bg-background border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                          >
                            <option value="complete">완료</option>
                            <option value="inprogress">진행중</option>
                          </select>
                        ) : (
                          <span className={`text-xs font-medium ${
                            row.status === 'complete' ? 'text-status-success' : 'text-primary'
                          }`}>
                            {row.status === 'complete' ? '완료' : '진행중'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {editingTrainingId === row.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleSaveTraining(row.id)} className="text-xs text-status-success hover:underline">저장</button>
                            <button onClick={handleCancelEditTraining} className="text-xs text-muted-foreground hover:underline">취소</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEditTraining(row)} className="text-xs text-muted-foreground hover:text-foreground">수정</button>
                            <button onClick={() => handleDeleteTraining(row.id)} className="text-xs text-muted-foreground hover:text-status-error">삭제</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-6" />

          {/* 예방 체크리스트 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">예방 체크리스트</h2>
              <button
                onClick={handleAddChecklist}
                className="text-xs text-primary hover:underline"
              >
                + 항목 추가
              </button>
            </div>
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b-2 border-foreground/30">
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-16">완료</th>
                    <th className="py-2 text-xs font-medium text-foreground text-left px-4 border-r border-border">점검 항목</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-20">우선순위</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center border-r border-border w-24">담당</th>
                    <th className="py-2 text-xs font-medium text-foreground text-center w-20">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-b-0 group">
                      <td className="py-2.5 text-center border-r border-border">
                        <button
                          onClick={() => handleToggleComplete(item.id)}
                          className={`w-4 h-4 mx-auto border rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                            item.completed ? 'bg-status-success border-status-success' : 'border-border hover:border-foreground/50'
                          }`}
                        >
                          {item.completed && (
                            <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 text-sm px-4 border-r border-border">
                        {editingChecklistId === item.id ? (
                          <input
                            type="text"
                            value={editingChecklist.task || ''}
                            onChange={(e) => setEditingChecklist(prev => ({ ...prev, task: e.target.value }))}
                            className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-foreground"
                            autoFocus
                          />
                        ) : (
                          <span className={item.completed ? 'text-muted-foreground line-through' : 'text-foreground'}>
                            {item.task}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingChecklistId === item.id ? (
                          <select
                            value={editingChecklist.priority || '중간'}
                            onChange={(e) => setEditingChecklist(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="bg-background border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                          >
                            {PRIORITY_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-xs font-medium ${
                            item.priority === '높음' ? 'text-status-error' : 
                            item.priority === '중간' ? 'text-status-warning' : 'text-muted-foreground'
                          }`}>
                            {item.priority}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-center border-r border-border">
                        {editingChecklistId === item.id ? (
                          <select
                            value={editingChecklist.assignee || '행정반'}
                            onChange={(e) => setEditingChecklist(prev => ({ ...prev, assignee: e.target.value }))}
                            className="bg-background border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                          >
                            {ASSIGNEE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">{item.assignee}</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {editingChecklistId === item.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleSaveChecklist(item.id)} className="text-xs text-status-success hover:underline">저장</button>
                            <button onClick={handleCancelEditChecklist} className="text-xs text-muted-foreground hover:underline">취소</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEditChecklist(item)} className="text-xs text-muted-foreground hover:text-foreground">수정</button>
                            <button onClick={() => handleDeleteChecklist(item.id)} className="text-xs text-muted-foreground hover:text-status-error">삭제</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              ※ AI가 현재 위험 징후를 분석하여 자동 생성한 체크리스트입니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
