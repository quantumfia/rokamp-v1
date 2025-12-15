import { useState } from 'react';
import { Plus, X } from 'lucide-react';

// 사고 분류 체계 (대분류 > 중분류 > 소분류)
const ACCIDENT_CATEGORIES = {
  military_discipline: {
    label: '군기사고',
    sub: {
      assault: { label: '폭행사고', details: ['단순폭행', '특수폭행', '상습폭행'] },
      other_discipline: { label: '기타군기사고', details: ['상관모욕', '인터넷도박', '단순음주운전', '무단이탈', '항명'] },
    },
  },
  safety: {
    label: '안전사고',
    sub: {
      training: { label: '훈련사고', details: ['사격훈련', '야간훈련', '체력단련', '전술훈련'] },
      vehicle: { label: '차량사고', details: ['군용차량', '개인차량', '장갑차량'] },
      equipment: { label: '장비사고', details: ['화기사고', '폭발물사고', '중장비사고'] },
    },
  },
  crime: {
    label: '범죄사고',
    sub: {
      theft: { label: '절도', details: ['군용물자절도', '개인물품절도', '외부절도'] },
      fraud: { label: '사기', details: ['군납사기', '개인사기'] },
      sexual: { label: '성범죄', details: ['성추행', '성폭력', '성희롱'] },
    },
  },
  other: {
    label: '기타',
    sub: {
      other: { label: '기타', details: ['기타'] },
    },
  },
};

// 계급 목록
const RANKS = [
  '이병', '일병', '상병', '병장',
  '하사', '중사', '상사', '원사',
  '준위',
  '소위', '중위', '대위',
  '소령', '중령', '대령',
  '준장', '소장', '중장', '대장',
];

// 임관구분
const ENLISTMENT_TYPES = [
  { value: 'conscript', label: '징집' },
  { value: 'volunteer', label: '현역병' },
  { value: 'nco', label: '부사관' },
  { value: 'officer', label: '장교' },
  { value: 'civilian', label: '민간인' },
];

// 근무형태
const WORK_TYPES = [
  '경계근무중', '훈련중', '휴식중', '개인용무', '외출/외박중', '휴가중', '기타',
];

// 범행도구
const CRIME_TOOLS = [
  '없음', '둔기', '흉기', '총기', '휴대폰', '차량', '기타',
];

interface PersonInvolved {
  id: string;
  role: 'suspect' | 'victim' | 'injured'; // 피의자, 피해자, 사고자
  isMilitary: boolean;
  rank: string;
  name: string;
  unit: string;
  enlistmentType: string;
}

interface ReportGeneratorFormProps {
  onGenerate: (data: ReportFormData) => void;
  isGenerating: boolean;
}

export interface ReportFormData {
  // 기본 정보
  date: string;
  time: string;
  location: string;
  locationDetail: string; // 영내/영외
  specificPlace: string; // 구체적 장소
  
  // 사고 분류 (3단계)
  categoryMajor: string;
  categoryMiddle: string;
  categoryMinor: string;
  
  // 사고 개요
  overview: string;
  cause: string; // 사고 원인
  keywords: string;
  
  // 관련자 정보
  personsInvolved: PersonInvolved[];
  
  // 피해 현황
  militaryDeaths: number;
  civilianDeaths: number;
  militaryInjuries: number;
  civilianInjuries: number;
  militaryDamage: string;
  civilianDamage: string;
  
  // 상황 정보
  alcoholInvolved: boolean;
  crimeTool: string;
  workType: string;
  
  // 보고자 정보
  reporter: string;
  reporterRank: string;
  reporterContact: string;
  
  // 조치 사항
  actionsTaken: string;
}

// 테스트용 기본값
const getDefaultFormData = (): ReportFormData => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
  
  return {
    date: dateStr,
    time: timeStr,
    location: '경기 파주시 교하동 소재 89방공진지',
    locationDetail: 'inside', // 영내
    specificPlace: '관측소',
    
    categoryMajor: 'military_discipline',
    categoryMiddle: 'assault',
    categoryMinor: '특수폭행',
    
    overview: '피의자는 2024. 12. 13.(금) 11:50경 경기 파주시 교하동 소재 89방공진지 관측소에서 대공감시를 위해 피해자와 함께 근무에 투입된 뒤, 장난을 빙자하여 바닥에 있던 돌멩이를 주워 피해자의 등부위에 던지고, 삼단봉으로 피해자의 머리 부위를 때리는 방법으로 특수폭행함.',
    cause: '사적감정',
    keywords: '폭행, 근무중, 삼단봉',
    
    personsInvolved: [
      {
        id: '1',
        role: 'suspect',
        isMilitary: true,
        rank: '상병',
        name: '김○○',
        unit: '9사단 방공중대',
        enlistmentType: 'conscript',
      },
      {
        id: '2',
        role: 'victim',
        isMilitary: true,
        rank: '일병',
        name: '이○○',
        unit: '9사단 방공중대',
        enlistmentType: 'conscript',
      },
    ],
    
    militaryDeaths: 0,
    civilianDeaths: 0,
    militaryInjuries: 1,
    civilianInjuries: 0,
    militaryDamage: '없음',
    civilianDamage: '없음',
    
    alcoholInvolved: false,
    crimeTool: '둔기',
    workType: '경계근무중',
    
    reporter: '홍길동',
    reporterRank: '대위',
    reporterContact: '010-1234-5678',
    
    actionsTaken: '현장 조사 진행 중. 피해자 의무대 후송 완료. 피의자 격리 조치.',
  };
};

