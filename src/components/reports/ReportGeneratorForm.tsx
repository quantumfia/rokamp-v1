import { useState } from 'react';

const ACCIDENT_TYPES = [
  { value: 'vehicle', label: '차량 사고' },
  { value: 'training', label: '훈련 사고' },
  { value: 'equipment', label: '장비 사고' },
  { value: 'safety', label: '안전 사고' },
  { value: 'other', label: '기타' },
];

interface ReportGeneratorFormProps {
  onGenerate: (data: ReportFormData) => void;
  isGenerating: boolean;
}

export interface ReportFormData {
  date: string;
  time: string;
  location: string;
  accidentType: string;
  overview: string;
  keywords: string;
}

export function ReportGeneratorForm({ onGenerate, isGenerating }: ReportGeneratorFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    date: '',
    time: '',
    location: '',
    accidentType: '',
    overview: '',
    keywords: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleChange = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.date && formData.location && formData.accidentType && formData.overview;

  return (
    <div>
      <h2 className="text-sm font-medium text-foreground mb-4">보고서 입력 정보</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="date" className="text-xs text-muted-foreground">발생 일자 *</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="time" className="text-xs text-muted-foreground">발생 시간</label>
            <input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="location" className="text-xs text-muted-foreground">발생 장소 *</label>
          <input
            id="location"
            placeholder="예: 00사단 훈련장, 00대대 주둔지"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="accidentType" className="text-xs text-muted-foreground">사고 유형 *</label>
          <select
            id="accidentType"
            value={formData.accidentType}
            onChange={(e) => handleChange('accidentType', e.target.value)}
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors"
          >
            <option value="">사고 유형 선택</option>
            {ACCIDENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="overview" className="text-xs text-muted-foreground">사고 개요 *</label>
          <textarea
            id="overview"
            placeholder="사고 상황을 간략히 기술해주세요"
            rows={4}
            value={formData.overview}
            onChange={(e) => handleChange('overview', e.target.value)}
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="keywords" className="text-xs text-muted-foreground">추가 키워드</label>
          <input
            id="keywords"
            placeholder="예: 폭우, 야간, 신병"
            value={formData.keywords}
            onChange={(e) => handleChange('keywords', e.target.value)}
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
          <p className="text-xs text-muted-foreground">쉼표로 구분하여 입력</p>
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
