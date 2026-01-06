import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { AlertTriangle, TrendingUp, Wine, ChevronRight, X, Users, Clock, MapPin, Lightbulb } from 'lucide-react';

// 요일 데이터
const WEEKDAYS = [
  { key: 'mon', label: '월', date: '1/6' },
  { key: 'tue', label: '화', date: '1/7' },
  { key: 'wed', label: '수', date: '1/8' },
  { key: 'thu', label: '목', date: '1/9' },
  { key: 'fri', label: '금', date: '1/10' },
  { key: 'sat', label: '토', date: '1/11' },
  { key: 'sun', label: '일', date: '1/12' },
];

// 사고유형별 주간 예보 데이터 (실제 군 용어 체계)
const WEEKLY_FORECAST_DATA = [
  // 군기사고
  { 
    id: 1, category: '군기사고', type: '폭행사고',
    weekly: [28, 32, 30, 35, 42, 58, 52],
    detail: { ranks: ['상병', '일병', '병장'], workType: '휴식중, 취침시간', location: '영내 생활관', timeSlot: '22:00~02:00', prevention: '분대장 면담 강화, 야간 순찰 확대' }
  },
  { 
    id: 2, category: '군기사고', type: '일반강력',
    weekly: [8, 10, 9, 12, 18, 22, 20],
    detail: { ranks: ['상병', '병장'], workType: '외출/휴가중', location: '영외 유흥가', timeSlot: '야간', prevention: '외출/휴가 시 주의사항 교육' }
  },
  { 
    id: 3, category: '군기사고', type: '자살사고',
    weekly: [5, 6, 7, 6, 8, 10, 12],
    detail: { ranks: ['이병', '일병'], workType: '휴식중', location: '영내 생활관/화장실', timeSlot: '야간/새벽', prevention: '관심병사 집중관리, 정신건강 상담' }
  },
  { 
    id: 4, category: '군기사고', type: '경제범죄',
    weekly: [12, 15, 14, 16, 18, 14, 10],
    detail: { ranks: ['병장', '하사'], workType: '일반근무, 휴식중', location: '영내 사무실/생활관', timeSlot: '평일 근무시간', prevention: '재정 상담 활성화, 도박 예방교육' }
  },
  { 
    id: 5, category: '군기사고', type: '성범죄',
    weekly: [10, 12, 11, 15, 25, 35, 32],
    detail: { ranks: ['일병', '상병'], workType: '휴가중, 개인정비', location: '영외', timeSlot: '주말 야간', prevention: '성범죄 예방교육, 외출 시 주의사항 전파' }
  },
  { 
    id: 6, category: '군기사고', type: '음주운전',
    weekly: [8, 10, 12, 15, 38, 55, 48],
    detail: { ranks: ['중사', '하사'], workType: '휴가중, 외출후', location: '영외 노상', timeSlot: '금~일 야간', prevention: '복귀 전 음주 확인, 대리운전 안내' }
  },
  { 
    id: 7, category: '군기사고', type: '대상관',
    weekly: [5, 6, 7, 8, 6, 4, 3],
    detail: { ranks: ['일병', '상병'], workType: '일반근무', location: '영내 사무실/생활관', timeSlot: '근무시간', prevention: '상급자 리더십 교육, 소통 강화' }
  },
  { 
    id: 8, category: '군기사고', type: '불법도박',
    weekly: [6, 8, 7, 9, 12, 18, 20],
    detail: { ranks: ['상병', '병장'], workType: '휴식중, 개인정비', location: '영내 생활관', timeSlot: '야간/주말', prevention: '불법도박 예방교육, 휴대폰 사용지도' }
  },
  { 
    id: 9, category: '군기사고', type: '기타',
    weekly: [4, 5, 4, 6, 8, 10, 8],
    detail: { ranks: ['전 계급'], workType: '다양', location: '다양', timeSlot: '다양', prevention: '상황별 맞춤 지도' }
  },
  // 안전사고
  { 
    id: 10, category: '안전사고', type: '교통사고',
    weekly: [18, 20, 22, 25, 45, 38, 52],
    detail: { ranks: ['중사', '상사', '하사'], workType: '출퇴근, 휴가이동', location: '영외 도로', timeSlot: '금요일 오후, 일요일 저녁', prevention: '안전운전 교육, 장거리 이동 시 휴식' }
  },
  { 
    id: 11, category: '안전사고', type: '화재사고',
    weekly: [3, 4, 5, 4, 6, 8, 6],
    detail: { ranks: ['전 계급'], workType: '일반근무, 휴식중', location: '영내 취사장/생활관', timeSlot: '식사시간', prevention: '화기취급 주의, 소화기 점검' }
  },
  { 
    id: 12, category: '안전사고', type: '총기오발',
    weekly: [2, 3, 4, 3, 2, 1, 1],
    detail: { ranks: ['이병', '일병'], workType: '경계근무, 사격훈련', location: '영내 GOP/사격장', timeSlot: '경계/훈련시간', prevention: '총기안전수칙 교육, 탄약관리 철저' }
  },
  { 
    id: 13, category: '안전사고', type: '추락충격',
    weekly: [5, 7, 8, 6, 5, 3, 2],
    detail: { ranks: ['이병', '일병'], workType: '훈련중, 작업중', location: '영내 훈련장/시설', timeSlot: '훈련시간', prevention: '안전장구 착용 철저, 안전요원 배치' }
  },
  { 
    id: 14, category: '안전사고', type: '기타',
    weekly: [3, 4, 3, 5, 6, 5, 4],
    detail: { ranks: ['전 계급'], workType: '다양', location: '다양', timeSlot: '다양', prevention: '상황별 안전수칙 준수' }
  },
  // 군무이탈
  { 
    id: 15, category: '군무이탈', type: '군무이탈',
    weekly: [8, 10, 9, 11, 15, 12, 18],
    detail: { ranks: ['이병', '일병'], workType: '휴식중, 훈련중', location: '영내', timeSlot: '주중 오후, 주말', prevention: '신병 관심병사 면담 강화' }
  },
];

