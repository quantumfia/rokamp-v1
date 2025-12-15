import { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// 상태 라벨
function StatusLabel({ status }: { status: 'completed' | 'processing' | 'failed' }) {
  const labels = {
    completed: '완료',
    processing: '처리중',
    failed: '실패',
  };
  return <span className="text-sm text-muted-foreground">{labels[status]}</span>;
}

// 문서 데이터
const documentData = [
  { id: 1, name: '육군 안전관리 규정 v2.3', type: 'PDF', size: '2.4MB', uploadedAt: '2024-12-10 14:30', status: 'completed' as const, chunks: 128 },
  { id: 2, name: '동절기 안전수칙 매뉴얼', type: 'HWP', size: '1.8MB', uploadedAt: '2024-12-08 09:15', status: 'completed' as const, chunks: 85 },
  { id: 3, name: '차량 운행 및 정비 매뉴얼', type: 'PDF', size: '5.2MB', uploadedAt: '2024-12-14 11:00', status: 'processing' as const, chunks: 0 },
  { id: 4, name: '사격훈련 안전수칙', type: 'PDF', size: '3.1MB', uploadedAt: '2024-12-07 16:45', status: 'completed' as const, chunks: 156 },
  { id: 5, name: '야간훈련 지침서', type: 'HWP', size: '1.2MB', uploadedAt: '2024-12-05 10:20', status: 'completed' as const, chunks: 62 },
];

// 뉴스 데이터
const newsData = [
  { id: 1, title: '군 안전사고 예방 종합대책 발표', source: '국방일보', date: '2024-12-13', status: 'completed' as const, embeddings: 45 },
  { id: 2, title: '동절기 한파 대비 안전수칙 강화', source: '연합뉴스', date: '2024-12-12', status: 'completed' as const, embeddings: 32 },
  { id: 3, title: '육군 훈련장 안전점검 결과 보고', source: '국방일보', date: '2024-12-11', status: 'completed' as const, embeddings: 28 },
  { id: 4, title: '국방부 안전관리 혁신방안 추진', source: 'YTN', date: '2024-12-10', status: 'processing' as const, embeddings: 0 },
];

// 훈련 데이터
const trainingData = [
  { id: 1, unit: '제1보병사단', period: '2024년 12월 2주차', type: '주간계획', uploadedAt: '2024-12-09', status: 'completed' as const, records: 48 },
  { id: 2, unit: '제7보병사단', period: '2024년 12월 2주차', type: '주간계획', uploadedAt: '2024-12-09', status: 'completed' as const, records: 52 },
  { id: 3, unit: '수도기계화보병사단', period: '2024년 12월', type: '월간계획', uploadedAt: '2024-12-01', status: 'completed' as const, records: 186 },
  { id: 4, unit: '제3보병사단', period: '2024년 12월 2주차', type: '주간계획', uploadedAt: '2024-12-14', status: 'processing' as const, records: 0 },
];

// 업로드 컴포넌트
function CompactUploader({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between py-4 px-4 bg-muted/30 border border-dashed border-border rounded-lg">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 text-sm border border-border bg-background rounded hover:bg-muted/50 transition-colors">
        <Upload className="w-4 h-4" />
        파일 업로드
      </button>
    </div>
  );
}

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState('documents');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const handleJsonUpload = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('배열 형식이어야 합니다');
      }
      toast({
        title: '데이터 적재 완료',
        description: `${parsed.length}개 기사가 Vector DB로 변환됩니다.`,
      });
      setJsonInput('');
      setShowJsonInput(false);
    } catch (e) {
      toast({
        title: 'JSON 파싱 오류',
        description: '올바른 JSON 형식인지 확인해주세요.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="border-b border-border pb-4">
        <h1 className="text-lg font-semibold text-foreground">데이터 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">학습 데이터 및 훈련 정보 관리</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-6 border-b border-border">
        {[
          { id: 'documents', label: '원문 관리' },
          { id: 'news', label: '뉴스 데이터' },
          { id: 'training', label: '훈련 정보' },
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

      {/* 원문 관리 탭 */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <CompactUploader
            label="규정/매뉴얼 문서 업로드"
            hint="PDF, HWP 형식 (최대 50MB)"
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">학습 현황</h2>
              <span className="text-xs text-muted-foreground">
                총 {documentData.length}개 문서 · {documentData.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.chunks, 0)}개 청크
              </span>
            </div>

            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[1fr_60px_60px_140px_80px_60px_40px] gap-4 py-3 text-xs text-muted-foreground border-y border-border">
              <div>문서명</div>
              <div>형식</div>
              <div>크기</div>
              <div>업로드 일시</div>
              <div className="text-center">청크 수</div>
              <div>상태</div>
              <div></div>
            </div>

            {/* 테이블 내용 */}
            <div className="divide-y divide-border">
              {documentData.map((doc) => (
                <div key={doc.id} className="grid grid-cols-[1fr_60px_60px_140px_80px_60px_40px] gap-4 py-3 items-center text-sm">
                  <div className="font-medium truncate">{doc.name}</div>
                  <div className="text-muted-foreground">{doc.type}</div>
                  <div className="text-muted-foreground">{doc.size}</div>
                  <div className="text-muted-foreground tabular-nums">{doc.uploadedAt}</div>
                  <div className="text-center text-muted-foreground">
                    {doc.status === 'completed' ? doc.chunks : '-'}
                  </div>
                  <div><StatusLabel status={doc.status} /></div>
                  <div>
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 뉴스 데이터 탭 (DATA-002) */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* 업로드 방식 선택 */}
          <div className="grid grid-cols-2 gap-4">
            <CompactUploader
              label="뉴스 파일 업로드"
              hint="PDF 형식"
            />
            <div className="py-4 px-4 bg-muted/30 border border-dashed border-border rounded-lg">
              <p className="text-sm font-medium text-foreground">JSON 직접 입력</p>
              <p className="text-xs text-muted-foreground mt-0.5">구조화된 뉴스 데이터 입력</p>
              <button 
                onClick={() => setShowJsonInput(!showJsonInput)}
                className="mt-2 flex items-center gap-2 px-4 py-2 text-sm border border-border bg-background rounded hover:bg-muted/50 transition-colors"
              >
                {showJsonInput ? '입력창 닫기' : 'JSON 입력'}
              </button>
            </div>
          </div>

          {/* JSON 입력창 (DATA-002) */}
          {showJsonInput && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">JSON 데이터 입력</p>
                <p className="text-xs text-muted-foreground">형식: {'{'}Title, Content, Date, Source{'}'}</p>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'[\n  {\n    "Title": "기사 제목",\n    "Content": "기사 본문 내용...",\n    "Date": "2024-12-14",\n    "Source": "국방일보"\n  }\n]'}
                className="w-full h-48 bg-background border border-border rounded p-3 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:border-foreground resize-none"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setJsonInput('')}
                  className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/50 transition-colors"
                >
                  초기화
                </button>
                <button 
                  onClick={handleJsonUpload}
                  className="px-3 py-1.5 text-sm bg-foreground text-background rounded hover:opacity-80 transition-opacity"
                >
                  데이터 적재
                </button>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">학습된 뉴스 목록</h2>
              <span className="text-xs text-muted-foreground">
                총 {newsData.length}개 기사 · {newsData.filter(n => n.status === 'completed').reduce((sum, n) => sum + n.embeddings, 0)}개 임베딩
              </span>
            </div>

            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[1fr_100px_100px_80px_60px_40px] gap-4 py-3 text-xs text-muted-foreground border-y border-border">
              <div>제목</div>
              <div>출처</div>
              <div>날짜</div>
              <div className="text-center">임베딩 수</div>
              <div>상태</div>
              <div></div>
            </div>

            {/* 테이블 내용 */}
            <div className="divide-y divide-border">
              {newsData.map((news) => (
                <div key={news.id} className="grid grid-cols-[1fr_100px_100px_80px_60px_40px] gap-4 py-3 items-center text-sm">
                  <div className="font-medium truncate">{news.title}</div>
                  <div className="text-muted-foreground">{news.source}</div>
                  <div className="text-muted-foreground tabular-nums">{news.date}</div>
                  <div className="text-center text-muted-foreground">
                    {news.status === 'completed' ? news.embeddings : '-'}
                  </div>
                  <div><StatusLabel status={news.status} /></div>
                  <div>
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 훈련 정보 탭 */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <CompactUploader
            label="훈련 계획 업로드"
            hint="Excel 형식 (최대 10MB)"
          />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-foreground">업로드된 훈련 계획</h2>
              <span className="text-xs text-muted-foreground">
                총 {trainingData.length}개 파일 · {trainingData.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.records, 0)}개 레코드
              </span>
            </div>

            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[1fr_160px_80px_120px_100px_60px_40px] gap-4 py-3 text-xs text-muted-foreground border-y border-border">
              <div>부대</div>
              <div>기간</div>
              <div>유형</div>
              <div>업로드 일자</div>
              <div className="text-center">레코드 수</div>
              <div>상태</div>
              <div></div>
            </div>

            {/* 테이블 내용 */}
            <div className="divide-y divide-border">
              {trainingData.map((training) => (
                <div key={training.id} className="grid grid-cols-[1fr_160px_80px_120px_100px_60px_40px] gap-4 py-3 items-center text-sm">
                  <div className="font-medium truncate">{training.unit}</div>
                  <div className="text-muted-foreground">{training.period}</div>
                  <div className="text-muted-foreground">{training.type}</div>
                  <div className="text-muted-foreground tabular-nums">{training.uploadedAt}</div>
                  <div className="text-center text-muted-foreground">
                    {training.status === 'completed' ? training.records : '-'}
                  </div>
                  <div><StatusLabel status={training.status} /></div>
                  <div>
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
