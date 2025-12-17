import { useState } from 'react';
import { StatisticsReportList } from '@/components/reports/StatisticsReportList';
import { AccidentReportList } from '@/components/reports/AccidentReportList';
import { ReportsSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation, ActionButton } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';

const TABS = [
  { id: 'accident', label: '사고 보고서' },
  { id: 'statistics', label: '통계 보고서' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('accident');
  const [showAccidentModal, setShowAccidentModal] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const isLoading = usePageLoading(1000);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="보고서" 
        description="사고 보고서 및 통계 보고서 조회·작성"
        actions={
          activeTab === 'accident' ? (
            <ActionButton label="보고서 생성" onClick={() => setShowAccidentModal(true)} />
          ) : (
            <ActionButton label="보고서 생성" onClick={() => setShowStatModal(true)} />
          )
        }
      />

      <TabNavigation tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* 사고 보고서 목록 탭 */}
      {activeTab === 'accident' && (
        <AccidentReportList 
          showModal={showAccidentModal}
          onCloseModal={() => setShowAccidentModal(false)}
        />
      )}

      {/* 통계 보고서 조회 탭 */}
      {activeTab === 'statistics' && (
        <StatisticsReportList 
          showModal={showStatModal}
          onCloseModal={() => setShowStatModal(false)}
        />
      )}
    </div>
  );
}
