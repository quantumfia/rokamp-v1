import { useState } from 'react';
import { Plus, Trash2, Eye, Edit2, Video, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { cn } from '@/lib/utils';

// 공지사항 Mock 데이터
const NOTICES = [
  { 
    id: 1, 
    title: '동절기 안전수칙 강화 안내', 
    target: 'all', 
    targetLabel: '전체',
    isPopup: true, 
    hasVideo: true,
    hasAttachment: true,
    createdAt: '2024-12-13', 
    author: '김철수 대령',
    status: 'active'
  },
  { 
    id: 2, 
    title: '시스템 정기점검 안내 (12/20)', 
    target: 'all', 
    targetLabel: '전체',
    isPopup: false, 
    hasVideo: false,
    hasAttachment: false,
    createdAt: '2024-12-10', 
    author: '김철수 대령',
    status: 'active'
  },
  { 
    id: 3, 
    title: '야외훈련 간 사고예방 1분 안전학습', 
    target: 'division', 
    targetLabel: '제32보병사단',
    isPopup: true, 
    hasVideo: true,
    hasAttachment: true,
    createdAt: '2024-12-08', 
    author: '이영희 준장',
    status: 'active'
  },
  { 
    id: 4, 
    title: '12월 안전사고 예방 캠페인', 
    target: 'all', 
    targetLabel: '전체',
    isPopup: false, 
    hasVideo: false,
    hasAttachment: true,
    createdAt: '2024-12-05', 
    author: '김철수 대령',
    status: 'expired'
  },
];

// 역할에 따른 발송 대상 옵션
const TARGET_OPTIONS = [
  { value: 'all', label: '전체 (전군)', roleRequired: 'super_admin' },
  { value: 'division', label: '예하 부대', roleRequired: 'admin' },
];

export default function NoticeManagementPage() {
  const isLoading = usePageLoading(800);
  const [showForm, setShowForm] = useState(false);
  
  // 폼 상태
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTarget, setNoticeTarget] = useState('all');
  const [isPopup, setIsPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handlePublishNotice = () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      toast({
        title: '입력 오류',
        description: '제목과 내용을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: '공지 등록 완료',
      description: isPopup ? '로그인 시 팝업으로 표시됩니다.' : '공지사항이 등록되었습니다.',
    });
    setNoticeTitle('');
    setNoticeContent('');
    setIsPopup(false);
    setVideoUrl('');
    setShowForm(false);
  };

  const handleDeleteNotice = (id: number) => {
    toast({
      title: '공지 삭제',
      description: '공지사항이 삭제되었습니다.',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-page-enter">
        <div className="h-20 bg-muted/30 rounded-lg animate-pulse" />
        <div className="h-96 bg-muted/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="공지사항 관리" 
        description="부대별 공지사항 작성 및 발송 관리"
        actions={
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            새 공지 작성
          </Button>
        }
      />

      {/* 공지 작성 폼 */}
      {showForm && (
        <section className="border border-border rounded-lg p-5 space-y-4 bg-card">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">새 공지사항 작성</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              취소
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 좌측: 기본 정보 */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="notice-title" className="text-xs text-muted-foreground">제목</Label>
                <Input
                  id="notice-title"
                  placeholder="공지 제목을 입력하세요"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notice-content" className="text-xs text-muted-foreground">내용</Label>
                <Textarea
                  id="notice-content"
                  placeholder="공지 내용을 입력하세요"
                  rows={6}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">발송 대상</Label>
                <select 
                  value={noticeTarget} 
                  onChange={(e) => setNoticeTarget(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {TARGET_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  * Super Admin: 전군 발송 가능 / Admin: 예하 부대만 발송 가능
                </p>
              </div>
            </div>

            {/* 우측: 추가 옵션 */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="video-url" className="text-xs text-muted-foreground">
                  YouTube 영상 URL (선택)
                </Label>
                <Input
                  id="video-url"
                  placeholder="https://youtu.be/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">첨부파일 (선택)</Label>
                <div className="border border-dashed border-border rounded-lg p-4 text-center">
                  <Paperclip className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    파일을 드래그하거나 클릭하여 업로드
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 border-t border-border">
                <Checkbox 
                  id="popup" 
                  checked={isPopup}
                  onCheckedChange={(checked) => setIsPopup(checked === true)}
                />
                <div>
                  <Label htmlFor="popup" className="text-sm font-medium">로그인 시 팝업 노출</Label>
                  <p className="text-xs text-muted-foreground">체크 시 대상자에게 강제 팝업 표시</p>
                </div>
              </div>

              <Button variant="default" className="w-full" onClick={handlePublishNotice}>
                공지사항 등록
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="py-4 text-center border-b border-border">
          <p className="text-2xl font-semibold tabular-nums">{NOTICES.length}</p>
          <p className="text-xs text-muted-foreground">전체 공지</p>
        </div>
        <div className="py-4 text-center border-b border-border">
          <p className="text-2xl font-semibold tabular-nums">
            {NOTICES.filter(n => n.status === 'active').length}
          </p>
          <p className="text-xs text-muted-foreground">활성 공지</p>
        </div>
        <div className="py-4 text-center border-b border-border">
          <p className="text-2xl font-semibold tabular-nums">
            {NOTICES.filter(n => n.isPopup).length}
          </p>
          <p className="text-xs text-muted-foreground">팝업 공지</p>
        </div>
      </div>

      {/* 공지 목록 */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">등록된 공지사항</h2>
          <p className="text-xs text-muted-foreground">공지사항 목록 및 관리</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-t border-border">
              <TableHead className="text-xs">제목</TableHead>
              <TableHead className="text-xs w-28">발송 대상</TableHead>
              <TableHead className="text-xs w-20 text-center">팝업</TableHead>
              <TableHead className="text-xs w-16 text-center">첨부</TableHead>
              <TableHead className="text-xs w-24">등록일</TableHead>
              <TableHead className="text-xs w-24">작성자</TableHead>
              <TableHead className="text-xs w-16 text-center">상태</TableHead>
              <TableHead className="text-xs w-20 text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {NOTICES.map((notice) => (
              <TableRow key={notice.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{notice.title}</span>
                    {notice.hasVideo && (
                      <Video className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {notice.targetLabel}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "text-xs",
                    notice.isPopup ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {notice.isPopup ? '●' : '○'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {notice.hasAttachment && (
                    <Paperclip className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {notice.createdAt}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {notice.author}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded",
                    notice.status === 'active' 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {notice.status === 'active' ? '활성' : '만료'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button 
                      className="p-1 hover:bg-muted rounded transition-colors"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* 안내 */}
      <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
        <p>• <strong>전체 발송</strong>: Super Admin 권한 필요 (육군본부 담당자)</p>
        <p>• <strong>예하 부대 발송</strong>: Admin 권한 이상 (사단급 이상)</p>
        <p>• 팝업 공지는 대상자 로그인 시 강제 표시되며, "오늘 하루 보지 않기" 선택 가능</p>
      </div>
    </div>
  );
}
