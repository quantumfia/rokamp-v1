import { useState } from 'react';
import { Search, Download, Globe, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
import { toast } from '@/hooks/use-toast';
import { SystemSettingsSkeleton } from '@/components/skeletons';
import { PageHeader } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { cn } from '@/lib/utils';

// 감사 로그 Mock 데이터
const AUDIT_LOGS = [
  { id: 1, visitorId: '24-503994', userName: '김철수', rank: '대령', ip: '10.10.1.100', action: '로그인', target: '-', timestamp: '2024-12-14 09:15:23', status: 'success' },
  { id: 2, visitorId: '22-481523', userName: '이영희', rank: '소령', ip: '10.10.2.55', action: '보고서 조회', target: '12월 2주차 통계보고서', timestamp: '2024-12-14 09:12:45', status: 'success' },
  { id: 3, visitorId: '24-503994', userName: '김철수', rank: '대령', ip: '10.10.1.100', action: '사용자 생성', target: '23-824693', timestamp: '2024-12-14 08:55:12', status: 'success' },
  { id: 4, visitorId: '-', userName: '-', rank: '-', ip: '192.168.1.50', action: '로그인 시도', target: '-', timestamp: '2024-12-14 08:30:05', status: 'failed' },
  { id: 5, visitorId: '21-392847', userName: '박민수', rank: '중령', ip: '10.10.3.22', action: '데이터 조회', target: '제1사단 위험도', timestamp: '2024-12-14 08:22:18', status: 'success' },
  { id: 6, visitorId: '24-503994', userName: '김철수', rank: '대령', ip: '10.10.1.100', action: '공지사항 등록', target: '동절기 안전수칙', timestamp: '2024-12-13 17:45:30', status: 'success' },
  { id: 7, visitorId: '22-481523', userName: '이영희', rank: '소령', ip: '10.10.2.55', action: '로그아웃', target: '-', timestamp: '2024-12-13 17:30:00', status: 'success' },
];

// 허용 IP 대역 타입 및 초기 데이터
interface AllowedIP {
  id: string;
  ip: string;
  desc: string;
}

const INITIAL_ALLOWED_IPS: AllowedIP[] = [
  { id: '1', ip: '10.10.0.0/16', desc: '본부 네트워크' },
  { id: '2', ip: '10.20.0.0/16', desc: '사단급 네트워크' },
  { id: '3', ip: '10.30.0.0/16', desc: '대대급 네트워크' },
];

export default function SystemSettingsPage() {
  const isLoading = usePageLoading(800);
  
  // IP 화이트리스트 활성화 상태
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(true);
  const [allowedIPs, setAllowedIPs] = useState<AllowedIP[]>(INITIAL_ALLOWED_IPS);
  
  // IP 추가/수정 모달
  const [showIPModal, setShowIPModal] = useState(false);
  const [editingIP, setEditingIP] = useState<AllowedIP | null>(null);
  const [ipForm, setIpForm] = useState({ ip: '', desc: '' });
  
  // IP 삭제 다이얼로그
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ipToDelete, setIpToDelete] = useState<AllowedIP | null>(null);
  
  // 감사 로그 필터
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleExportLogs = () => {
    toast({
      title: '다운로드 시작',
      description: '감사 로그 파일을 다운로드합니다.',
    });
  };

  const handleForceLogout = (visitorId: string, userName: string) => {
    toast({
      title: '강제 로그아웃',
      description: `${userName} 사용자의 세션을 종료했습니다.`,
    });
  };

  // IP 추가 모달 열기
  const handleAddIP = () => {
    setEditingIP(null);
    setIpForm({ ip: '', desc: '' });
    setShowIPModal(true);
  };

  // IP 수정 모달 열기
  const handleEditIP = (ipItem: AllowedIP) => {
    setEditingIP(ipItem);
    setIpForm({ ip: ipItem.ip, desc: ipItem.desc });
    setShowIPModal(true);
  };

  // IP 저장 (추가 또는 수정)
  const handleSaveIP = () => {
    if (!ipForm.ip.trim()) {
      toast({
        title: '입력 오류',
        description: 'IP 대역을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (editingIP) {
      setAllowedIPs(prev => prev.map(item => 
        item.id === editingIP.id 
          ? { ...item, ip: ipForm.ip, desc: ipForm.desc }
          : item
      ));
      toast({
        title: '수정 완료',
        description: 'IP 대역이 수정되었습니다.',
      });
    } else {
      const newIP: AllowedIP = {
        id: Date.now().toString(),
        ip: ipForm.ip,
        desc: ipForm.desc,
      };
      setAllowedIPs(prev => [...prev, newIP]);
      toast({
        title: '추가 완료',
        description: 'IP 대역이 추가되었습니다.',
      });
    }

    setShowIPModal(false);
    setIpForm({ ip: '', desc: '' });
    setEditingIP(null);
  };

  // IP 삭제 다이얼로그 열기
  const handleDeleteClick = (ipItem: AllowedIP) => {
    setIpToDelete(ipItem);
    setShowDeleteDialog(true);
  };

  // IP 삭제 확인
  const handleConfirmDelete = () => {
    if (ipToDelete) {
      setAllowedIPs(prev => prev.filter(item => item.id !== ipToDelete.id));
      toast({
        title: '삭제 완료',
        description: 'IP 대역이 삭제되었습니다.',
      });
    }
    setShowDeleteDialog(false);
    setIpToDelete(null);
  };

  const filteredLogs = AUDIT_LOGS.filter((log) =>
    log.userName.includes(logSearchQuery) || 
    log.visitorId.includes(logSearchQuery) ||
    log.action.includes(logSearchQuery) ||
    log.ip.includes(logSearchQuery)
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const handleLogSearchChange = (value: string) => {
    setLogSearchQuery(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <SystemSettingsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="보안/감사" 
        description="시스템 보안 정책 및 접속 이력 관리"
      />

      {/* 보안 정책 요약 + IP 제어 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 보안 정책 요약 */}
        <section className="border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium mb-3">보안 정책</h2>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p>• 비밀번호: 8자 이상, 대문자/특수문자/숫자 필수, 90일 주기 변경</p>
            <p>• 세션: 30분 타임아웃, 로그인 실패 5회 시 계정 잠금</p>
            <p>• 감사: 모든 접속/조회/변경 이력 365일 보관</p>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            정책 변경이 필요한 경우 시스템 관리팀에 문의하세요.
          </p>
        </section>

        {/* IP 접근 제어 */}
        <section className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">IP 접근 제어</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddIP}
                disabled={!ipWhitelistEnabled}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                추가
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">화이트리스트</span>
                <Switch 
                  checked={ipWhitelistEnabled}
                  onCheckedChange={setIpWhitelistEnabled}
                />
              </div>
            </div>
          </div>
          <div className={cn(
            "space-y-1.5 transition-opacity",
            !ipWhitelistEnabled && "opacity-50"
          )}>
            {allowedIPs.map((item) => (
              <div key={item.id} className="flex items-center justify-between group text-xs">
                <div className="flex items-center gap-2">
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{item.ip}</code>
                  <span className="text-muted-foreground">{item.desc}</span>
                </div>
                {ipWhitelistEnabled && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditIP(item)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="수정"
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 감사 로그 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">접속 이력</h2>
            <p className="text-xs text-muted-foreground">사용자 접속 및 활동 이력 (365일 보관)</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportLogs}>
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>

        {/* 필터 */}
        <div className="flex gap-3 py-3 border-y border-border">
          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="군번, 이름 또는 IP 주소 검색..."
              className="pl-9 bg-background"
              value={logSearchQuery}
              onChange={(e) => handleLogSearchChange(e.target.value)}
            />
          </div>
          <Input
            type="date"
            className="w-40 bg-background"
            value={logDateFrom}
            onChange={(e) => setLogDateFrom(e.target.value)}
          />
          <span className="flex items-center text-muted-foreground text-sm">~</span>
          <Input
            type="date"
            className="w-40 bg-background"
            value={logDateTo}
            onChange={(e) => setLogDateTo(e.target.value)}
          />
        </div>

        {/* 로그 테이블 */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-36">일시</TableHead>
              <TableHead className="text-xs w-24">군번</TableHead>
              <TableHead className="text-xs w-32 whitespace-nowrap">이름/계급</TableHead>
              <TableHead className="text-xs w-28">IP 주소</TableHead>
              <TableHead className="text-xs">수행 작업</TableHead>
              <TableHead className="text-xs">대상</TableHead>
              <TableHead className="text-xs w-14 text-center">상태</TableHead>
              <TableHead className="text-xs w-20 text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{log.timestamp}</TableCell>
                  <TableCell className="font-mono text-xs">{log.visitorId}</TableCell>
                  <TableCell className="text-sm">
                    {log.userName !== '-' ? `${log.userName} ${log.rank}` : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.target}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-xs",
                      log.status === 'success' ? 'text-foreground' : 'text-destructive'
                    )}>
                      {log.status === 'success' ? '성공' : '실패'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {log.status === 'success' && log.action === '로그인' && (
                      <button 
                        onClick={() => handleForceLogout(log.visitorId, log.userName)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        세션 종료
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              총 {filteredLogs.length}건 중 {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)}건
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
              
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          * 비인가 IP 접속 시도 시 관리자에게 자동 알림이 발송됩니다.
        </p>
      </section>

      {/* IP 추가/수정 모달 */}
      <Dialog open={showIPModal} onOpenChange={setShowIPModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIP ? 'IP 대역 수정' : 'IP 대역 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">IP 대역 *</label>
              <Input
                placeholder="예: 10.10.0.0/16"
                value={ipForm.ip}
                onChange={(e) => setIpForm(prev => ({ ...prev, ip: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">설명</label>
              <Input
                placeholder="예: 본부 네트워크"
                value={ipForm.desc}
                onChange={(e) => setIpForm(prev => ({ ...prev, desc: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIPModal(false)}>
              취소
            </Button>
            <Button onClick={handleSaveIP}>
              {editingIP ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IP 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>IP 대역 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {ipToDelete?.ip} ({ipToDelete?.desc})을(를) 삭제하시겠습니까?
              <br />
              삭제 후에는 해당 IP 대역에서의 접속이 차단될 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
