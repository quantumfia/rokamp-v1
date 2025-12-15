import { useState } from 'react';
import { ReportGeneratorForm, ReportFormData } from '@/components/reports/ReportGeneratorForm';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { StatisticsReportList } from '@/components/reports/StatisticsReportList';
import { useAuth } from '@/contexts/AuthContext';

// Mock AI 생성 함수 (추후 실제 AI 연동)
const generateMockReport = (data: ReportFormData): string => {
  const typeLabels: Record<string, string> = {
    vehicle: '차량 사고',
    training: '훈련 사고',
    equipment: '장비 사고',
    safety: '안전 사고',
    other: '기타 사고',
  };

  return `사 고 보 고 서

1. 사고 개요
  가. 발생 일시: ${data.date} ${data.time || '시간 미상'}
  나. 발생 장소: ${data.location}
  다. 사고 유형: ${typeLabels[data.accidentType] || data.accidentType}

2. 사고 경위
${data.overview}

3. 피해 현황
  가. 인명 피해: (확인 필요)
  나. 재산 피해: (확인 필요)

4. 조치 사항
  가. 초동 조치: 
    - 현장 통제 및 안전 확보
    - 부상자 응급 처치 및 후송
    - 지휘관 보고
  나. 후속 조치:
    - 사고 원인 조사 진행
    - 유사 사고 예방 대책 수립

5. 사고 원인 분석 (추정)
${data.keywords ? `  관련 요인: ${data.keywords}` : '  (조사 진행 중)'}

6. 재발 방지 대책
  가. 단기 대책:
    - 해당 유형 활동 시 안전 점검 강화
    - 관련 인원 안전 교육 실시
  나. 중장기 대책:
    - 안전 매뉴얼 보완
    - 정기 점검 체계 강화

※ 본 보고서는 AI가 생성한 초안이며, 실제 내용은 담당자가 확인 후 수정하시기 바랍니다.
`;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('generator');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Super Admin 권한: 모든 기능 표시
  const isHQ = true;

  const handleGenerate = async (data: ReportFormData) => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = generateMockReport(data);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const tabs = [
    ...(isHQ ? [{ id: 'generator', label: '사고 보고서 생성' }] : []),
    { id: 'statistics', label: '통계 보고서 조회' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="border-b border-border pb-4">
        <h1 className="text-lg font-semibold text-foreground">보고서</h1>
        <p className="text-sm text-muted-foreground mt-1">사고 보고서 작성 및 통계 보고서 조회</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-6 border-b border-border">
        {tabs.map((tab) => (
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

      {/* 사고 보고서 생성 탭 */}
      {isHQ && activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportGeneratorForm 
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
          <ReportPreview 
            content={generatedContent}
            onContentChange={setGeneratedContent}
          />
        </div>
      )}

      {/* 통계 보고서 조회 탭 */}
      {activeTab === 'statistics' && (
        <StatisticsReportList />
      )}
    </div>
  );
}
