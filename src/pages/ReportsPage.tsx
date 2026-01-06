import { useState } from 'react';
import { ReportGeneratorForm, ReportFormData } from '@/components/reports/ReportGeneratorForm';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { StatisticsReportList } from '@/components/reports/StatisticsReportList';
import { AccidentReportList } from '@/components/reports/AccidentReportList';
import { useAuth } from '@/contexts/AuthContext';
import { ReportsSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation, ActionButton } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';

// 사고 분류 라벨
const CATEGORY_LABELS: Record<string, string> = {
  military_discipline: '군기사고',
  safety: '안전사고',
  crime: '범죄사고',
  other: '기타',
  assault: '폭행사고',
  other_discipline: '기타군기사고',
  training: '훈련사고',
  vehicle: '차량사고',
  equipment: '장비사고',
  theft: '절도',
  fraud: '사기',
  sexual: '성범죄',
};

const ROLE_LABELS: Record<string, string> = {
  suspect: '피의자',
  victim: '피해자',
  injured: '사고자',
};

// Mock AI 생성 함수 (추후 실제 AI 연동)
const generateMockReport = (data: ReportFormData): string => {
  const categoryLabel = `${CATEGORY_LABELS[data.categoryMajor] || data.categoryMajor}${data.categoryMiddle ? ` > ${CATEGORY_LABELS[data.categoryMiddle] || data.categoryMiddle}` : ''}${data.categoryMinor ? ` > ${data.categoryMinor}` : ''}`;
  
  // 관련자 정보 포맷팅
  const personsSection = data.personsInvolved.length > 0 
    ? data.personsInvolved.map((p, i) => {
        const roleLabel = ROLE_LABELS[p.role] || p.role;
        if (p.isMilitary) {
          return `    ${i + 1}) ${roleLabel}: ${p.rank} ${p.name} (${p.unit})`;
        } else {
          return `    ${i + 1}) ${roleLabel}: ${p.name} (민간인)`;
        }
      }).join('\n')
    : '    (관련자 정보 없음)';

  // 피해 현황 포맷팅
  const casualties = [];
  if (data.militaryDeaths > 0) casualties.push(`군인 사망 ${data.militaryDeaths}명`);
  if (data.civilianDeaths > 0) casualties.push(`민간인 사망 ${data.civilianDeaths}명`);
  if (data.militaryInjuries > 0) casualties.push(`군인 부상 ${data.militaryInjuries}명`);
  if (data.civilianInjuries > 0) casualties.push(`민간인 부상 ${data.civilianInjuries}명`);
  const casualtiesText = casualties.length > 0 ? casualties.join(', ') : '없음';

  return `1. 사고 개요
  가. 발생 일시: ${data.date} ${data.time || '시간 미상'}
  나. 발생 장소: ${data.location} (${data.locationDetail === 'inside' ? '영내' : '영외'} / ${data.specificPlace || '장소 미상'})
  다. 사고 유형: ${categoryLabel}
  라. 사고 원인: ${data.cause || '(조사 중)'}

2. 관련자 현황
${personsSection}

3. 사고 경위
${data.overview}

4. 피해 현황
  가. 인명 피해: ${casualtiesText}
  나. 군 피해: ${data.militaryDamage || '없음'}
  다. 민간 피해: ${data.civilianDamage || '없음'}

5. 상황 정보
  가. 음주 여부: ${data.alcoholInvolved ? '음주' : '미음주'}
  나. 범행 도구: ${data.crimeTool || '없음'}
  다. 근무 형태: ${data.workType || '미확인'}

6. 조치 사항
${data.actionsTaken || '  (조치 사항 기록 필요)'}

7. 재발 방지 대책
  가. 단기 대책:
    - 해당 유형 활동 시 안전 점검 강화
    - 관련 인원 안전 교육 실시
  나. 중장기 대책:
    - 안전 매뉴얼 보완
    - 정기 점검 체계 강화

8. 보고자
  ${data.reporterRank} ${data.reporter} (${data.reporterContact || '연락처 미기재'})

※ 본 보고서는 AI가 생성한 초안이며, 실제 내용은 담당자가 확인 후 수정하시기 바랍니다.
`;
};

const TABS = [
  { id: 'accident', label: '사고 보고서' },
  { id: 'statistics', label: '통계 보고서' },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('accident');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isLoading = usePageLoading(1000);
  const [reporterInfo, setReporterInfo] = useState<{ name: string; rank: string } | undefined>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<ReportFormData | undefined>();

  const handleGenerate = async (data: ReportFormData) => {
    setIsGenerating(true);
    
    // 보고자 정보 저장
    setReporterInfo({
      name: data.reporter,
      rank: data.reporterRank,
    });
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = generateMockReport(data);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="보고서" 
        description="사고 보고서 및 통계 보고서 조회·작성"
        actions={
          !showGenerator ? (
            activeTab === 'accident' ? (
              <ActionButton label="보고서 생성" onClick={() => {
                setIsEditMode(false);
                setEditFormData(undefined);
                setShowGenerator(true);
              }} />
            ) : (
              <ActionButton label="보고서 생성" onClick={() => setShowStatModal(true)} />
            )
          ) : undefined
        }
      />

      {!showGenerator && (
        <TabNavigation tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      )}

      {/* 사고 보고서 작성 폼 */}
      {showGenerator && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowGenerator(false);
              setGeneratedContent('');
              setIsEditMode(false);
              setEditFormData(undefined);
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 목록으로 돌아가기
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportGeneratorForm 
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              isEditMode={isEditMode}
              initialData={editFormData}
            />
            <ReportPreview 
              content={generatedContent}
              onContentChange={setGeneratedContent}
              reporterInfo={reporterInfo}
            />
          </div>
        </div>
      )}

      {/* 사고 보고서 목록 탭 */}
      {!showGenerator && activeTab === 'accident' && (
        <AccidentReportList 
          onCreateNew={() => {
            setIsEditMode(false);
            setEditFormData(undefined);
            setShowGenerator(true);
          }} 
          onEdit={(formData) => {
            setIsEditMode(true);
            setEditFormData(formData);
            setShowGenerator(true);
            setGeneratedContent('');
          }}
        />
      )}

      {/* 통계 보고서 조회 탭 */}
      {!showGenerator && activeTab === 'statistics' && (
        <StatisticsReportList 
          showModal={showStatModal}
          onCloseModal={() => setShowStatModal(false)}
        />
      )}
    </div>
  );
}
