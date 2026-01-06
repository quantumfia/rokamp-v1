import { useState, useMemo } from 'react';
import { Download, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil } from 'lucide-react';
import { UnitFilterSelect, UnitFormSelect } from '@/components/unit';
import { getUnitById, getAllDescendants, getUnitFullName } from '@/data/armyUnits';
import { toast } from '@/hooks/use-toast';
import { UserManagementSkeleton } from '@/components/skeletons';
import { PageHeader, ActionButton, AddModal, FileDropZone } from '@/components/common';
import { usePageLoading } from '@/hooks/usePageLoading';
import { useAuth } from '@/contexts/AuthContext';
import { canChangeUserRole, getAccessibleUnits } from '@/lib/rbac';
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

interface User {
  id: string;
  accountId: string;      // 로그인용 계정 ID (IP 기반 관리, 이관 가능)
  militaryId: string;     // 군번 (실제 사용자 고유 식별)
  name: string;
  rank: string;
  unitId: string;
  password: string;
  role: string;
  status: 'active' | 'inactive';
}

const MOCK_USERS: User[] = [
  { id: '1', accountId: 'HQ-001', militaryId: '18-702341', name: '김철수', rank: '대령', unitId: 'hq', password: '********', role: 'ROLE_SUPER_ADMIN', status: 'active' },
  { id: '2', accountId: 'C1D1-001', militaryId: '17-681542', name: '이영희', rank: '준장', unitId: 'corps-1-div-1', password: '********', role: 'ROLE_ADMIN', status: 'active' },
  { id: '3', accountId: 'C5D3-001', militaryId: '19-723185', name: '박민호', rank: '대령', unitId: 'corps-5-div-3', password: '********', role: 'ROLE_ADMIN', status: 'active' },
  { id: '4', accountId: 'C1D9-001', militaryId: '20-751294', name: '최지훈', rank: '중령', unitId: 'corps-1-div-9', password: '********', role: 'ROLE_USER', status: 'active' },
  { id: '5', accountId: 'C1D25-001', militaryId: '21-782456', name: '정수민', rank: '중령', unitId: 'corps-1-div-25', password: '********', role: 'ROLE_USER', status: 'inactive' },
  { id: '6', accountId: 'C1-001', militaryId: '16-659823', name: '홍길동', rank: '중장', unitId: 'corps-1', password: '********', role: 'ROLE_ADMIN', status: 'active' },
  { id: '7', accountId: 'C2D7-001', militaryId: '22-803571', name: '김대위', rank: '대령', unitId: 'corps-2-div-7', password: '********', role: 'ROLE_USER', status: 'active' },
  { id: '8', accountId: 'SWC-001', militaryId: '23-824693', name: '강특전', rank: '중령', unitId: 'swc-bde-sf-1', password: '********', role: 'ROLE_USER', status: 'active' },
  { id: '9', accountId: 'GOC-001', militaryId: '15-638712', name: '이작전', rank: '대장', unitId: 'goc', password: '********', role: 'ROLE_SUPER_ADMIN', status: 'active' },
  { id: '10', accountId: 'C3D12-001', militaryId: '19-745821', name: '송준혁', rank: '소령', unitId: 'corps-3-div-12', password: '********', role: 'ROLE_USER', status: 'active' },
  { id: '11', accountId: 'C2D15-001', militaryId: '20-768432', name: '윤서연', rank: '중령', unitId: 'corps-2-div-15', password: '********', role: 'ROLE_ADMIN', status: 'active' },
  { id: '12', accountId: 'C3D21-001', militaryId: '21-791543', name: '장민석', rank: '소령', unitId: 'corps-3-div-21', password: '********', role: 'ROLE_USER', status: 'inactive' },
];

const RANKS = ['대장', '중장', '소장', '준장', '대령', '중령', '소령'];
const ROLES = [
  { value: 'ROLE_SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ROLE_ADMIN', label: 'Admin' },
  { value: 'ROLE_USER', label: 'User' },
];

