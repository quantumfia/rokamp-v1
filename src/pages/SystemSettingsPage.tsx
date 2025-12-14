import { useState } from 'react';
import { Bell, Shield, Sliders, Save, Search, Download, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

// 공지사항 Mock 데이터
const NOTICES = [
  { id: 1, title: '동절기 안전수칙 강화 안내', target: 'all', isPopup: true, createdAt: '2024-12-13', author: '김철수 대령' },
  { id: 2, title: '시스템 정기점검 안내 (12/20)', target: 'all', isPopup: false, createdAt: '2024-12-10', author: '김철수 대령' },
  { id: 3, title: '군사경찰 업무 매뉴얼 개정', target: 'mp', isPopup: true, createdAt: '2024-12-08', author: '이영희 준장' },
];

const TABS = [
  { id: 'model', label: '예보 설정', icon: Sliders },
  { id: 'notice', label: '공지사항', icon: FileText },
  { id: 'notification', label: '알림 설정', icon: Bell },
  { id: 'audit', label: '감사 로그', icon: Users },
  { id: 'security', label: '보안 설정', icon: Shield },
];

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('model');
  const [riskThreshold, setRiskThreshold] = useState([50]);
  const [frequencyWeight, setFrequencyWeight] = useState([60]);
  
  // 공지사항 상태
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTarget, setNoticeTarget] = useState('all');
  const [isPopup, setIsPopup] = useState(false);
  
  // 감사 로그 필터
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logDateFrom, setLogDateFrom] = useState('');
  const [logDateTo, setLogDateTo] = useState('');

  const handleSaveSettings = () => {
    toast({
      title: '저장 완료',
      description: '설정이 저장되었습니다.',
    });
  };

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
  };

  const handleExportLogs = () => {
    toast({
      title: '다운로드 시작',
      description: '감사 로그 파일을 다운로드합니다.',
    });
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all': return '전체';
      case 'mp': return '군사경찰';
      case 'infantry': return '일반부대';
      default: return target;
    }
  };

  const filteredLogs = AUDIT_LOGS.filter((log) =>
    log.userName.includes(logSearchQuery) || 
    log.userId.includes(logSearchQuery) ||
    log.action.includes(logSearchQuery)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">시스템 설정</h1>
          <p className="text-sm text-muted-foreground mt-1">예보 모델, 공지사항, 보안 설정 관리</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSaveSettings}>
          <Save className="w-4 h-4 mr-2" />
          변경사항 저장
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 예보 설정 탭 */}
      {activeTab === 'model' && (
        <div className="space-y-8">
          {/* 위험도 임계치 설정 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">위험도 임계치 설정</h2>
              <p className="text-xs text-muted-foreground">예보 모델의 위험 등급 구간을 설정합니다</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">경고 등급 임계치</span>
                <span className="font-medium tabular-nums">{riskThreshold[0]}%</span>
              </div>
              <Slider
                value={riskThreshold}
                onValueChange={setRiskThreshold}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>안전</span>
                <span>관심</span>
                <span>주의</span>
                <span>경고</span>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-4">
                {[
                  { label: '안전', range: '0-24%' },
                  { label: '관심', range: '25-49%' },
                  { label: '주의', range: '50-74%' },
                  { label: '경고', range: '75-100%' },
                ].map((item) => (
                  <div key={item.label} className="text-center py-3 border-t border-border">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{item.range}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* 가중치 설정 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">가중치 설정</h2>
              <p className="text-xs text-muted-foreground">위험도 점수 산정 시 적용되는 가중치를 조정합니다</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">빈도 가중치</span>
                  <span className="font-medium tabular-nums">{frequencyWeight[0]}%</span>
                </div>
                <Slider
                  value={frequencyWeight}
                  onValueChange={setFrequencyWeight}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">심각도 가중치</span>
                  <span className="font-medium tabular-nums">{100 - frequencyWeight[0]}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{ width: `${100 - frequencyWeight[0]}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 공지사항 관리 탭 */}
      {activeTab === 'notice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 공지 등록 폼 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">공지사항 등록</h2>
              <p className="text-xs text-muted-foreground">새 공지사항을 작성하고 발송합니다</p>
            </div>
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
                <Label className="text-xs text-muted-foreground">수신 대상</Label>
                <select 
                  value={noticeTarget} 
                  onChange={(e) => setNoticeTarget(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">전체</option>
                  <option value="mp">군사경찰</option>
                  <option value="infantry">일반부대</option>
                </select>
              </div>

              <div className="flex items-center gap-3 py-3 border-t border-border">
                <Checkbox 
                  id="popup" 
                  checked={isPopup}
                  onCheckedChange={(checked) => setIsPopup(checked === true)}
                />
                <div>
                  <Label htmlFor="popup" className="text-sm font-medium">로그인 시 팝업 노출</Label>
                  <p className="text-xs text-muted-foreground">체크 시 모든 대상자에게 강제 팝업 표시</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handlePublishNotice}>
                공지사항 등록
              </Button>
            </div>
          </section>

          {/* 등록된 공지 목록 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">등록된 공지사항</h2>
              <p className="text-xs text-muted-foreground">최근 등록된 공지사항 목록</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-t border-border">
                  <TableHead className="text-xs">제목</TableHead>
                  <TableHead className="text-xs w-20">대상</TableHead>
                  <TableHead className="text-xs w-16 text-center">팝업</TableHead>
                  <TableHead className="text-xs w-24">등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {NOTICES.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell className="text-sm">{notice.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getTargetLabel(notice.target)}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs">{notice.isPopup ? '●' : '○'}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">{notice.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      )}

      {/* 알림 설정 탭 */}
      {activeTab === 'notification' && (
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">알림 설정</h2>
            <p className="text-xs text-muted-foreground">시스템 알림 수신 방법을 설정합니다</p>
          </div>
          <div className="divide-y divide-border">
            {[
              { id: 'high-risk', label: '고위험 부대 알림', desc: '위험도가 경고 수준에 도달한 부대 알림' },
              { id: 'weather', label: '기상 특보 알림', desc: '기상청 특보 발령 시 알림' },
              { id: 'training', label: '훈련 일정 알림', desc: '위험 훈련 시작 전 알림' },
              { id: 'report', label: '보고서 알림', desc: '정기 보고서 생성 완료 알림' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4">
                <div>
                  <Label htmlFor={item.id} className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch id={item.id} defaultChecked />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 감사 로그 탭 */}
      {activeTab === 'audit' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">접속 이력 조회</h2>
              <p className="text-xs text-muted-foreground">사용자 접속 및 활동 이력을 조회합니다 (1년 이상 보관)</p>
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
                    <span className={log.status === 'success' ? 'text-foreground' : 'text-muted-foreground'}>
                      {log.status === 'success' ? '●' : '○'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-xs text-muted-foreground text-right">
            비인가 IP 접속 시도 시 관리자에게 경고가 표시됩니다
          </p>
        </section>
      )}

      {/* 보안 설정 탭 */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* 비밀번호 정책 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">비밀번호 정책</h2>
              <p className="text-xs text-muted-foreground">사용자 비밀번호 보안 정책을 설정합니다</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium">최소 비밀번호 길이</p>
                  <p className="text-xs text-muted-foreground">비밀번호 최소 문자 수</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={8}
                    min={6}
                    max={16}
                    className="w-20 h-8 text-center bg-background"
                  />
                  <span className="text-xs text-muted-foreground">자</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium">비밀번호 변경 주기</p>
                  <p className="text-xs text-muted-foreground">정기 변경 요구 기간</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={90}
                    min={30}
                    max={180}
                    className="w-20 h-8 text-center bg-background"
                  />
                  <span className="text-xs text-muted-foreground">일</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { id: 'pw-upper', label: '대문자 포함 필수', desc: '최소 1개 이상의 대문자 포함', default: true },
                  { id: 'pw-special', label: '특수문자 포함 필수', desc: '최소 1개 이상의 특수문자 포함', default: true },
                  { id: 'pw-number', label: '숫자 포함 필수', desc: '최소 1개 이상의 숫자 포함', default: true },
                  { id: 'pw-history', label: '이전 비밀번호 재사용 금지', desc: '최근 5개 비밀번호와 중복 불가', default: true },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.default} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* 세션 관리 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">세션 관리</h2>
              <p className="text-xs text-muted-foreground">사용자 세션 및 로그인 정책을 설정합니다</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium">세션 타임아웃</p>
                  <p className="text-xs text-muted-foreground">미사용 시 자동 로그아웃 시간</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={30}
                    min={5}
                    max={120}
                    className="w-20 h-8 text-center bg-background"
                  />
                  <span className="text-xs text-muted-foreground">분</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium">로그인 실패 허용 횟수</p>
                  <p className="text-xs text-muted-foreground">초과 시 계정 잠금</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    defaultValue={5}
                    min={3}
                    max={10}
                    className="w-20 h-8 text-center bg-background"
                  />
                  <span className="text-xs text-muted-foreground">회</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { id: 'single-session', label: '동시 로그인 제한', desc: '하나의 계정으로 동시 접속 불가', default: true },
                  { id: 'force-logout', label: '관리자 강제 로그아웃', desc: '관리자가 특정 사용자 세션 종료 가능', default: true },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.default} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* IP 접근 제어 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">IP 접근 제어</h2>
              <p className="text-xs text-muted-foreground">허용된 IP 대역에서만 시스템 접근 가능</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium">IP 화이트리스트 활성화</p>
                  <p className="text-xs text-muted-foreground">등록된 IP만 접속 허용</p>
                </div>
                <Switch id="ip-whitelist" defaultChecked />
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">허용 IP 대역</p>
                <div className="divide-y divide-border border-t border-border">
                  {[
                    { ip: '10.10.0.0/16', desc: '본부 네트워크' },
                    { ip: '10.20.0.0/16', desc: '사단급 네트워크' },
                    { ip: '10.30.0.0/16', desc: '대대급 네트워크' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-4">
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{item.ip}</code>
                        <span className="text-sm text-muted-foreground">{item.desc}</span>
                      </div>
                      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  + IP 대역 추가
                </Button>
              </div>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* 감사 및 로깅 */}
          <section>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">감사 및 로깅</h2>
              <p className="text-xs text-muted-foreground">시스템 활동 기록 정책을 설정합니다</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { id: 'audit-login', label: '로그인/로그아웃 기록', desc: '모든 접속 이력 저장', default: true },
                { id: 'audit-data', label: '데이터 조회 기록', desc: '민감 데이터 조회 이력 저장', default: true },
                { id: 'audit-change', label: '설정 변경 기록', desc: '시스템 설정 변경 이력 저장', default: true },
                { id: 'audit-alert', label: '이상 징후 알림', desc: '비인가 접근 시도 시 관리자 알림', default: true },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch id={item.id} defaultChecked={item.default} />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between py-3 mt-4 border-t border-border">
              <div>
                <p className="text-sm font-medium">로그 보관 기간</p>
                <p className="text-xs text-muted-foreground">지정 기간 경과 후 자동 삭제</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue={365}
                  min={90}
                  max={730}
                  className="w-20 h-8 text-center bg-background"
                />
                <span className="text-xs text-muted-foreground">일</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
