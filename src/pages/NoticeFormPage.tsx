import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Video, Paperclip, Upload, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';
import { usePageLoading } from '@/hooks/usePageLoading';

// Mock 데이터 (실제 구현 시 API에서 가져옴)
interface Notice {
  id: number;
  title: string;
  content: string;
  target: string;
  targetLabel: string;
  videoUrl: string;
  hasVideo: boolean;
  hasAttachment: boolean;
  createdAt: string;
  author: string;
  status: string;
}

const NOTICES: Notice[] = [
  { 
    id: 1, 
    title: '동절기 안전수칙 강화 안내', 
    content: '동절기 안전수칙을 강화하오니 각 부대에서는 철저히 준수하시기 바랍니다.\n\n1. 난방기구 사용 시 화재 예방\n2. 결빙 구역 미끄럼 주의\n3. 저체온증 예방 조치',
    target: 'all', 
    targetLabel: '전체',
    videoUrl: 'https://youtu.be/example1',
    hasVideo: true,
    hasAttachment: true,
    createdAt: '2024-12-13', 
    author: '김철수 대령',
    status: 'active'
  },
  { 
    id: 2, 
    title: '시스템 정기점검 안내 (12/20)', 
    content: '시스템 정기점검이 예정되어 있습니다.\n\n점검일시: 2024년 12월 20일 02:00 ~ 06:00\n점검내용: 서버 업데이트 및 보안 패치',
    target: 'all', 
    targetLabel: '전체',
    videoUrl: '',
    hasVideo: false,
    hasAttachment: false,
    createdAt: '2024-12-10', 
    author: '김철수 대령',
    status: 'active'
  },
];

export default function NoticeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoading = usePageLoading(500);
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('all');
  const [videoUrl, setVideoUrl] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      const notice = NOTICES.find(n => n.id === parseInt(id));
      if (notice) {
        setTitle(notice.title);
        setContent(notice.content);
        setTarget(notice.target);
        setVideoUrl(notice.videoUrl);
        setExistingAttachment(notice.hasAttachment);
      }
    }
  }, [id]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: '입력 오류',
        description: '제목과 내용을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (isEditMode) {
      toast({
        title: '공지 수정 완료',
        description: '공지사항이 수정되었습니다.',
      });
    } else {
      toast({
        title: '공지 등록 완료',
        description: '공지사항이 등록되었습니다. 대상자 로그인 시 팝업으로 표시됩니다.',
      });
    }
    navigate('/admin/notice');
  };

  const handleDelete = () => {
    toast({
      title: '공지 삭제',
      description: '공지사항이 삭제되었습니다.',
    });
    setShowDeleteDialog(false);
    navigate('/admin/notice');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-page-enter">
        <div className="h-10 w-48 bg-muted/30 rounded animate-pulse" />
        <div className="h-[600px] bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/notice')}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isEditMode ? '공지사항 수정' : '공지사항 추가'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditMode ? '공지 내용을 수정합니다' : '새 공지사항을 작성합니다'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              삭제
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-1.5" />
            {isEditMode ? '저장' : '등록'}
          </Button>
        </div>
      </div>

      {/* 폼 */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">제목 *</Label>
          <Input
            id="title"
            placeholder="공지 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">내용 *</Label>
          <Textarea
            id="content"
            placeholder="공지 내용을 입력하세요"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-background resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">발송 대상</Label>
            <select 
              value={target} 
              onChange={(e) => setTarget(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">전체 (전군)</option>
              <option value="division">예하 부대</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-sm font-medium">YouTube URL (선택)</Label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="video-url"
                placeholder="https://youtu.be/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-background pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">첨부파일 (선택)</Label>
          {!attachedFile && !existingAttachment ? (
            <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-muted-foreground hover:bg-muted/30 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">파일을 선택하거나 드래그하세요</span>
              <input
                type="file"
                accept=".hwp,.pdf,.docx,.xlsx,.pptx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {attachedFile ? attachedFile.name : '기존 첨부파일'}
                </span>
                {attachedFile && (
                  <span className="text-xs text-muted-foreground">
                    ({formatFileSize(attachedFile.size)})
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  setAttachedFile(null);
                  setExistingAttachment(false);
                }}
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 공지사항은 대상자 로그인 시 팝업으로 표시됩니다 ("오늘 하루 보지 않기" 선택 가능)</p>
            <p>• <strong>전체 발송</strong>: Super Admin 권한 필요 / <strong>예하 부대 발송</strong>: Admin 권한 이상</p>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{title}" 공지사항을 삭제하시겠습니까?<br />
              삭제된 공지사항은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