// 개별 등록 폼
function UserForm({ form, onChange }: { form: Partial<User>; onChange: (form: Partial<User>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">계정 ID *</label>
          <input
            type="text"
            placeholder="HQ-001"
            value={form.accountId || ''}
            onChange={(e) => onChange({ ...form, accountId: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
          />
          <p className="text-[10px] text-muted-foreground mt-1">IP 기반 로그인용 계정</p>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">군번 *</label>
          <input
            type="text"
            placeholder="00-000000"
            value={form.militaryId || ''}
            onChange={(e) => onChange({ ...form, militaryId: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
          />
          <p className="text-[10px] text-muted-foreground mt-1">실제 사용자 식별용</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">이름 *</label>
          <input
            type="text"
            placeholder="홍길동"
            value={form.name || ''}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">계급 *</label>
          <select 
            value={form.rank || ''}
            onChange={(e) => onChange({ ...form, rank: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">선택</option>
            {RANKS.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">소속 부대 *</label>
        <UnitFormSelect
          value={form.unitId || ''}
          onChange={(value) => onChange({ ...form, unitId: value })}
          placeholder="부대 선택"
          showFullPath={true}
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">비밀번호 *</label>
        <input
          type="password"
          placeholder="초기 비밀번호 입력"
          value={form.password || ''}
          onChange={(e) => onChange({ ...form, password: e.target.value })}
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="text-[11px] text-muted-foreground pt-2 space-y-0.5">
        <p>• 비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.</p>
        <p>• 계정 이관 시 군번을 변경하여 새 사용자를 등록하세요.</p>
      </div>
    </div>
  );
}

// 일괄 등록 폼
function BulkUploadForm({ onDownloadTemplate }: { onDownloadTemplate: () => void }) {
  return (
    <div className="space-y-4">
      <FileDropZone
        accept=".xlsx,.xls"
        hint="엑셀 파일을 드래그하거나 클릭하여 업로드"
        maxSize="10MB"
      />
      <button
        onClick={onDownloadTemplate}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs border border-border rounded-md hover:bg-muted transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        템플릿 다운로드
      </button>
      <div className="text-[11px] text-muted-foreground space-y-0.5">
        <p>• 필수 필드: 군번, 이름, 계급, 소속부대코드, 비밀번호</p>
        <p>• 소속 부대 코드에 따라 접근 권한 자동 설정</p>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [newUserForm, setNewUserForm] = useState<Partial<User>>({});
  const isLoading = usePageLoading(1000);
  
  // 역할 변경 권한 확인
  const canEditRole = canChangeUserRole(currentUser?.role);

  // 역할 기반 접근 가능 부대 목록
  const accessibleUnits = useMemo(() => {
    return getAccessibleUnits(currentUser?.role, currentUser?.unitId);
  }, [currentUser?.role, currentUser?.unitId]);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getRoleLabel = (role: string) => {
    const found = ROLES.find(r => r.value === role);
    return found?.label ?? role;
  };

  const handleSubmit = () => {
    if (!newUserForm.accountId || !newUserForm.militaryId || !newUserForm.name || !newUserForm.rank || !newUserForm.unitId || !newUserForm.password) {
      toast({
        title: '입력 오류',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      accountId: newUserForm.accountId,
      militaryId: newUserForm.militaryId,
      name: newUserForm.name,
      rank: newUserForm.rank,
      unitId: newUserForm.unitId,
      password: newUserForm.password,
      role: 'ROLE_USER',
      status: 'active',
    };
    
    setUsers([...users, newUser]);
    setNewUserForm({});
    toast({
      title: '등록 완료',
      description: '사용자가 등록되었습니다.',
    });
    setShowAddModal(false);
  };

  const handleDownloadTemplate = () => {
    const headers = ['계정ID', '군번', '이름', '계급', '소속부대코드', '비밀번호', '권한', '상태'];
    const exampleRows = [
      ['HQ-001', '18-702341', '김철수', '대령', 'hq', 'Password123!', 'ROLE_ADMIN', '활성'],
      ['C1D1-001', '17-681542', '이영희', '준장', 'corps-1-div-1', 'Password123!', 'ROLE_ADMIN', '활성'],
      ['C5D3-001', '19-723185', '박민호', '대령', 'corps-5-div-3', 'Password123!', 'ROLE_USER', '비활성'],
    ];

    // BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...exampleRows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '사용자_일괄등록_템플릿.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: '템플릿 다운로드 완료',
      description: '사용자 일괄 등록 템플릿이 다운로드되었습니다.',
    });
  };

  const [isEditMode, setIsEditMode] = useState(false);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setIsEditMode(false);
    setShowDetailModal(true);
  };

  const handleDeleteFromDetail = () => {
    if (selectedUser) {
      setUserToDelete(selectedUser);
      setShowDeleteDialog(true);
    }
  };

  const handleSaveUser = () => {
    if (!editForm.militaryId || !editForm.name || !editForm.rank || !editForm.unitId) {
      toast({
        title: '입력 오류',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setUsers(users.map(u => 
      u.id === selectedUser?.id 
        ? { ...u, ...editForm } as User
        : u
    ));
    
    toast({
      title: '수정 완료',
      description: '사용자 정보가 수정되었습니다.',
    });
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const handleDeleteClick = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast({
        title: '삭제 완료',
        description: `${userToDelete.name}님이 삭제되었습니다.`,
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 역할 기반 부대 필터링: HQ는 전체, DIV는 예하 부대 사용자만
      const hasAccess = currentUser?.role === 'ROLE_HQ' || 
        accessibleUnits.some(unit => {
          const userUnit = getUnitById(user.unitId);
          return userUnit && (user.unitId === unit.id || userUnit.name.includes(unit.name));
        });
      
      if (!hasAccess) return false;

      const matchesSearch =
        user.name.includes(searchQuery) ||
        user.accountId.includes(searchQuery) ||
        user.militaryId.includes(searchQuery) ||
        getUnitById(user.unitId)?.name.includes(searchQuery);
      
      let matchesUnit = true;
      if (selectedUnitFilter && selectedUnitFilter !== 'all') {
        const descendants = getAllDescendants(selectedUnitFilter);
        const descendantIds = descendants.map(u => u.id);
        matchesUnit = user.unitId === selectedUnitFilter || descendantIds.includes(user.unitId);
      }
      
      return matchesSearch && matchesUnit;
    });
  }, [users, currentUser?.role, accessibleUnits, searchQuery, selectedUnitFilter]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // 검색/필터 변경 시 페이지 초기화
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleUnitFilterChange = (value: string) => {
    setSelectedUnitFilter(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <UserManagementSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-page-enter">
      <PageHeader 
        title="사용자 관리" 
        description="시스템 사용자 계정 및 권한 관리"
        actions={
          <ActionButton label="사용자 추가" onClick={() => setShowAddModal(true)} />
        }
      />

      {/* 통계 요약 - 접근 가능한 사용자 기준 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div>
          <p className="text-xs text-muted-foreground">전체 사용자</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{filteredUsers.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">활성 계정</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{filteredUsers.filter(u => u.status === 'active').length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">소속 부대</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{new Set(filteredUsers.map(u => u.unitId)).size}</p>
        </div>
      </div>

      <div className="border-t border-border pt-6" />

      {/* 검색 및 필터 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
          <h2 className="text-sm font-medium text-foreground shrink-0">사용자 목록</h2>
          <UnitFilterSelect
            value={selectedUnitFilter}
            onChange={handleUnitFilterChange}
            mode="popover"
            placeholder="전체 부대"
            containerWidth="w-full sm:w-[280px] lg:w-[320px]"
          />
        </div>
        <input
          placeholder="이름, 계정 ID, 군번, 부대 검색..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full lg:w-64 bg-transparent border border-border rounded px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* 테이블 - 가로 스크롤 지원 */}
      <div className="overflow-x-auto -mx-6 px-6">
        <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs w-24">계정 ID</TableHead>
            <TableHead className="text-xs w-24">군번</TableHead>
            <TableHead className="text-xs w-20">이름</TableHead>
            <TableHead className="text-xs w-16">계급</TableHead>
            <TableHead className="text-xs">소속 부대</TableHead>
            <TableHead className="text-xs w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            paginatedUsers.map((user) => (
              <TableRow 
                key={user.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleUserClick(user)}
              >
                <TableCell className="font-mono text-xs text-primary">{user.accountId}</TableCell>
                <TableCell className="font-mono text-xs">{user.militaryId}</TableCell>
                <TableCell className="text-sm font-medium">{user.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.rank}</TableCell>
                <TableCell className="text-xs text-muted-foreground truncate max-w-[250px]" title={getUnitFullName(user.unitId)}>
                  {getUnitFullName(user.unitId)}
                </TableCell>
                <TableCell>
                  <button 
                    onClick={(e) => handleDeleteClick(user, e)}
                    className="p-1.5 hover:bg-destructive/10 rounded transition-colors group"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {filteredUsers.length}명 중 {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}명 표시
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex items-center justify-center w-8 h-8 text-xs border rounded transition-colors ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-8 h-8 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 사용자 추가 모달 */}
      <AddModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setNewUserForm({}); }}
        title="사용자 추가"
        description="개별 등록 또는 엑셀 파일로 일괄 등록"
        inputTypes={[
          { id: 'single', label: '개별 등록', content: <UserForm form={newUserForm} onChange={setNewUserForm} /> },
          { id: 'bulk', label: '일괄 등록', content: <BulkUploadForm onDownloadTemplate={handleDownloadTemplate} /> },
        ]}
        onSubmit={handleSubmit}
        submitLabel="등록"
      />

      {/* 사용자 상세/수정 모달 */}
      <Dialog open={showDetailModal} onOpenChange={(open) => { setShowDetailModal(open); if (!open) setIsEditMode(false); }}>
        <DialogContent className="max-w-md overflow-hidden">
          <DialogHeader>
            <DialogTitle>{isEditMode ? '사용자 수정' : '사용자 상세 정보'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 overflow-x-auto">
            {/* 계정 ID */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">계정 ID</label>
              {isEditMode ? (
                <input
                  type="text"
                  value={editForm.accountId || ''}
                  onChange={(e) => setEditForm({ ...editForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                />
              ) : (
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md font-mono text-primary">{selectedUser?.accountId}</p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">IP 기반 로그인용 계정 (이관 가능)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">군번</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editForm.militaryId || ''}
                    onChange={(e) => setEditForm({ ...editForm, militaryId: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md font-mono">{selectedUser?.militaryId}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">실제 사용자 식별용</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">이름</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  />
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedUser?.name}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">계급</label>
              {isEditMode ? (
                <select 
                  value={editForm.rank || ''}
                  onChange={(e) => setEditForm({ ...editForm, rank: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                >
                  {RANKS.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              ) : (
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedUser?.rank}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">소속 부대</label>
              {isEditMode ? (
                <UnitFormSelect
                  value={editForm.unitId || ''}
                  onChange={(value) => setEditForm({ ...editForm, unitId: value })}
                  placeholder="부대 선택"
                  showFullPath={true}
                />
              ) : (
                <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">{selectedUser ? getUnitFullName(selectedUser.unitId) : ''}</p>
              )}
            </div>

            {isEditMode && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">비밀번호</label>
                <input
                  type="password"
                  placeholder="변경 시 입력 (미입력시 유지)"
                  value={editForm.password === '********' ? '' : editForm.password || ''}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value || '********' })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">
                  권한
                  {!canEditRole && isEditMode && (
                    <span className="ml-1 text-[10px] text-amber-500">(변경 불가)</span>
                  )}
                </label>
                {isEditMode ? (
                  <select 
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    disabled={!canEditRole}
                    className={`w-full px-3 py-2 text-sm border border-border rounded-md transition-colors ${
                      canEditRole 
                        ? 'bg-background focus:outline-none focus:border-primary' 
                        : 'bg-muted/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                    {ROLES.find(r => r.value === selectedUser?.role)?.label || selectedUser?.role}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">상태</label>
                {isEditMode ? (
                  <select 
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 text-sm bg-muted/50 border border-border rounded-md">
                    {selectedUser?.status === 'active' ? '활성' : '비활성'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={() => { setIsEditMode(false); setEditForm({ ...selectedUser }); }}>
                  취소
                </Button>
                <Button onClick={handleSaveUser}>
                  저장
                </Button>
              </>
            ) : (
              <>
                <Button variant="destructive" onClick={handleDeleteFromDetail}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
                <Button onClick={() => setIsEditMode(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  수정
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete?.name}님을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}