import { useState } from 'react';
import { Search, Download, Globe, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ShieldAlert } from 'lucide-react';
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
import type { AlertSeverity, AlertStatus, AllowedIP, SecurityAlert, ActiveSession } from '@/types/entities';

// 감사 로그 Mock 데이터
const AUDIT_LOGS = [
  { id: 1, accountId: 'HQ-001', militaryId: '18-702341', userName: '김철수', rank: '대령', ipAddress: '10.10.1.100', action: '로그인', target: '-', timestamp: '2024-12-14 09:15:23', status: 'success' },
  { id: 2, accountId: 'C1D1-001', militaryId: '17-681542', userName: '이영희', rank: '소령', ipAddress: '10.10.2.55', action: '보고서 조회', target: '12월 2주차 통계보고서', timestamp: '2024-12-14 09:12:45', status: 'success' },
  { id: 3, accountId: 'HQ-001', militaryId: '18-702341', userName: '김철수', rank: '대령', ipAddress: '10.10.1.100', action: '사용자 생성', target: 'SWC-001', timestamp: '2024-12-14 08:55:12', status: 'success' },
  { id: 4, accountId: '-', militaryId: '-', userName: '-', rank: '-', ipAddress: '192.168.1.50', action: '로그인 시도', target: '-', timestamp: '2024-12-14 08:30:05', status: 'failed' },
  { id: 5, accountId: 'C3D12-001', militaryId: '21-392847', userName: '박민수', rank: '중령', ipAddress: '10.10.3.22', action: '데이터 조회', target: '제1사단 위험도', timestamp: '2024-12-14 08:22:18', status: 'success' },
  { id: 6, accountId: 'HQ-001', militaryId: '18-702341', userName: '김철수', rank: '대령', ipAddress: '10.10.1.100', action: '공지사항 등록', target: '동절기 안전수칙', timestamp: '2024-12-13 17:45:30', status: 'success' },
  { id: 7, accountId: 'C1D1-001', militaryId: '17-681542', userName: '이영희', rank: '소령', ipAddress: '10.10.2.55', action: '로그아웃', target: '-', timestamp: '2024-12-13 17:30:00', status: 'success' },
  { id: 8, accountId: 'C3D12-001', militaryId: '21-392847', userName: '박민수', rank: '중령', ipAddress: '10.10.3.22', action: '로그인', target: '-', timestamp: '2024-12-13 14:20:15', status: 'success' },
  { id: 9, accountId: 'C2D7-001', militaryId: '23-567821', userName: '최정훈', rank: '대위', ipAddress: '10.10.4.88', action: '보고서 생성', target: '12월 1주차 사고보고서', timestamp: '2024-12-13 11:45:22', status: 'success' },
  { id: 10, accountId: '-', militaryId: '-', userName: '-', rank: '-', ipAddress: '172.16.5.100', action: '로그인 시도', target: '-', timestamp: '2024-12-13 10:15:33', status: 'failed' },
  { id: 11, accountId: 'HQ-001', militaryId: '18-702341', userName: '김철수', rank: '대령', ipAddress: '10.10.1.100', action: '권한 변경', target: 'C1D1-001', timestamp: '2024-12-12 16:30:45', status: 'success' },
  { id: 12, accountId: 'C1D1-001', militaryId: '17-681542', userName: '이영희', rank: '소령', ipAddress: '10.10.2.55', action: '데이터 조회', target: '제2사단 통계', timestamp: '2024-12-12 15:22:10', status: 'success' },
  { id: 13, accountId: 'C1D9-001', militaryId: '20-284756', userName: '정대호', rank: '중위', ipAddress: '10.10.5.33', action: '로그인', target: '-', timestamp: '2024-12-12 14:10:05', status: 'success' },
  { id: 14, accountId: 'C1D9-001', militaryId: '20-284756', userName: '정대호', rank: '중위', ipAddress: '10.10.5.33', action: '예보 조회', target: '12월 3주차 예보', timestamp: '2024-12-12 14:15:30', status: 'success' },
  { id: 15, accountId: 'C2D7-001', militaryId: '23-567821', userName: '최정훈', rank: '대위', ipAddress: '10.10.4.88', action: '로그아웃', target: '-', timestamp: '2024-12-12 13:00:00', status: 'success' },
  { id: 16, accountId: 'C3D12-001', militaryId: '21-392847', userName: '박민수', rank: '중령', ipAddress: '10.10.3.22', action: '공지사항 수정', target: '겨울철 훈련 유의사항', timestamp: '2024-12-11 17:45:12', status: 'success' },
  { id: 17, accountId: '-', militaryId: '-', userName: '-', rank: '-', ipAddress: '192.168.100.5', action: '로그인 시도', target: '-', timestamp: '2024-12-11 09:05:55', status: 'failed' },
];

