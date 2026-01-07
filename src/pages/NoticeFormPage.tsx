import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Video, Link2, Plus, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/common';
import { RichTextEditor } from '@/components/common/RichTextEditor';
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
import { useFormValidation, getFieldError } from '@/hooks/useFormValidation';
import { useAuth } from '@/contexts/AuthContext';
import { noticeSchema } from '@/lib/validation';
import { z } from 'zod';

// 폼 데이터 타입
interface AttachmentLink {
  id: string;
  name: string;
  url: string;
}

// 내부 폼에서 사용할 타입
interface NoticeFormValues {
  title: string;
  content: string;
  target: string;
  videoUrl: string;
  attachments: AttachmentLink[];
  [key: string]: unknown;
}

// attachments를 포함한 스키마
const noticeFormSchema = noticeSchema.extend({
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
  })).optional(),
});

// Mock 데이터 (실제 구현 시 API에서 가져옴)
interface Notice {
  id: number;
  title: string;
  content: string;
  target: string;
  targetLabel: string;
  videoUrl: string;
  hasVideo: boolean;
  attachments: AttachmentLink[];
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
    attachments: [
      { id: '1', name: '동절기_안전수칙_체크리스트.pdf', url: 'https://portal.cstec.kr/docs/winter-safety' },
    ],
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
    attachments: [],
    createdAt: '2024-12-10', 
    author: '김철수 대령',
    status: 'active'
  },
];

export default function NoticeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoading = usePageLoading(500);
  const isEditMode = !!id;

  // 첨부 링크 입력 상태 (별도 관리)
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 폼 검증 훅 사용
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setMultipleValues,
  } = useFormValidation<NoticeFormValues>({
    initialValues: {
      title: '',
      content: '',
      target: 'subordinate',
      videoUrl: '',
      attachments: [],
    },
    schema: noticeFormSchema as z.ZodSchema<NoticeFormValues>,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (formValues) => {
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
    },
  });

  // 역할에 따른 발송 대상 옵션
  const canSendToAll = user?.role === 'ROLE_HQ';

  useEffect(() => {
    if (id) {
      const notice = NOTICES.find(n => n.id === parseInt(id));
      if (notice) {
        setMultipleValues({
          title: notice.title,
          content: notice.content,
          target: notice.target,
          videoUrl: notice.videoUrl,
          attachments: notice.attachments || [],
        });
      }
    }
  }, [id, setMultipleValues]);

  const handleDelete = () => {
    toast({
      title: '공지 삭제',
      description: '공지사항이 삭제되었습니다.',
    });
    setShowDeleteDialog(false);
    navigate('/admin/notice');
  };

  const handleAddLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) {
      toast({
        title: '입력 오류',
        description: '링크 이름과 URL을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const newAttachment: AttachmentLink = {
      id: Date.now().toString(),
      name: newLinkName.trim(),
      url: newLinkUrl.trim(),
    };

    handleChange('attachments', [...(values.attachments || []), newAttachment]);
    setNewLinkName('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (linkId: string) => {
    handleChange('attachments', (values.attachments || []).filter(a => a.id !== linkId));
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
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isEditMode ? '저장' : '등록'}
          </Button>
        </div>
      </div>

      {/* 폼 */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <FormField 
          label="제목" 
          required 
          error={getFieldError('title', errors, touched)}
        >
          <Input
            id="title"
            placeholder="공지 제목을 입력하세요"
            value={values.title}
            onChange={(e) => handleChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            className="bg-background"
          />
        </FormField>

        <FormField 
          label="내용" 
          required 
          error={getFieldError('content', errors, touched)}
        >
          <RichTextEditor
            value={values.content}
            onChange={(value) => handleChange('content', value)}
            onBlur={() => handleBlur('content')}
            placeholder="공지 내용을 입력하세요"
            error={!!getFieldError('content', errors, touched)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-6">
          <FormField 
            label="발송 대상"
            error={getFieldError('target', errors, touched)}
          >
            <select 
              value={values.target} 
              onChange={(e) => handleChange('target', e.target.value)}
              onBlur={() => handleBlur('target')}
              className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {canSendToAll && <option value="all">전체 (전군)</option>}
              <option value="subordinate">예하 부대</option>
            </select>
            {!canSendToAll && (
              <p className="text-[10px] text-muted-foreground">
                전체 발송은 본부 관리자만 가능합니다.
              </p>
            )}
          </FormField>

          <FormField 
            label="YouTube URL (선택)"
            error={getFieldError('videoUrl', errors, touched)}
          >
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="video-url"
                placeholder="https://youtu.be/..."
                value={values.videoUrl || ''}
                onChange={(e) => handleChange('videoUrl', e.target.value)}
                onBlur={() => handleBlur('videoUrl')}
                className="bg-background pl-10"
              />
            </div>
          </FormField>
        </div>

        {/* 첨부 링크 섹션 */}
        <div className="space-y-3">
          <FormField label="첨부 링크 (선택)" hint="관련 문서가 있는 외부 페이지 링크를 추가합니다.">
            <div className="flex gap-2">
              <Input
                placeholder="링크 이름 (예: 안전수칙 체크리스트)"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                className="bg-background flex-1"
              />
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="bg-background pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddLink}
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </FormField>

          {/* 추가된 링크 목록 */}
          {(values.attachments || []).length > 0 && (
            <div className="space-y-2">
              {(values.attachments || []).map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between px-4 py-2.5 border border-border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm block truncate">{attachment.name}</span>
                      <span className="text-xs text-muted-foreground block truncate">{attachment.url}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveLink(attachment.id)}
                    className="p-1.5 hover:bg-muted rounded transition-colors shrink-0 ml-2"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 공지사항은 대상자 로그인 시 팝업으로 표시됩니다 ("오늘 하루 보지 않기" 선택 가능)</p>
            <p>• <strong>전체 발송</strong>: 본부 관리자(HQ) 권한 필요 / <strong>예하 부대 발송</strong>: 사단급 이상 관리자</p>
            <p>• 첨부 링크는 포털 사이트나 관련 문서 페이지의 URL을 입력합니다</p>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{values.title}" 공지사항을 삭제하시겠습니까?<br />
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