// 위험도 색상 함수
const getRiskBgClass = (value: number) => {
  if (value >= 50) return 'bg-status-error/80 text-white';
  if (value >= 30) return 'bg-status-warning/80 text-foreground';
  if (value >= 15) return 'bg-status-warning/30 text-foreground';
  return 'bg-muted/30 text-muted-foreground';
};

const getRiskLevel = (value: number) => {
  if (value >= 50) return '경고';
  if (value >= 30) return '주의';
  return '안전';
};

export default function WeeklyForecastTab() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<typeof WEEKLY_FORECAST_DATA[0] | null>(null);

  // 전체 주간 위험도 계산 (각 요일별 평균)
  const weeklyAverage = WEEKDAYS.map((_, dayIndex) => {
    const sum = WEEKLY_FORECAST_DATA.reduce((acc, item) => acc + item.weekly[dayIndex], 0);
    return Math.round(sum / WEEKLY_FORECAST_DATA.length);
  });

  // 최고 위험 요일
  const maxRiskDay = weeklyAverage.indexOf(Math.max(...weeklyAverage));
  const maxRiskValue = Math.max(...weeklyAverage);

  // 최고 위험 유형 (주간 평균 기준)
  const typeAverages = WEEKLY_FORECAST_DATA.map(item => ({
    ...item,
    avg: Math.round(item.weekly.reduce((a, b) => a + b, 0) / 7)
  })).sort((a, b) => b.avg - a.avg);

  // 카테고리별 그룹화
  const categories = ['군기사고', '안전사고', '군무이탈'];

  return (
    <div className="space-y-6">
      {/* 상단 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">주간 평균 위험도</span>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {Math.round(weeklyAverage.reduce((a, b) => a + b, 0) / 7)}%
            </span>
          </div>
          <Progress value={Math.round(weeklyAverage.reduce((a, b) => a + b, 0) / 7)} className="h-1.5 mt-2" />
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">최고 위험 요일</span>
            <TrendingUp className="h-4 w-4 text-status-error" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-status-error">
              {WEEKDAYS[maxRiskDay].label}요일
            </span>
            <span className="text-sm text-muted-foreground">({WEEKDAYS[maxRiskDay].date})</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">평균 {maxRiskValue}% 위험</p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">최고 위험 유형</span>
            <Wine className="h-4 w-4 text-status-error" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{typeAverages[0].type}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">주간 평균 {typeAverages[0].avg}%</p>
        </Card>
      </div>

      {/* 부대 선택 */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">부대 선택</span>
        <UnitCascadeSelect
          value={selectedUnitId}
          onChange={setSelectedUnitId}
          placeholder="전체 부대"
          showFullPath={true}
          inline={true}
        />
      </div>

      {/* 주간 예보 테이블 */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-2 px-3 text-left font-medium text-foreground border-r border-border w-24">구분</th>
                <th className="py-2 px-3 text-left font-medium text-foreground border-r border-border w-24">유형</th>
                {WEEKDAYS.map((day) => (
                  <th key={day.key} className="py-2 px-2 text-center font-medium text-foreground border-r border-border last:border-r-0 min-w-[60px]">
                    <div>{day.label}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">{day.date}</div>
                  </th>
                ))}
                <th className="py-2 px-2 text-center font-medium text-foreground w-10"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, catIndex) => {
                const categoryItems = WEEKLY_FORECAST_DATA.filter(item => item.category === category);
                return categoryItems.map((item, itemIndex) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-border last:border-b-0 hover:bg-muted/20 cursor-pointer transition-colors ${selectedType?.id === item.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedType(selectedType?.id === item.id ? null : item)}
                  >
                    {itemIndex === 0 && (
                      <td 
                        className="py-2 px-3 text-xs font-medium text-muted-foreground border-r border-border bg-muted/30 align-middle"
                        rowSpan={categoryItems.length}
                      >
                        {category}
                      </td>
                    )}
                    <td className="py-2 px-3 text-sm font-medium text-foreground border-r border-border">
                      {item.type}
                    </td>
                    {item.weekly.map((value, dayIndex) => (
                      <td key={dayIndex} className="py-1.5 px-1 text-center border-r border-border last:border-r-0">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium min-w-[40px] ${getRiskBgClass(value)}`}>
                          {value}%
                        </div>
                      </td>
                    ))}
                    <td className="py-2 px-2 text-center">
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedType?.id === item.id ? 'rotate-90' : ''}`} />
                    </td>
                  </tr>
                ));
              })}
            </tbody>
            {/* 합계 행 */}
            <tfoot>
              <tr className="bg-muted/50 border-t-2 border-foreground/20">
                <td colSpan={2} className="py-2 px-3 text-sm font-medium text-foreground border-r border-border">
                  일별 평균
                </td>
                {weeklyAverage.map((avg, index) => (
                  <td key={index} className="py-1.5 px-1 text-center border-r border-border last:border-r-0">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-bold min-w-[40px] ${getRiskBgClass(avg)}`}>
                      {avg}%
                    </div>
                  </td>
                ))}
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 선택된 유형 상세 정보 */}
      {selectedType && (
        <Card className="p-4 border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedType.category}</span>
                <span className="text-xs text-muted-foreground">›</span>
                <span className="text-sm font-semibold text-foreground">{selectedType.type}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                주간 평균 {Math.round(selectedType.weekly.reduce((a, b) => a + b, 0) / 7)}% | 
                최고 {Math.max(...selectedType.weekly)}% ({WEEKDAYS[selectedType.weekly.indexOf(Math.max(...selectedType.weekly))].label}요일)
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedType(null); }}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">취약 계급</p>
                <p className="text-sm text-foreground">{selectedType.detail.ranks.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">근무형태</p>
                <p className="text-sm text-foreground">{selectedType.detail.workType}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">발생장소</p>
                <p className="text-sm text-foreground">{selectedType.detail.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">취약 시간</p>
                <p className="text-sm text-foreground">{selectedType.detail.timeSlot}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 bg-background rounded-md p-3 border border-border">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs text-primary font-medium">예방 대책</p>
              <p className="text-sm text-foreground">{selectedType.detail.prevention}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 범례 */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded bg-status-error/80"></div>
          <span className="text-muted-foreground">경고 (50%↑)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded bg-status-warning/80"></div>
          <span className="text-muted-foreground">주의 (30~49%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded bg-status-warning/30"></div>
          <span className="text-muted-foreground">관심 (15~29%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded bg-muted/50"></div>
          <span className="text-muted-foreground">안전 (~14%)</span>
        </div>
      </div>

      {/* 데이터 출처 */}
      <div className="text-center py-2 bg-muted/30 rounded-md">
        <p className="text-xs text-muted-foreground">
          본 데이터는 10년치 데이터를 바탕으로 분석한 결과입니다.
        </p>
      </div>
    </div>
  );
}
