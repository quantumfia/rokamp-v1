import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, AlertTriangle } from 'lucide-react';
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
import { cn } from '@/lib/utils';

// Mock 데이터 (실제 구현 시 API에서 가져옴)
interface Incident {
  id: number;
  title: string;
  description: string;
  incidentDate: string;
  location: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
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
    createdAt: '2024-12-12',
    author: '이영희 준장',
  },
];

export default function IncidentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoading = usePageLoading(500);
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('훈련');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      const incident = INCIDENTS.find(i => i.id === parseInt(id));
      if (incident) {
        setTitle(incident.title);
        setDescription(incident.description);
        setIncidentDate(incident.incidentDate);
        setLocation(incident.location);
        setCategory(incident.category);
        setSeverity(incident.severity);
      }
    }
  }, [id]);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: '입력 오류',
        description: '제목과 내용을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

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
  };

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
      case 'low': return 'border-green-500 bg-green-500/10 text-green-600';
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
            placeholder="사고사례 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">내용 *</Label>
          <Textarea
            id="description"
            placeholder="사고 발생 경위, 피해 상황, 조치 내용 등을 상세히 작성하세요"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="incident-date" className="text-sm font-medium">발생일</Label>
            <Input
              id="incident-date"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">발생장소</Label>
            <Input
              id="location"
              placeholder="사고 발생 장소"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">분류</Label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="훈련">훈련</option>
              <option value="교통">교통</option>
              <option value="화재">화재</option>
              <option value="한랭질환">한랭질환</option>
              <option value="작업">작업</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">심각도</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-10 px-3 text-sm border rounded-md transition-colors",
                    severity === sev
                      ? getSeverityColor(sev)
                      : "border-border bg-background hover:bg-muted"
                  )}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {sev === 'low' ? '경미' : sev === 'medium' ? '보통' : '심각'}
                </button>
              ))}
            </div>
          </div>
        </div>

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
              "{title}" 사고사례를 삭제하시겠습니까?<br />
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