const SECURITY_ALERTS: SecurityAlert[] = [
  { id: 'SEC-24012', type: 'UNAUTHORIZED_IP', severity: 'CRITICAL', status: 'NEW', message: '비인가 IP 접속 시도', createdAt: '2024-12-14 09:30' },
  { id: 'SEC-24011', type: 'ADMIN_LOGIN_FAIL', severity: 'WARNING', status: 'INVESTIGATING', message: '관리자 계정 비정상 로그인 실패', createdAt: '2024-12-14 08:55' },
  { id: 'SEC-24010', type: 'ACCESS_POLICY_VIOLATION', severity: 'NOTICE', status: 'RESOLVED', message: '지휘통제망 접근 정책 위반', createdAt: '2024-12-13 21:12' },
  { id: 'SEC-24009', type: 'MALWARE_BLOCK', severity: 'INFO', status: 'FALSE_POSITIVE', message: '악성 코드 차단', createdAt: '2024-12-13 16:40' },
];

const ACTIVE_SESSIONS: ActiveSession[] = [
  { id: 'S-1001', userId: 'b7b908a2-9a2e-4f5f-81be-36f5c7f6f031', token: 'token-4h5s7k1', expiresAt: '2024-12-14 10:00', createdAt: '2024-12-14 08:00' },
  { id: 'S-1002', userId: '41d8d2f0-2f7c-4c52-9d29-4efb26b7d32c', token: 'token-2f9p0c3', expiresAt: '2024-12-14 09:10', createdAt: '2024-12-14 07:40' },
  { id: 'S-1003', userId: '0a5e9a3e-3124-4c7c-bb4a-4e3570f2fd62', token: 'token-8z2k1m4', expiresAt: '2024-12-14 11:40', createdAt: '2024-12-14 08:15' },
  { id: 'S-1004', userId: '7d9f7a48-5a0b-4f30-b3ad-0bb7f3d2ac21', token: 'token-9v4q3w7', expiresAt: '2024-12-14 09:30', createdAt: '2024-12-14 06:55' },
];

const ACTIVE_SESSIONS: ActiveSession[] = [
  { id: 'S-1001', accountId: 'HQ-001', userName: '김철수', rank: '대령', ip: '10.10.1.100', device: 'DESKTOP', lastActive: '2분 전', status: 'ACTIVE' },
  { id: 'S-1002', accountId: 'C1D1-001', userName: '이영희', rank: '준장', ip: '10.20.3.12', device: 'DESKTOP', lastActive: '10분 전', status: 'IDLE' },
  { id: 'S-1003', accountId: 'C2D7-001', userName: '최정훈', rank: '대위', ip: '10.40.4.88', device: 'MOBILE', lastActive: '1분 전', status: 'ACTIVE' },
  { id: 'S-1004', accountId: 'SWC-001', userName: '강특전', rank: '중령', ip: '10.60.7.21', device: 'MOBILE', lastActive: '5분 전', status: 'ACTIVE' },
];

const INITIAL_ALLOWED_IPS: AllowedIP[] = [
  { id: '1', ipAddress: '10.10.0.0/16', unitName: '육군본부', createdAt: '2024-01-01' },
  { id: '2', ipAddress: '10.20.0.0/16', unitName: '제1군단', createdAt: '2024-01-01' },
  { id: '3', ipAddress: '10.30.0.0/16', unitName: '제2군단', createdAt: '2024-01-01' },
  { id: '4', ipAddress: '10.40.0.0/16', unitName: '제3군단', createdAt: '2024-01-01' },
  { id: '5', ipAddress: '10.50.0.0/16', unitName: '수도군단', createdAt: '2024-01-01' },
  { id: '6', ipAddress: '10.60.0.0/16', unitName: '제5군단', createdAt: '2024-01-01' },
  { id: '7', ipAddress: '10.70.0.0/16', unitName: '제7군단', createdAt: '2024-01-01' },
];

