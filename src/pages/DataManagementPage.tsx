import { useState } from 'react';
import { Settings2, FileText, Download, Database, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DataManagementSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation, ActionButton, AddModal, FileDropZone } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { ProcessingStatus } from '@/types/entities';
import { PROCESSING_STATUS_LABELS } from '@/types/entities';

// 상태 라벨
function StatusLabel({ status }: { status: ProcessingStatus }) {
  return <span className="text-sm text-muted-foreground">{PROCESSING_STATUS_LABELS[status]}</span>;
}

// 문서 인터페이스
interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: ProcessingStatus;
  chunks: number;
  fileName: string; // 원본 파일명
}

// 문서 데이터
const initialDocumentData: Document[] = [
  { id: 1, name: '육군 안전관리 규정 v2.3', type: 'PDF', size: '2.4MB', uploadedAt: '2024-12-10 14:30', status: 'COMPLETED', chunks: 128, fileName: '육군_안전관리_규정_v2.3.pdf' },
  { id: 2, name: '동절기 안전수칙 매뉴얼', type: 'HWP', size: '1.8MB', uploadedAt: '2024-12-08 09:15', status: 'COMPLETED', chunks: 85, fileName: '동절기_안전수칙_매뉴얼.hwp' },
  { id: 3, name: '차량 운행 및 정비 매뉴얼', type: 'PDF', size: '5.2MB', uploadedAt: '2024-12-14 11:00', status: 'PROCESSING', chunks: 0, fileName: '차량_운행_및_정비_매뉴얼.pdf' },
  { id: 4, name: '사격훈련 안전수칙', type: 'PDF', size: '3.1MB', uploadedAt: '2024-12-07 16:45', status: 'COMPLETED', chunks: 156, fileName: '사격훈련_안전수칙.pdf' },
  { id: 5, name: '야간훈련 지침서', type: 'HWP', size: '1.2MB', uploadedAt: '2024-12-05 10:20', status: 'COMPLETED', chunks: 62, fileName: '야간훈련_지침서.hwp' },
];

// 뉴스 인터페이스
interface NewsArticle {
  id: number;
  title: string;
  source: string;
  date: string;
  status: ProcessingStatus;
  embeddings: number;
  inputType: 'file' | 'json'; // 입력 유형
  content?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
}

// 뉴스 데이터
const initialNewsData: NewsArticle[] = [
  { id: 1, title: '군 안전사고 예방 종합대책 발표', source: '국방일보', date: '2024-12-13', status: 'COMPLETED', embeddings: 45, inputType: 'file', fileName: '군_안전사고_예방_종합대책.pdf', fileType: 'PDF', fileSize: '1.2MB' },
  { id: 2, title: '동절기 한파 대비 안전수칙 강화', source: '연합뉴스', date: '2024-12-12', status: 'COMPLETED', embeddings: 32, inputType: 'json', content: JSON.stringify([{ Title: '동절기 한파 대비 안전수칙 강화', Content: '기상청이 올겨울 한파가 평년보다 강할 것으로 예상됨에 따라 군에서는 동절기 안전수칙을 대폭 강화한다고 밝혔다. 특히 야간 경계근무자의 방한장비 지급과 난방시설 점검이 중점적으로 이뤄질 예정이다.', Date: '2024-12-12', Source: '연합뉴스' }], null, 2) },
  { id: 3, title: '육군 훈련장 안전점검 결과 보고', source: '국방일보', date: '2024-12-11', status: 'COMPLETED', embeddings: 28, inputType: 'json', content: JSON.stringify([{ Title: '육군 훈련장 안전점검 결과 보고', Content: '육군본부는 전국 주요 훈련장에 대한 안전점검 결과를 발표했다. 점검 결과 대부분의 훈련장이 안전기준을 충족하고 있으나, 일부 시설에 대해서는 보수가 필요한 것으로 나타났다.', Date: '2024-12-11', Source: '국방일보' }], null, 2) },
  { id: 4, title: '국방부 안전관리 혁신방안 추진', source: 'YTN', date: '2024-12-10', status: 'PROCESSING', embeddings: 0, inputType: 'file', fileName: '국방부_안전관리_혁신.pdf', fileType: 'PDF', fileSize: '0.8MB' },
];

