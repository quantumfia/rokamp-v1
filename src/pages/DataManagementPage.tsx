import { useState } from 'react';
import { Settings2, FileText, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DataManagementSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation, ActionButton, AddModal, FileDropZone } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
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

// 상태 라벨
function StatusLabel({ status }: { status: 'completed' | 'processing' | 'failed' }) {
  const labels = {
    completed: '완료',
    processing: '처리중',
    failed: '실패',
  };
  return <span className="text-sm text-muted-foreground">{labels[status]}</span>;
}

// 문서 인터페이스
interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'completed' | 'processing' | 'failed';
  chunks: number;
  fileName: string; // 원본 파일명
}

// 문서 데이터
const initialDocumentData: Document[] = [
  { id: 1, name: '육군 안전관리 규정 v2.3', type: 'PDF', size: '2.4MB', uploadedAt: '2024-12-10 14:30', status: 'completed', chunks: 128, fileName: '육군_안전관리_규정_v2.3.pdf' },
  { id: 2, name: '동절기 안전수칙 매뉴얼', type: 'HWP', size: '1.8MB', uploadedAt: '2024-12-08 09:15', status: 'completed', chunks: 85, fileName: '동절기_안전수칙_매뉴얼.hwp' },
  { id: 3, name: '차량 운행 및 정비 매뉴얼', type: 'PDF', size: '5.2MB', uploadedAt: '2024-12-14 11:00', status: 'processing', chunks: 0, fileName: '차량_운행_및_정비_매뉴얼.pdf' },
  { id: 4, name: '사격훈련 안전수칙', type: 'PDF', size: '3.1MB', uploadedAt: '2024-12-07 16:45', status: 'completed', chunks: 156, fileName: '사격훈련_안전수칙.pdf' },
  { id: 5, name: '야간훈련 지침서', type: 'HWP', size: '1.2MB', uploadedAt: '2024-12-05 10:20', status: 'completed', chunks: 62, fileName: '야간훈련_지침서.hwp' },
];

// 뉴스 인터페이스
interface NewsArticle {
  id: number;
  title: string;
  source: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
  embeddings: number;
  content?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
}

// 뉴스 데이터
const initialNewsData: NewsArticle[] = [
  { id: 1, title: '군 안전사고 예방 종합대책 발표', source: '국방일보', date: '2024-12-13', status: 'completed', embeddings: 45, content: '국방부가 오늘 군 안전사고 예방을 위한 종합대책을 발표했다. 이번 대책에는 훈련장 안전시설 점검 강화, 안전교육 의무화, 사고 발생 시 신속대응 체계 구축 등이 포함되어 있다.', fileName: '군_안전사고_예방.pdf', fileType: 'PDF', fileSize: '1.2MB' },
  { id: 2, title: '동절기 한파 대비 안전수칙 강화', source: '연합뉴스', date: '2024-12-12', status: 'completed', embeddings: 32, content: '기상청이 올겨울 한파가 평년보다 강할 것으로 예상됨에 따라 군에서는 동절기 안전수칙을 대폭 강화한다고 밝혔다. 특히 야간 경계근무자의 방한장비 지급과 난방시설 점검이 중점적으로 이뤄질 예정이다.' },
  { id: 3, title: '육군 훈련장 안전점검 결과 보고', source: '국방일보', date: '2024-12-11', status: 'completed', embeddings: 28, content: '육군본부는 전국 주요 훈련장에 대한 안전점검 결과를 발표했다. 점검 결과 대부분의 훈련장이 안전기준을 충족하고 있으나, 일부 시설에 대해서는 보수가 필요한 것으로 나타났다.' },
  { id: 4, title: '국방부 안전관리 혁신방안 추진', source: 'YTN', date: '2024-12-10', status: 'processing', embeddings: 0 },
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
        <label className="block text-xs text-muted-foreground mb-1.5">기사 제목 *</label>
        <input
          type="text"
          value={newsTitle}
          onChange={(e) => onNewsTitleChange(e.target.value)}
          placeholder="기사 제목을 입력하세요"
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
        <label className="block text-xs text-muted-foreground mb-1.5">기사 제목 *</label>
        <input
          type="text"
          value={newsTitle}
          onChange={(e) => onNewsTitleChange(e.target.value)}
          placeholder="기사 제목을 입력하세요"
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

const DATA_TABS = [
  { id: 'documents', label: '문서 관리' },
  { id: 'news', label: '언론 기사 관리' },
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
  const [jsonInput, setJsonInput] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [newsTitle, setNewsTitle] = useState('');
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

  if (isLoading) {
    return <DataManagementSkeleton />;
  }

  // 탭별 모달 설정
  const modalConfig = activeTab === 'documents' 
    ? {
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
      }
    : {
        title: '기사 추가',
        description: '언론 기사를 업로드하거나 직접 입력합니다',
        inputTypes: [
          { id: 'file', label: '파일 업로드', content: <NewsFileUploadForm newsTitle={newsTitle} onNewsTitleChange={setNewsTitle} /> },
          { id: 'text', label: '텍스트 입력', content: <NewsTextInputForm newsTitle={newsTitle} onNewsTitleChange={setNewsTitle} value={jsonInput} onChange={setJsonInput} /> },
        ],
        onSubmit: handleNewsUpload,
      };

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="데이터 관리" 
        description="문서 및 언론 기사 학습 데이터 관리"
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChunkSettings(true)}
              className="gap-1.5"
            >
              <Settings2 className="w-4 h-4" />
              청크 설정
            </Button>
            <ActionButton 
              label={activeTab === 'documents' ? '문서 추가' : '기사 추가'} 
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
              총 {documents.length}개 문서 · {documents.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.chunks, 0)}개 청크
            </span>
          </div>

          <Table>
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
                    {doc.status === 'completed' ? doc.chunks : '-'}
                  </TableCell>
                  <TableCell><StatusLabel status={doc.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 언론 기사 관리 탭 */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">학습된 뉴스 목록</h2>
            <span className="text-xs text-muted-foreground">
              총 {newsArticles.length}개 기사 · {newsArticles.filter(n => n.status === 'completed').reduce((sum, n) => sum + n.embeddings, 0)}개 임베딩
            </span>
          </div>

          <Table>
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
                    {news.status === 'completed' ? news.embeddings : '-'}
                  </TableCell>
                  <TableCell><StatusLabel status={news.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 추가 모달 */}
      <AddModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setJsonInput('');
          setDocumentName('');
          setNewsTitle('');
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
                  {selectedDocument?.status === 'completed' ? selectedDocument.chunks : '-'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">상태</label>
              <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                {selectedDocument?.status === 'completed' ? '완료' : selectedDocument?.status === 'processing' ? '처리중' : '실패'}
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
            {/* 업로드된 파일 (있을 경우) */}
            {selectedNews?.fileName && (
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

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">기사 제목</label>
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

            {selectedNews?.content && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">본문</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md max-h-32 overflow-y-auto">{selectedNews.content}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">임베딩 수</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                  {selectedNews?.status === 'completed' ? selectedNews.embeddings : '-'}
                </p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">상태</label>
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                  {selectedNews?.status === 'completed' ? '완료' : selectedNews?.status === 'processing' ? '처리중' : '실패'}
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