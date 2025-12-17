import { useState } from 'react';
import { Shield, Search, Download, Users, Lock, Clock, Globe, FileText } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';
import { SystemSettingsSkeleton } from '@/components/skeletons';
import { PageHeader, TabNavigation } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { cn } from '@/lib/utils';

// 감사 로그 Mock 데이터
const AUDIT_LOGS = [
  { id: 1, userId: 'admin01', userName: '김철수 대령', ip: '10.10.1.100', action: '로그인', target: '-', timestamp: '2024-12-14 09:15:23', status: 'success' },
  { id: 2, userId: 'user02', userName: '이영희 소령', ip: '10.10.2.55', action: '보고서 조회', target: '12월 2주차 통계보고서', timestamp: '2024-12-14 09:12:45', status: 'success' },
  { id: 3, userId: 'admin01', userName: '김철수 대령', ip: '10.10.1.100', action: '사용자 생성', target: 'user15', timestamp: '2024-12-14 08:55:12', status: 'success' },
  { id: 4, userId: 'unknown', userName: '-', ip: '192.168.1.50', action: '로그인 시도', target: '-', timestamp: '2024-12-14 08:30:05', status: 'failed' },
  { id: 5, userId: 'user03', userName: '박민수 중령', ip: '10.10.3.22', action: '데이터 조회', target: '제1사단 위험도', timestamp: '2024-12-14 08:22:18', status: 'success' },
  { id: 6, userId: 'admin01', userName: '김철수 대령', ip: '10.10.1.100', action: '공지사항 등록', target: '동절기 안전수칙', timestamp: '2024-12-13 17:45:30', status: 'success' },
  { id: 7, userId: 'user02', userName: '이영희 소령', ip: '10.10.2.55', action: '로그아웃', target: '-', timestamp: '2024-12-13 17:30:00', status: 'success' },
];

// 허용 IP 대역 Mock 데이터
const ALLOWED_IPS = [
  { ip: '10.10.0.0/16', desc: '본부 네트워크', canDelete: false },
  { ip: '10.20.0.0/16', desc: '사단급 네트워크', canDelete: false },
  { ip: '10.30.0.0/16', desc: '대대급 네트워크', canDelete: false },
];

const TABS = [
  { id: 'security', label: '보안 정책', icon: Shield },
  { id: 'audit', label: '감사 로그', icon: Users },
];

