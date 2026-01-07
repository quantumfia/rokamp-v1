import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, AlertTriangle } from 'lucide-react';
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
import { incidentSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// 폼 데이터 타입
type IncidentFormValues = z.infer<typeof incidentSchema>;

// Mock 데이터 (실제 구현 시 API에서 가져옴)
interface Incident {
  id: number;
  title: string;
  description: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  target: string;
  createdAt: string;
  author: string;
}

const INCIDENTS: Incident[] = [
  {
    id: 1,
    title: '훈련장 낙상 사고',
    description: '야간 훈련 중 불량한 조명으로 인해 병사가 넘어져 발목 부상',
    incidentDate: '2024-12-12',
    location: '제32보병사단 훈련장',
    category: '훈련',
    severity: 'medium',
    target: 'subordinate',
    createdAt: '2024-12-13',
    author: '김철수 대령',
  },
  {
    id: 2,
    title: '차량 경미 접촉 사고',
    description: '주차장에서 후진 중 다른 차량과 경미한 접촉, 인명피해 없음',
    incidentDate: '2024-12-11',
    location: '본부 주차장',
    category: '교통',
    severity: 'low',
    target: 'all',
    createdAt: '2024-12-12',
    author: '이영희 준장',
  },
];

export default function IncidentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoading = usePageLoading(500);
  const isEditMode = !!id;
  
  const canSendToAll = user?.role === 'ROLE_HQ';

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
  } = useFormValidation<IncidentFormValues>({
    initialValues: {
      title: '',
      description: '',
      incidentDate: '',
      location: '',
      category: '훈련',
      severity: 'low',
      target: 'subordinate',
    },
    schema: incidentSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async () => {
      if (isEditMode) {
        toast({
          title: '사고사례 수정 완료',
          description: '일일 사고사례가 수정되었습니다.',
        });
      } else {
        toast({
          title: '사고사례 등록 완료',
          description: '일일 사고사례가 등록되었습니다.',
        });
      }
      navigate('/admin/notice?tab=incidents');
    },
  });

  useEffect(() => {
    if (id) {
      const incident = INCIDENTS.find(i => i.id === parseInt(id));
      if (incident) {
        setMultipleValues({
          title: incident.title,
          description: incident.description,
          incidentDate: incident.incidentDate,
          location: incident.location,
          category: incident.category,
          severity: incident.severity,
          target: incident.target || 'subordinate',
        });
      }
    }
  }, [id, setMultipleValues]);

  const handleDelete = () => {
    toast({
      title: '사고사례 삭제',
      description: '일일 사고사례가 삭제되었습니다.',
    });
    setShowDeleteDialog(false);
    navigate('/admin/notice?tab=incidents');
  };

  const getSeverityColor = (sev: 'low' | 'medium' | 'high') => {
    switch (sev) {
      case 'low': return 'border-muted-foreground bg-muted text-muted-foreground';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-600';
      case 'high': return 'border-red-500 bg-red-500/10 text-red-600';
    }
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
            onClick={() => navigate('/admin/notice?tab=incidents')}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {isEditMode ? '사고사례 수정' : '사고사례 추가'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditMode ? '사고사례 내용을 수정합니다' : '새 일일 사고사례를 작성합니다'}
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
        {/* 일일 사고사례 표시 형식 안내 */}
        <div className="px-3 py-2 bg-muted/50 rounded-md border border-border">
          <p className="text-xs text-muted-foreground">
            <strong>일일 사고사례 표시:</strong> 심각도, (분류), 제목
          </p>
        </div>

        <FormField 
          label="심각도" 
          required
          error={getFieldError('severity', errors, touched)}
        >
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => handleChange('severity', sev)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 h-10 px-3 text-sm border rounded-md transition-colors",
                  values.severity === sev
                    ? getSeverityColor(sev)
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                {sev === 'low' ? '경미' : sev === 'medium' ? '보통' : '심각'}
              </button>
            ))}
          </div>
        </FormField>

        <FormField 
          label="제목" 
          required 
          error={getFieldError('title', errors, touched)}
        >
          <div className="flex gap-2">
            <select 
              value={values.category} 
              onChange={(e) => handleChange('category', e.target.value)}
              onBlur={() => handleBlur('category')}
              className="h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-w-[100px]"
            >
              <option value="훈련">훈련</option>
              <option value="교통">교통</option>
              <option value="화재">화재</option>
              <option value="한랭질환">한랭질환</option>
              <option value="작업">작업</option>
              <option value="기타">기타</option>
            </select>
            <Input
              id="title"
              placeholder="사고사례 제목을 입력하세요"
              value={values.title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              className="bg-background flex-1"
            />
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-6">
          <FormField 
            label="발생일" 
            required
            error={getFieldError('incidentDate', errors, touched)}
          >
            <Input
              id="incident-date"
              type="date"
              value={values.incidentDate}
              onChange={(e) => handleChange('incidentDate', e.target.value)}
              onBlur={() => handleBlur('incidentDate')}
              className="bg-background"
            />
          </FormField>

          <FormField 
            label="발생장소" 
            required
            error={getFieldError('location', errors, touched)}
          >
            <Input
              id="location"
              placeholder="사고 발생 장소"
              value={values.location}
              onChange={(e) => handleChange('location', e.target.value)}
              onBlur={() => handleBlur('location')}
              className="bg-background"
            />
          </FormField>
        </div>

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
          label="내용" 
          required 
          error={getFieldError('description', errors, touched)}
        >
          <RichTextEditor
            value={values.description}
            onChange={(value) => handleChange('description', value)}
            onBlur={() => handleBlur('description')}
            placeholder="사고 발생 경위, 피해 상황, 조치 내용 등을 상세히 작성하세요"
            error={!!getFieldError('description', errors, touched)}
          />
        </FormField>

        {/* 안내 */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 일일 사고사례는 안전교육 자료로 활용됩니다</p>
            <p>• 심각도에 따라 상위 보고 대상이 결정됩니다</p>
            <p>• <strong>심각</strong>: 즉시 보고 / <strong>보통</strong>: 당일 보고 / <strong>경미</strong>: 주간 보고</p>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사고사례 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{values.title}" 사고사례를 삭제하시겠습니까?<br />
              삭제된 사고사례는 복구할 수 없습니다.
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