const generatePersonId = () => Math.random().toString(36).substr(2, 9);

export function ReportGeneratorForm({ onGenerate, isGenerating }: ReportGeneratorFormProps) {
  const [formData, setFormData] = useState<ReportFormData>(getDefaultFormData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleChange = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 관련자 추가
  const addPerson = () => {
    const newPerson: PersonInvolved = {
      id: generatePersonId(),
      role: 'injured',
      isMilitary: true,
      rank: '일병',
      name: '',
      unit: '',
      enlistmentType: 'conscript',
    };
    handleChange('personsInvolved', [...formData.personsInvolved, newPerson]);
  };

  // 관련자 삭제
  const removePerson = (id: string) => {
    handleChange('personsInvolved', formData.personsInvolved.filter(p => p.id !== id));
  };

  // 관련자 수정
  const updatePerson = (id: string, field: keyof PersonInvolved, value: string | boolean) => {
    handleChange('personsInvolved', formData.personsInvolved.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // 중분류 옵션 가져오기
  const getMiddleCategories = () => {
    if (!formData.categoryMajor) return [];
    const major = ACCIDENT_CATEGORIES[formData.categoryMajor as keyof typeof ACCIDENT_CATEGORIES];
    if (!major) return [];
    return Object.entries(major.sub).map(([key, val]) => ({ value: key, label: val.label }));
  };

  // 소분류 옵션 가져오기
  const getMinorCategories = (): { value: string; label: string }[] => {
    if (!formData.categoryMajor || !formData.categoryMiddle) return [];
    const major = ACCIDENT_CATEGORIES[formData.categoryMajor as keyof typeof ACCIDENT_CATEGORIES];
    if (!major) return [];
    const sub = major.sub as Record<string, { label: string; details: string[] }>;
    const middle = sub[formData.categoryMiddle];
    if (!middle) return [];
    return middle.details.map(d => ({ value: d, label: d }));
  };

  const isFormValid = formData.date && formData.location && formData.categoryMajor && formData.overview && formData.reporter;

  const inputClass = "w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors";
  const selectClass = "w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors";
  const labelClass = "text-xs text-muted-foreground";

  return (
    <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
      <h2 className="text-sm font-medium text-foreground mb-4">보고서 입력 정보</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 발생 일시 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>발생 일자 *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>발생 시간</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* 발생 장소 */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className={labelClass}>발생 장소 *</label>
            <input
              placeholder="예: 경기 파주시 교하동 소재 00부대"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>영내/영외</label>
              <select
                value={formData.locationDetail}
                onChange={(e) => handleChange('locationDetail', e.target.value)}
                className={selectClass}
              >
                <option value="inside">영내</option>
                <option value="outside">영외</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>구체적 장소</label>
              <input
                placeholder="예: 생활관, 훈련장, 노상"
                value={formData.specificPlace}
                onChange={(e) => handleChange('specificPlace', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 사고 분류 (3단계) */}
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-xs font-medium text-foreground mb-3">사고 분류</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>대분류 *</label>
              <select
                value={formData.categoryMajor}
                onChange={(e) => {
                  handleChange('categoryMajor', e.target.value);
                  handleChange('categoryMiddle', '');
                  handleChange('categoryMinor', '');
                }}
                className={selectClass}
              >
                <option value="">선택</option>
                {Object.entries(ACCIDENT_CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>중분류</label>
              <select
                value={formData.categoryMiddle}
                onChange={(e) => {
                  handleChange('categoryMiddle', e.target.value);
                  handleChange('categoryMinor', '');
                }}
                className={selectClass}
                disabled={!formData.categoryMajor}
              >
                <option value="">선택</option>
                {getMiddleCategories().map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>소분류</label>
              <select
                value={formData.categoryMinor}
                onChange={(e) => handleChange('categoryMinor', e.target.value)}
                className={selectClass}
                disabled={!formData.categoryMiddle}
              >
                <option value="">선택</option>
                {getMinorCategories().map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 사고 개요 */}
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-xs font-medium text-foreground mb-3">사고 개요</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className={labelClass}>사고 경위 *</label>
              <textarea
                placeholder="사고 상황을 상세히 기술해주세요"
                rows={4}
                value={formData.overview}
                onChange={(e) => handleChange('overview', e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>사고 원인</label>
                <input
                  placeholder="예: 사적감정, 부주의"
                  value={formData.cause}
                  onChange={(e) => handleChange('cause', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>추가 키워드</label>
                <input
                  placeholder="쉼표로 구분"
                  value={formData.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 관련자 정보 */}
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-foreground">관련자 정보</h3>
            <button
              type="button"
              onClick={addPerson}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              추가
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.personsInvolved.map((person, index) => (
              <div key={person.id} className="p-3 border border-border rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">관련자 {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePerson(person.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className={labelClass}>구분</label>
                    <select
                      value={person.role}
                      onChange={(e) => updatePerson(person.id, 'role', e.target.value)}
                      className={selectClass}
                    >
                      <option value="suspect">피의자</option>
                      <option value="victim">피해자</option>
                      <option value="injured">사고자</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>신분</label>
                    <select
                      value={person.isMilitary ? 'military' : 'civilian'}
                      onChange={(e) => updatePerson(person.id, 'isMilitary', e.target.value === 'military')}
                      className={selectClass}
                    >
                      <option value="military">군인</option>
                      <option value="civilian">민간인</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>임관구분</label>
                    <select
                      value={person.enlistmentType}
                      onChange={(e) => updatePerson(person.id, 'enlistmentType', e.target.value)}
                      className={selectClass}
                      disabled={!person.isMilitary}
                    >
                      {ENLISTMENT_TYPES.filter(t => person.isMilitary ? t.value !== 'civilian' : t.value === 'civilian').map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className={labelClass}>계급</label>
                    <select
                      value={person.rank}
                      onChange={(e) => updatePerson(person.id, 'rank', e.target.value)}
                      className={selectClass}
                      disabled={!person.isMilitary}
                    >
                      <option value="">선택</option>
                      {RANKS.map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>성명</label>
                    <input
                      placeholder="예: 홍○○"
                      value={person.name}
                      onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>소속부대</label>
                    <input
                      placeholder="예: 00사단 00연대"
                      value={person.unit}
                      onChange={(e) => updatePerson(person.id, 'unit', e.target.value)}
                      className={inputClass}
                      disabled={!person.isMilitary}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {formData.personsInvolved.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                관련자를 추가해주세요
              </p>
            )}
          </div>
        </div>

        {/* 피해 현황 */}
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-xs font-medium text-foreground mb-3">피해 현황</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>군인 사망</label>
                <input
                  type="number"
                  min="0"
                  value={formData.militaryDeaths}
                  onChange={(e) => handleChange('militaryDeaths', parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>민간인 사망</label>
                <input
                  type="number"
                  min="0"
                  value={formData.civilianDeaths}
                  onChange={(e) => handleChange('civilianDeaths', parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>군인 부상</label>
                <input
                  type="number"
                  min="0"
                  value={formData.militaryInjuries}
                  onChange={(e) => handleChange('militaryInjuries', parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>민간인 부상</label>
                <input
                  type="number"
                  min="0"
                  value={formData.civilianInjuries}
                  onChange={(e) => handleChange('civilianInjuries', parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>군 피해</label>
                <input
                  placeholder="군용 재산/장비 피해"
                  value={formData.militaryDamage}
                  onChange={(e) => handleChange('militaryDamage', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>민간 피해</label>
                <input
                  placeholder="민간 재산 피해"
                  value={formData.civilianDamage}
                  onChange={(e) => handleChange('civilianDamage', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 상황 정보 */}
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-xs font-medium text-foreground mb-3">상황 정보</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>음주 여부</label>
              <select
                value={formData.alcoholInvolved ? 'yes' : 'no'}
                onChange={(e) => handleChange('alcoholInvolved', e.target.value === 'yes')}
                className={selectClass}
              >
                <option value="no">미음주</option>
                <option value="yes">음주</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>범행 도구</label>
              <select
                value={formData.crimeTool}
                onChange={(e) => handleChange('crimeTool', e.target.value)}
                className={selectClass}
              >
                {CRIME_TOOLS.map(tool => (
                  <option key={tool} value={tool}>{tool}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>근무 형태</label>
              <select
                value={formData.workType}
                onChange={(e) => handleChange('workType', e.target.value)}
                className={selectClass}
              >
                {WORK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 보고자 정보 */}
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-xs font-medium text-foreground mb-3">보고자 정보</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>계급</label>
              <input
                placeholder="예: 대위"
                value={formData.reporterRank}
                onChange={(e) => handleChange('reporterRank', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>성명 *</label>
              <input
                placeholder="예: 홍길동"
                value={formData.reporter}
                onChange={(e) => handleChange('reporter', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>연락처</label>
              <input
                placeholder="예: 010-0000-0000"
                value={formData.reporterContact}
                onChange={(e) => handleChange('reporterContact', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 조치 사항 */}
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-xs font-medium text-foreground mb-3">조치 사항</h3>
          <div className="space-y-1.5">
            <label className={labelClass}>현재까지 조치 내용</label>
            <textarea
              placeholder="현장 조치 및 후속 조치 사항을 기술해주세요"
              rows={3}
              value={formData.actionsTaken}
              onChange={(e) => handleChange('actionsTaken', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!isFormValid || isGenerating}
          className="w-full py-2.5 bg-foreground text-background rounded text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {isGenerating ? '생성 중...' : 'AI 보고서 초안 생성'}
        </button>
      </form>
    </div>
  );
}