// 청크 설정 인터페이스
interface ChunkSettings {
  chunkSize: number;
  overlapPercent: number;
  embeddingModel: string;
}

// 문서 업로드 폼
function DocumentUploadForm({ 
  documentName, 
  onDocumentNameChange 
}: { 
  documentName: string; 
  onDocumentNameChange: (name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">문서명 *</label>
        <input
          type="text"
          value={documentName}
          onChange={(e) => onDocumentNameChange(e.target.value)}
          placeholder="문서명을 입력하세요"
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <FileDropZone
        accept=".pdf,.hwp,.docx"
        hint="문서 파일을 드래그하거나 클릭하여 업로드"
        maxSize="50MB"
      />
      <div className="text-[11px] text-muted-foreground space-y-0.5">
        <p>• PDF, HWP, DOCX 형식 지원</p>
        <p>• 업로드 후 자동으로 청크 분할 및 임베딩 처리</p>
      </div>
    </div>
  );
}

// 기사 파일 업로드 폼
function NewsFileUploadForm({ 
  newsTitle, 
  onNewsTitleChange 
}: { 
  newsTitle: string; 
  onNewsTitleChange: (title: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">제목 *</label>
        <input
          type="text"
          value={newsTitle}
          onChange={(e) => onNewsTitleChange(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <FileDropZone
        accept=".pdf,.txt"
        hint="기사 파일을 드래그하거나 클릭하여 업로드"
        maxSize="20MB"
      />
      <div className="text-[11px] text-muted-foreground">
        • PDF, TXT 형식 지원
      </div>
    </div>
  );
}

// 기사 텍스트 입력 폼
function NewsTextInputForm({ 
  newsTitle, 
  onNewsTitleChange, 
  value, 
  onChange 
}: { 
  newsTitle: string; 
  onNewsTitleChange: (title: string) => void;
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">제목 *</label>
        <input
          type="text"
          value={newsTitle}
          onChange={(e) => onNewsTitleChange(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">JSON 데이터</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'[\n  {\n    "Title": "기사 제목",\n    "Content": "기사 본문 내용...",\n    "Date": "2024-12-14",\n    "Source": "국방일보"\n  }\n]'}
          className="w-full h-48 px-3 py-2 text-sm font-mono bg-background border border-border rounded-md focus:outline-none focus:border-primary resize-none"
        />
      </div>
      <div className="text-[11px] text-muted-foreground">
        • 형식: Title, Content, Date, Source 필드를 포함한 JSON 배열
      </div>
    </div>
  );
}

// 청크 설정 모달
function ChunkSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: ChunkSettings;
  onSave: (settings: ChunkSettings) => void;
}) {
  const [localSettings, setLocalSettings] = useState<ChunkSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
    toast({
      title: '설정 저장 완료',
      description: '청크 설정이 저장되었습니다.',
    });
  };

  const CHUNK_SIZE_OPTIONS = [256, 512, 1024, 2048, 4096];
  const EMBEDDING_MODELS = [
    { value: 'text-embedding-3-small', label: 'OpenAI text-embedding-3-small' },
    { value: 'text-embedding-3-large', label: 'OpenAI text-embedding-3-large' },
    { value: 'text-embedding-ada-002', label: 'OpenAI text-embedding-ada-002' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>청크 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 청크 크기 */}
          <div>
            <label className="block text-sm font-medium mb-3">청크 크기 (토큰)</label>
            <div className="flex gap-2 flex-wrap">
              {CHUNK_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  onClick={() => setLocalSettings({ ...localSettings, chunkSize: size })}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    localSettings.chunkSize === size
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              청크가 클수록 문맥을 더 많이 포함하지만 검색 정확도가 낮아질 수 있습니다.
            </p>
          </div>

          {/* 오버랩 비율 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">오버랩 비율</label>
              <span className="text-sm font-mono text-muted-foreground">{localSettings.overlapPercent}%</span>
            </div>
            <Slider
              value={[localSettings.overlapPercent]}
              onValueChange={(value) => setLocalSettings({ ...localSettings, overlapPercent: value[0] })}
              min={0}
              max={50}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              청크 간 중복되는 텍스트 비율입니다. 높을수록 문맥 연결이 좋아지지만 저장 공간이 증가합니다.
            </p>
          </div>

          {/* 임베딩 모델 */}
          <div>
            <label className="block text-sm font-medium mb-2">임베딩 모델</label>
            <select
              value={localSettings.embeddingModel}
              onChange={(e) => setLocalSettings({ ...localSettings, embeddingModel: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
            >
              {EMBEDDING_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* 현재 설정 요약 */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium text-foreground mb-1">현재 설정 요약</p>
            <p className="text-xs text-muted-foreground">
              {localSettings.chunkSize} 토큰 단위로 분할, {localSettings.overlapPercent}% 오버랩
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 예보 데이터 인터페이스
interface ForecastData {
  id: number;
  name: string;
  period: string;
  recordCount: number;
  uploadedAt: string;
  status: ProcessingStatus;
  fileName: string;
  fileSize: string;
}

// 예보 데이터 목록
const initialForecastData: ForecastData[] = [
  { id: 1, name: '2014-2023년 사고 데이터', period: '2014~2023', recordCount: 15420, uploadedAt: '2024-11-01 09:00', status: 'COMPLETED', fileName: '사고데이터_2014_2023.xlsx', fileSize: '12.8MB' },
  { id: 2, name: '2024년 상반기 사고 데이터', period: '2024.01~06', recordCount: 1856, uploadedAt: '2024-12-01 14:30', status: 'COMPLETED', fileName: '사고데이터_2024_상반기.xlsx', fileSize: '2.1MB' },
];

const DATA_TABS = [
  { id: 'documents', label: '학습 문서' },
  { id: 'news', label: '언론 기사' },
  { id: 'forecast', label: '예보 데이터' },
];

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState('documents');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChunkSettings, setShowChunkSettings] = useState(false);
  const [showDocDetailModal, setShowDocDetailModal] = useState(false);
  const [showNewsDetailModal, setShowNewsDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'document' | 'news'>('document');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editNewsTitle, setEditNewsTitle] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(initialDocumentData);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(initialNewsData);
  const [forecastDataList, setForecastDataList] = useState<ForecastData[]>(initialForecastData);
  const [jsonInput, setJsonInput] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [newsTitle, setNewsTitle] = useState('');
  const [forecastName, setForecastName] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('');
  const [chunkSettings, setChunkSettings] = useState<ChunkSettings>({
    chunkSize: 1024,
    overlapPercent: 20,
    embeddingModel: 'text-embedding-3-small',
  });
  const isLoading = usePageLoading(1000);

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setEditDocName(doc.name);
    setIsEditMode(false);
    setShowDocDetailModal(true);
  };

  const handleNewsClick = (news: NewsArticle) => {
    setSelectedNews(news);
    setEditNewsTitle(news.title);
    setIsEditMode(false);
    setShowNewsDetailModal(true);
  };

  const handleSaveDocName = () => {
    if (!editDocName.trim()) {
      toast({
        title: '입력 오류',
        description: '문서명을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setDocuments(documents.map(d => 
      d.id === selectedDocument?.id ? { ...d, name: editDocName } : d
    ));
    toast({
      title: '수정 완료',
      description: '문서명이 수정되었습니다.',
    });
    setIsEditMode(false);
  };

  const handleSaveNewsTitle = () => {
    if (!editNewsTitle.trim()) {
      toast({
        title: '입력 오류',
        description: '기사 제목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setNewsArticles(newsArticles.map(n => 
      n.id === selectedNews?.id ? { ...n, title: editNewsTitle } : n
    ));
    toast({
      title: '수정 완료',
      description: '기사 제목이 수정되었습니다.',
    });
    setIsEditMode(false);
  };

  const handleDeleteDocument = () => {
    setDeleteType('document');
    setShowDeleteConfirm(true);
  };

  const handleDeleteNews = () => {
    setDeleteType('news');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteType === 'document' && selectedDocument) {
      setDocuments(documents.filter(d => d.id !== selectedDocument.id));
      toast({
        title: '삭제 완료',
        description: '문서가 삭제되었습니다.',
      });
      setShowDocDetailModal(false);
    } else if (deleteType === 'news' && selectedNews) {
      setNewsArticles(newsArticles.filter(n => n.id !== selectedNews.id));
      toast({
        title: '삭제 완료',
        description: '기사가 삭제되었습니다.',
      });
      setShowNewsDetailModal(false);
    }
    setShowDeleteConfirm(false);
  };

  const handleDocumentUpload = () => {
    if (!documentName.trim()) {
      toast({
        title: '입력 오류',
        description: '문서명을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: '업로드 완료',
      description: `"${documentName}" 문서가 업로드되었습니다. 임베딩 처리가 시작됩니다.`,
    });
    setShowAddModal(false);
    setDocumentName('');
  };

  const handleNewsUpload = () => {
    if (!newsTitle.trim()) {
      toast({
        title: '입력 오류',
        description: '기사 제목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    if (jsonInput) {
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
      } catch (e) {
        toast({
          title: 'JSON 파싱 오류',
          description: '올바른 JSON 형식인지 확인해주세요.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      toast({
        title: '업로드 완료',
        description: `"${newsTitle}" 기사가 업로드되었습니다.`,
      });
    }
    setShowAddModal(false);
    setNewsTitle('');
  };

  const handleForecastUpload = () => {
    if (!forecastName.trim() || !forecastPeriod.trim()) {
      toast({
        title: '입력 오류',
        description: '데이터명과 기간을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    const newData: ForecastData = {
      id: forecastDataList.length + 1,
      name: forecastName,
      period: forecastPeriod,
      recordCount: 0,
      uploadedAt: new Date().toLocaleString('ko-KR'),
      status: 'PROCESSING',
      fileName: '업로드된_파일.xlsx',
      fileSize: '0MB',
    };
    setForecastDataList([...forecastDataList, newData]);
    toast({
      title: '업로드 완료',
      description: `"${forecastName}" 데이터가 업로드되었습니다. 모델 학습이 시작됩니다.`,
    });
    setShowAddModal(false);
    setForecastName('');
    setForecastPeriod('');
  };

  if (isLoading) {
    return <DataManagementSkeleton />;
  }

  // 탭별 모달 설정
  const getModalConfig = () => {
    if (activeTab === 'documents') {
      return {
        title: '문서 추가',
        description: '학습용 문서를 업로드합니다',
        inputTypes: [
          { 
            id: 'file', 
            label: '파일 업로드', 
            content: <DocumentUploadForm documentName={documentName} onDocumentNameChange={setDocumentName} /> 
          },
        ],
        onSubmit: handleDocumentUpload,
      };
    } else if (activeTab === 'news') {
      return {
        title: '기사 추가',
        description: '언론 기사를 업로드하거나 직접 입력합니다',
        inputTypes: [
          { id: 'file', label: '파일 업로드', content: <NewsFileUploadForm newsTitle={newsTitle} onNewsTitleChange={setNewsTitle} /> },
          { id: 'text', label: '텍스트 입력', content: <NewsTextInputForm newsTitle={newsTitle} onNewsTitleChange={setNewsTitle} value={jsonInput} onChange={setJsonInput} /> },
        ],
        onSubmit: handleNewsUpload,
      };
    } else {
      return {
        title: '예보 데이터 추가',
        description: '예보 모델 학습용 사고 데이터를 업로드합니다',
        inputTypes: [
          { 
            id: 'file', 
            label: '파일 업로드', 
            content: (
              <div className="space-y-4">
                {/* 템플릿 다운로드 */}
                <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">데이터 템플릿</p>
                    <p className="text-xs text-muted-foreground">필수 컬럼이 포함된 양식 파일</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: '템플릿 다운로드',
                        description: '사고데이터_템플릿.xlsx 파일을 다운로드합니다.',
                      });
                    }}
                    className="gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </Button>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">데이터명 *</label>
                  <input
                    type="text"
                    value={forecastName}
                    onChange={(e) => setForecastName(e.target.value)}
                    placeholder="예: 2024년 하반기 사고 데이터"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">데이터 기간 *</label>
                  <input
                    type="text"
                    value={forecastPeriod}
                    onChange={(e) => setForecastPeriod(e.target.value)}
                    placeholder="예: 2024.07~12"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <FileDropZone
                  accept=".xlsx,.xls,.csv"
                  hint="사고 데이터 파일을 드래그하거나 클릭하여 업로드"
                  maxSize="100MB"
                />
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  <p>• Excel(.xlsx, .xls) 또는 CSV 형식 지원</p>
                  <p>• 필수 컬럼: 발생일자, 사고유형, 부대코드, 계급, 병과 등</p>
                  <p>• 업로드 후 자동으로 모델 학습이 진행됩니다</p>
                </div>
              </div>
            )
          },
        ],
        onSubmit: handleForecastUpload,
      };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="데이터 관리" 
        description="AI 챗봇 및 예보 모델 학습을 위한 데이터 관리"
        actions={
          <div className="flex items-center gap-2">
            {activeTab !== 'forecast' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowChunkSettings(true)}
                className="gap-1.5"
              >
                <Settings2 className="w-4 h-4" />
                청크 설정
              </Button>
            )}
            <ActionButton 
              label={activeTab === 'documents' ? '문서 추가' : activeTab === 'news' ? '기사 추가' : '데이터 추가'} 
              onClick={() => setShowAddModal(true)} 
            />
          </div>
        }
      />

      <TabNavigation tabs={DATA_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* 문서 관리 탭 */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">학습 현황</h2>
            <span className="text-xs text-muted-foreground">
              총 {documents.length}개 문서 · {documents.filter(d => d.status === 'COMPLETED').reduce((sum, d) => sum + d.chunks, 0)}개 청크
            </span>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">문서명</TableHead>
                  <TableHead className="text-xs w-16">형식</TableHead>
                  <TableHead className="text-xs w-16">크기</TableHead>
                  <TableHead className="text-xs w-36">업로드 일시</TableHead>
                  <TableHead className="text-xs w-20 text-center">청크 수</TableHead>
                  <TableHead className="text-xs w-16">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow 
                    key={doc.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <TableCell className="text-sm font-medium">{doc.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">{doc.uploadedAt}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {doc.status === 'COMPLETED' ? doc.chunks : '-'}
                    </TableCell>
                    <TableCell><StatusLabel status={doc.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            ※ 업로드된 문서는 자동으로 청크 분할 및 임베딩 처리되어 AI 챗봇 응답에 활용됩니다.
          </p>
        </div>
      )}

      {/* 언론 기사 관리 탭 */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">학습된 뉴스 목록</h2>
            <span className="text-xs text-muted-foreground">
              총 {newsArticles.length}개 기사 · {newsArticles.filter(n => n.status === 'COMPLETED').reduce((sum, n) => sum + n.embeddings, 0)}개 임베딩
            </span>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <Table className="min-w-[550px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">제목</TableHead>
                  <TableHead className="text-xs w-24">출처</TableHead>
                  <TableHead className="text-xs w-24">날짜</TableHead>
                  <TableHead className="text-xs w-20 text-center">임베딩 수</TableHead>
                  <TableHead className="text-xs w-16">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsArticles.map((news) => (
                  <TableRow 
                    key={news.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleNewsClick(news)}
                  >
                    <TableCell className="text-sm font-medium">{news.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{news.source}</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">{news.date}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {news.status === 'COMPLETED' ? news.embeddings : '-'}
                    </TableCell>
                    <TableCell><StatusLabel status={news.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            ※ 업로드된 기사는 임베딩 처리되어 AI 챗봇의 최신 동향 파악에 활용됩니다.
          </p>
        </div>
      )}

      {/* 예보 데이터 탭 */}
      {activeTab === 'forecast' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">학습 현황</h2>
            <span className="text-xs text-muted-foreground">
              총 {forecastDataList.length}개 데이터셋 · {forecastDataList.filter(d => d.status === 'COMPLETED').reduce((sum, d) => sum + d.recordCount, 0).toLocaleString()}건
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">데이터명</TableHead>
                <TableHead className="text-xs w-28">기간</TableHead>
                <TableHead className="text-xs w-16">크기</TableHead>
                <TableHead className="text-xs w-36">업로드 일시</TableHead>
                <TableHead className="text-xs w-24 text-center">레코드 수</TableHead>
                <TableHead className="text-xs w-16">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecastDataList.map((data) => (
                <TableRow key={data.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="text-sm font-medium">{data.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{data.period}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{data.fileSize}</TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{data.uploadedAt}</TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {data.status === 'COMPLETED' ? data.recordCount.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell><StatusLabel status={data.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-xs text-muted-foreground pt-2">
            ※ 업로드된 사고 데이터는 예보 모델 학습에 활용되어 위험도 예측 정확도를 높입니다.
          </p>
        </div>
      )}


      <AddModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setJsonInput('');
          setDocumentName('');
          setNewsTitle('');
          setForecastName('');
          setForecastPeriod('');
        }}
        {...modalConfig}
      />

      {/* 청크 설정 모달 */}
      <ChunkSettingsModal
        isOpen={showChunkSettings}
        onClose={() => setShowChunkSettings(false)}
        settings={chunkSettings}
        onSave={setChunkSettings}
      />

      {/* 문서 상세 모달 */}
      <Dialog open={showDocDetailModal} onOpenChange={(open) => { setShowDocDetailModal(open); if (!open) setIsEditMode(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? '문서 수정' : '문서 상세'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 업로드된 파일 */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">업로드된 파일</label>
              <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedDocument?.fileName}</p>
                    <p className="text-xs text-muted-foreground">{selectedDocument?.type} · {selectedDocument?.size}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: '다운로드 시작',
                      description: `${selectedDocument?.fileName} 파일을 다운로드합니다.`,
                    });
                    // 실제 구현 시 여기서 파일 다운로드 로직 추가
                  }}
                  className="gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  다운로드
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">문서명</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                />
              ) : (
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedDocument?.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">형식</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedDocument?.type}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">크기</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedDocument?.size}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">업로드 일시</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedDocument?.uploadedAt}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">청크 수</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                  {selectedDocument?.status === 'COMPLETED' ? selectedDocument.chunks : '-'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">상태</label>
              <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                {selectedDocument ? PROCESSING_STATUS_LABELS[selectedDocument.status] : '-'}
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={handleDeleteDocument}>
              삭제
            </Button>
            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" onClick={() => { setIsEditMode(false); setEditDocName(selectedDocument?.name || ''); }}>
                    취소
                  </Button>
                  <Button onClick={handleSaveDocName}>
                    저장
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditMode(true)}>
                  수정
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기사 상세 모달 */}
      <Dialog open={showNewsDetailModal} onOpenChange={(open) => { setShowNewsDetailModal(open); if (!open) setIsEditMode(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditMode ? '기사 수정' : '기사 상세'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 입력 유형 표시 */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">입력 유형</label>
              <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                {selectedNews?.inputType === 'file' ? '파일 업로드' : 'JSON 입력'}
              </p>
            </div>

            {/* 파일 업로드인 경우 */}
            {selectedNews?.inputType === 'file' && selectedNews?.fileName && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">업로드된 파일</label>
                <div className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedNews?.fileName}</p>
                      <p className="text-xs text-muted-foreground">{selectedNews?.fileType} · {selectedNews?.fileSize}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: '다운로드 시작',
                        description: `${selectedNews?.fileName} 파일을 다운로드합니다.`,
                      });
                    }}
                    className="gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </Button>
                </div>
              </div>
            )}

            {/* JSON 입력인 경우 본문 표시 */}
            {selectedNews?.inputType === 'json' && selectedNews?.content && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">본문 (JSON 데이터)</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md max-h-32 overflow-y-auto whitespace-pre-wrap">{selectedNews.content}</p>
              </div>
            )}

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">제목</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={editNewsTitle}
                  onChange={(e) => setEditNewsTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                />
              ) : (
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedNews?.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">출처</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedNews?.source}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">날짜</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedNews?.date}</p>
              </div>
            </div>

            {/* 파일 업로드인 경우에도 content가 있으면 본문 표시 */}
            {selectedNews?.inputType === 'file' && selectedNews?.content && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">본문</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md max-h-32 overflow-y-auto">{selectedNews.content}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">임베딩 수</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                  {selectedNews?.status === 'COMPLETED' ? selectedNews.embeddings : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">상태</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                {selectedNews ? PROCESSING_STATUS_LABELS[selectedNews.status] : '-'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="destructive" onClick={handleDeleteNews}>
              삭제
            </Button>
            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" onClick={() => { setIsEditMode(false); setEditNewsTitle(selectedNews?.title || ''); }}>
                    취소
                  </Button>
                  <Button onClick={handleSaveNewsTitle}>
                    저장
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditMode(true)}>
                  수정
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'document' 
                ? `"${selectedDocument?.name}" 문서를 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
                : `"${selectedNews?.title}" 기사를 삭제합니다. 이 작업은 되돌릴 수 없습니다.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