// 고정된 보안 정책 (읽기 전용)
const SECURITY_POLICIES = {
  password: {
    minLength: 8,
    changeInterval: 90,
    requireUppercase: true,
    requireSpecial: true,
    requireNumber: true,
    preventReuse: 5,
  },
  session: {
    timeout: 30,
    maxFailedAttempts: 5,
    singleSession: true,
  },
  audit: {
    logLogin: true,
    logDataAccess: true,
    logSettingsChange: true,
    retentionDays: 365,
  },
};

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('security');
  const isLoading = usePageLoading(800);
  
  // IP 화이트리스트 활성화 상태 (관리자 조작 가능)
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(true);
  
  // 감사 로그 필터
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');

  const handleExportLogs = () => {
    toast({
      title: '다운로드 시작',
      description: '감사 로그 파일을 다운로드합니다.',
    });
  };

  const handleForceLogout = (userId: string, userName: string) => {
    toast({
      title: '강제 로그아웃',
      description: `${userName} 사용자의 세션을 종료했습니다.`,
    });
  };

  const filteredLogs = AUDIT_LOGS.filter((log) =>
    log.userName.includes(logSearchQuery) || 
    log.userId.includes(logSearchQuery) ||
    log.action.includes(logSearchQuery)
  );

  if (isLoading) {
    return <SystemSettingsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="보안/감사" 
        description="시스템 보안 정책 확인 및 접속 이력 관리"
      />

      <TabNavigation tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* 보안 정책 탭 */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* 안내 문구 */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              아래 보안 정책은 시스템 기본값으로 설정되어 있습니다. 
              정책 변경이 필요한 경우 시스템 관리팀에 문의하세요.
            </p>
          </div>

          {/* 비밀번호 정책 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">비밀번호 정책</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <PolicyItem label="최소 길이" value={`${SECURITY_POLICIES.password.minLength}자`} />
              <PolicyItem label="변경 주기" value={`${SECURITY_POLICIES.password.changeInterval}일`} />
              <PolicyItem label="재사용 금지" value={`최근 ${SECURITY_POLICIES.password.preventReuse}개`} />
              <PolicyItem label="대문자 필수" value={SECURITY_POLICIES.password.requireUppercase ? '적용' : '미적용'} />
              <PolicyItem label="특수문자 필수" value={SECURITY_POLICIES.password.requireSpecial ? '적용' : '미적용'} />
              <PolicyItem label="숫자 필수" value={SECURITY_POLICIES.password.requireNumber ? '적용' : '미적용'} />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* 세션 정책 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">세션 정책</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <PolicyItem label="세션 타임아웃" value={`${SECURITY_POLICIES.session.timeout}분`} />
              <PolicyItem label="로그인 실패 허용" value={`${SECURITY_POLICIES.session.maxFailedAttempts}회`} />
              <PolicyItem label="동시 로그인 제한" value={SECURITY_POLICIES.session.singleSession ? '적용' : '미적용'} />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* 감사 정책 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">감사 정책</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <PolicyItem label="로그인 기록" value={SECURITY_POLICIES.audit.logLogin ? '활성' : '비활성'} />
              <PolicyItem label="데이터 조회 기록" value={SECURITY_POLICIES.audit.logDataAccess ? '활성' : '비활성'} />
              <PolicyItem label="설정 변경 기록" value={SECURITY_POLICIES.audit.logSettingsChange ? '활성' : '비활성'} />
              <PolicyItem label="로그 보관 기간" value={`${SECURITY_POLICIES.audit.retentionDays}일`} />
            </div>
          </section>

          <div className="border-t border-border" />

          {/* IP 접근 제어 - 관리자 조작 가능 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">IP 접근 제어</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">화이트리스트 활성화</span>
                <Switch 
                  checked={ipWhitelistEnabled}
                  onCheckedChange={setIpWhitelistEnabled}
                />
              </div>
            </div>
            
            <div className={cn(
              "transition-opacity",
              !ipWhitelistEnabled && "opacity-50 pointer-events-none"
            )}>
              <p className="text-xs text-muted-foreground mb-3">
                아래 IP 대역에서만 시스템 접근이 허용됩니다.
              </p>
              <div className="divide-y divide-border border-t border-b border-border">
                {ALLOWED_IPS.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-4">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{item.ip}</code>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">기본 설정</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                * IP 대역 추가/삭제는 시스템 관리팀에 문의하세요.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* 감사 로그 탭 */}
      {activeTab === 'audit' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">접속 이력 조회</h2>
              <p className="text-xs text-muted-foreground">사용자 접속 및 활동 이력 ({SECURITY_POLICIES.audit.retentionDays}일 보관)</p>
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
                placeholder="사용자 ID 또는 이름 검색..."
                className="pl-9 bg-background"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
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
                <TableHead className="text-xs w-24">사용자 ID</TableHead>
                <TableHead className="text-xs">이름</TableHead>
                <TableHead className="text-xs w-28">IP 주소</TableHead>
                <TableHead className="text-xs">수행 작업</TableHead>
                <TableHead className="text-xs">대상</TableHead>
                <TableHead className="text-xs w-16 text-center">상태</TableHead>
                <TableHead className="text-xs w-20 text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">{log.timestamp}</TableCell>
                  <TableCell className="font-mono text-xs">{log.userId}</TableCell>
                  <TableCell className="text-sm">{log.userName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.target}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-xs",
                      log.status === 'success' ? 'text-foreground' : 'text-destructive'
                    )}>
                      {log.status === 'success' ? '●' : '○'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {log.status === 'success' && log.action === '로그인' && (
                      <button 
                        onClick={() => handleForceLogout(log.userId, log.userName)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        세션 종료
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-xs text-muted-foreground text-right">
            비인가 IP 접속 시도 시 관리자에게 자동 알림이 발송됩니다.
          </p>
        </section>
      )}
    </div>
  );
}

// 정책 항목 표시 컴포넌트
function PolicyItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 px-4 bg-muted/20 rounded-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