export default function SystemSettingsPage() {
  const isLoading = usePageLoading(800);
  
  // IP 화이트리스트 활성화 상태
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(true);
  const [allowedIPs, setAllowedIPs] = useState<AllowedIP[]>(INITIAL_ALLOWED_IPS);
  
  // IP 추가/수정 모달
  const [showIPModal, setShowIPModal] = useState(false);
  const [editingIP, setEditingIP] = useState<AllowedIP | null>(null);
  const [ipForm, setIpForm] = useState({ ipAddress: '', unitName: '' });
  
  // IP 삭제 다이얼로그
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ipToDelete, setIpToDelete] = useState<AllowedIP | null>(null);
  
  // IP 검색 및 페이지네이션
  const [ipSearchQuery, setIpSearchQuery] = useState('');
  const [ipCurrentPage, setIpCurrentPage] = useState(1);
  const ipItemsPerPage = 5;
  
  // 감사 로그 필터
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');
  
  // 감사 로그 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const securitySeverityLabel: Record<AlertSeverity, string> = {
    INFO: '정보',
    NOTICE: '공지',
    WARNING: '경고',
    CRITICAL: '심각',
    EMERGENCY: '긴급',
  };

  const securitySeverityClass: Record<AlertSeverity, string> = {
    INFO: 'text-foreground bg-muted',
    NOTICE: 'text-blue-600 bg-blue-50',
    WARNING: 'text-amber-600 bg-amber-50',
    CRITICAL: 'text-red-600 bg-red-50',
    EMERGENCY: 'text-red-700 bg-red-100',
  };

  const securityStatusLabel: Record<AlertStatus, string> = {
    NEW: '신규',
    INVESTIGATING: '조사 중',
    RESOLVED: '해결',
    FALSE_POSITIVE: '오탐',
  };

  const handleExportLogs = () => {
    toast({
      title: '다운로드 시작',
      description: '감사 로그 파일을 다운로드합니다.',
    });
  };

  const handleForceLogout = (identifier: string, userName: string) => {
    toast({
      title: '강제 로그아웃',
      description: `${userName} 사용자의 세션을 종료했습니다. (계정: ${identifier})`,
    });
  };

  // IP 추가 모달 열기
  const handleAddIP = () => {
    setEditingIP(null);
    setIpForm({ ipAddress: '', unitName: '' });
    setShowIPModal(true);
  };

  // IP 수정 모달 열기
  const handleEditIP = (ipItem: AllowedIP) => {
    setEditingIP(ipItem);
    setIpForm({ ipAddress: ipItem.ipAddress, unitName: ipItem.unitName ?? '' });
    setShowIPModal(true);
  };

  // IP 저장 (추가 또는 수정)
  const handleSaveIP = () => {
    if (!ipForm.ipAddress.trim()) {
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
          ? { ...item, ipAddress: ipForm.ipAddress, unitName: ipForm.unitName }
          : item
      ));
      toast({
        title: '수정 완료',
        description: 'IP 대역이 수정되었습니다.',
      });
    } else {
      const newIP: AllowedIP = {
        id: Date.now().toString(),
        ipAddress: ipForm.ipAddress,
        unitName: ipForm.unitName,
        createdAt: new Date().toISOString(),
      };
      setAllowedIPs(prev => [...prev, newIP]);
      toast({
        title: '추가 완료',
        description: 'IP 대역이 추가되었습니다.',
      });
    }

    setShowIPModal(false);
    setIpForm({ ipAddress: '', unitName: '' });
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

  // IP 필터링 및 페이지네이션
  const filteredIPs = allowedIPs.filter((ip) =>
    ip.ipAddress.includes(ipSearchQuery) || 
    (ip.unitName?.includes(ipSearchQuery) ?? false)
  );
  const ipTotalPages = Math.ceil(filteredIPs.length / ipItemsPerPage);
  const ipStartIndex = (ipCurrentPage - 1) * ipItemsPerPage;
  const ipEndIndex = ipStartIndex + ipItemsPerPage;
  const paginatedIPs = filteredIPs.slice(ipStartIndex, ipEndIndex);

  const handleIpSearchChange = (value: string) => {
    setIpSearchQuery(value);
    setIpCurrentPage(1);
  };

  // 감사 로그 필터링 및 페이지네이션
  const filteredLogs = AUDIT_LOGS.filter((log) =>
    log.userName.includes(logSearchQuery) || 
    log.accountId.includes(logSearchQuery) ||
    log.militaryId.includes(logSearchQuery) ||
    log.action.includes(logSearchQuery) ||
    log.ipAddress.includes(logSearchQuery)
  );
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

      {/* IP 접근 제어 - 테이블 형태 */}
      <section className="space-y-4 pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">IP 접근 제어</h2>
              <p className="text-xs text-muted-foreground">허용된 IP 대역 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddIP}
              disabled={!ipWhitelistEnabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              IP 추가
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">화이트리스트</span>
              <Switch 
                checked={ipWhitelistEnabled}
                onCheckedChange={setIpWhitelistEnabled}
              />
            </div>
          </div>
        </div>

        {/* IP 검색 */}
        <div className={cn(
          "transition-opacity",
          !ipWhitelistEnabled && "opacity-50 pointer-events-none"
        )}>
          <div className="flex gap-3 py-3 border-y border-border">
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="IP 대역 또는 설명 검색..."
                className="pl-9 bg-background"
                value={ipSearchQuery}
                onChange={(e) => handleIpSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* IP 테이블 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-48">IP 대역</TableHead>
                <TableHead className="text-xs">부대</TableHead>
                <TableHead className="text-xs w-24 text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIPs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {ipSearchQuery ? '검색 결과가 없습니다.' : '등록된 IP가 없습니다.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIPs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.ipAddress}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.unitName ?? '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditIP(item)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* IP 페이지네이션 */}
          {ipTotalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                총 {filteredIPs.length}건 중 {ipStartIndex + 1}-{Math.min(ipEndIndex, filteredIPs.length)}건
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIpCurrentPage(1)}
                  disabled={ipCurrentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIpCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={ipCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: ipTotalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (ipTotalPages <= 5) return true;
                    if (page === 1 || page === ipTotalPages) return true;
                    if (Math.abs(page - ipCurrentPage) <= 1) return true;
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
                          variant={ipCurrentPage === page ? "default" : "outline"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setIpCurrentPage(page)}
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
                  onClick={() => setIpCurrentPage(prev => Math.min(ipTotalPages, prev + 1))}
                  disabled={ipCurrentPage === ipTotalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIpCurrentPage(ipTotalPages)}
                  disabled={ipCurrentPage === ipTotalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 보안 알림 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">보안 알림</h2>
            <p className="text-xs text-muted-foreground">탐지된 보안 이벤트 모니터링</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-28">알림 ID</TableHead>
              <TableHead className="text-xs w-28">발생 시각</TableHead>
              <TableHead className="text-xs w-32">유형</TableHead>
              <TableHead className="text-xs">알림 내용</TableHead>
              <TableHead className="text-xs w-20 text-center">심각도</TableHead>
              <TableHead className="text-xs w-20 text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SECURITY_ALERTS.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-mono text-xs text-primary">{alert.id}</TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">{alert.createdAt}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{alert.type}</TableCell>
                <TableCell className="text-sm">{alert.message}</TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "text-[11px] font-medium px-2 py-1 rounded-full",
                    securitySeverityClass[alert.severity]
                  )}>
                    {securitySeverityLabel[alert.severity]}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-muted-foreground">
                    {securityStatusLabel[alert.status]}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* 세션 관리 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">세션 관리</h2>
            <p className="text-xs text-muted-foreground">현재 접속 중인 사용자 세션</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            toast({
              title: '세션 동기화',
              description: '세션 현황을 최신 상태로 동기화했습니다.',
            });
          }}>
            새로고침
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-40">사용자 ID</TableHead>
              <TableHead className="text-xs w-40">세션 토큰</TableHead>
              <TableHead className="text-xs w-28 text-center">만료 시각</TableHead>
              <TableHead className="text-xs w-16 text-center">상태</TableHead>
              <TableHead className="text-xs w-20 text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ACTIVE_SESSIONS.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-mono text-xs text-primary">{session.userId}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{session.token}</TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">{session.expiresAt}</TableCell>
                <TableCell className="text-center">
                  <span className="text-xs font-medium text-foreground">활성</span>
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleForceLogout(session.userId, session.userId)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    세션 종료
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

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
              placeholder="계정 ID, 군번, 이름 또는 IP 주소 검색..."
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
              <TableHead className="text-xs w-24">계정 ID</TableHead>
              <TableHead className="text-xs w-24">군번</TableHead>
              <TableHead className="text-xs w-28 whitespace-nowrap">이름/계급</TableHead>
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
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{log.timestamp}</TableCell>
                  <TableCell className="font-mono text-xs text-primary">{log.accountId}</TableCell>
                  <TableCell className="font-mono text-xs">{log.militaryId}</TableCell>
                  <TableCell className="text-sm">
                    {log.userName !== '-' ? `${log.userName} ${log.rank}` : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ipAddress}</TableCell>
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
                        onClick={() => handleForceLogout(log.accountId, log.userName)}
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
                value={ipForm.ipAddress}
                onChange={(e) => setIpForm(prev => ({ ...prev, ipAddress: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">부대</label>
              <Input
                placeholder="예: 육군본부"
                value={ipForm.unitName}
                onChange={(e) => setIpForm(prev => ({ ...prev, unitName: e.target.value }))}
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
              {ipToDelete?.ipAddress} ({ipToDelete?.unitName ?? '-'})을(를) 삭제하시겠습니까?
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
