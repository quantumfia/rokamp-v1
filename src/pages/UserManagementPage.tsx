import { useState } from 'react';
import { Plus, Upload, Download, MoreHorizontal } from 'lucide-react';
import { UnitCascadeSelect } from '@/components/unit/UnitCascadeSelect';
import { getUnitById, getAllDescendants } from '@/data/armyUnits';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  militaryId: string;
  name: string;
  rank: string;
  unitId: string;
  role: string;
  status: 'active' | 'inactive';
}

const MOCK_USERS: User[] = [
  { id: '1', militaryId: 'HQ001', name: '김철수', rank: '대령', unitId: 'hq', role: 'ROLE_HQ', status: 'active' },
  { id: '2', militaryId: 'DIV001', name: '이영희', rank: '준장', unitId: 'div-1', role: 'ROLE_DIV', status: 'active' },
  { id: '3', militaryId: 'DIV002', name: '박민호', rank: '대령', unitId: 'div-3', role: 'ROLE_DIV', status: 'active' },
  { id: '4', militaryId: 'BN001', name: '최지훈', rank: '중령', unitId: 'bn-1-1', role: 'ROLE_BN', status: 'active' },
  { id: '5', militaryId: 'BN002', name: '정수민', rank: '중령', unitId: 'bn-1-2', role: 'ROLE_BN', status: 'inactive' },
  { id: '6', militaryId: 'CORPS001', name: '홍길동', rank: '중장', unitId: 'corps-1', role: 'ROLE_DIV', status: 'active' },
  { id: '7', militaryId: 'REG001', name: '김대위', rank: '대령', unitId: 'reg-11', role: 'ROLE_BN', status: 'active' },
  { id: '8', militaryId: 'SF001', name: '강특전', rank: '중령', unitId: 'bde-sf-1', role: 'ROLE_BN', status: 'active' },
  { id: '9', militaryId: 'GOC001', name: '이작전', rank: '대장', unitId: 'goc', role: 'ROLE_HQ', status: 'active' },
];

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ROLE_HQ':
        return '육군본부';
      case 'ROLE_DIV':
        return '사단급';
      case 'ROLE_BN':
        return '대대급';
      default:
        return role;
    }
  };

  const getUnitName = (unitId: string) => {
    const unit = getUnitById(unitId);
    return unit?.name ?? unitId;
  };

  const handleBulkUpload = () => {
    toast({
      title: '업로드 완료',
      description: '사용자 일괄 등록이 완료되었습니다.',
    });
    setShowBulkUpload(false);
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: '비밀번호 초기화',
      description: `${userName}님의 비밀번호가 초기화되었습니다.`,
    });
    setShowActionMenu(null);
  };

  const handleDownloadTemplate = () => {
    toast({
      title: '템플릿 다운로드',
      description: '사용자 일괄 등록 템플릿이 다운로드됩니다.',
    });
  };

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.includes(searchQuery) ||
      user.militaryId.includes(searchQuery) ||
      getUnitName(user.unitId).includes(searchQuery);
    
    let matchesUnit = true;
    if (selectedUnitFilter && selectedUnitFilter !== 'all') {
      const descendants = getAllDescendants(selectedUnitFilter);
      const descendantIds = descendants.map(u => u.id);
      matchesUnit = user.unitId === selectedUnitFilter || descendantIds.includes(user.unitId);
    }
    
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">사용자 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">시스템 사용자 계정 및 권한 관리</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded hover:bg-muted/50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            일괄 등록
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-foreground text-background rounded hover:opacity-80 transition-opacity">
            <Plus className="w-4 h-4" />
            사용자 등록
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-muted-foreground">전체 사용자</p>
          <p className="text-2xl font-semibold text-foreground mt-1">156</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">활성 계정</p>
          <p className="text-2xl font-semibold text-foreground mt-1">148</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">소속 부대</p>
          <p className="text-2xl font-semibold text-foreground mt-1">24</p>
        </div>
      </div>

      <div className="border-t border-border pt-6" />

      {/* 검색 및 필터 */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">사용자 목록</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">부대:</span>
            <UnitCascadeSelect
              value={selectedUnitFilter}
              onChange={setSelectedUnitFilter}
              placeholder="전체"
              showFullPath={false}
            />
          </div>
          <input
            placeholder="이름, 군번, 부대 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-transparent border border-border rounded px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="border-t border-border">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[100px_100px_60px_1fr_100px_80px_40px] gap-4 py-3 text-xs text-muted-foreground border-b border-border">
          <div>군번</div>
          <div>이름</div>
          <div>계급</div>
          <div>소속 부대</div>
          <div>권한</div>
          <div>상태</div>
          <div></div>
        </div>

        {/* 테이블 내용 */}
        <div className="divide-y divide-border">
          {filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-[100px_100px_60px_1fr_100px_80px_40px] gap-4 py-3 items-center text-sm">
              <div className="font-mono text-muted-foreground">{user.militaryId}</div>
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground">{user.rank}</div>
              <div className="text-muted-foreground truncate">{getUnitName(user.unitId)}</div>
              <div className="text-muted-foreground">{getRoleLabel(user.role)}</div>
              <div className="text-muted-foreground">
                {user.status === 'active' ? '활성' : '비활성'}
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
                {showActionMenu === user.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowActionMenu(null)}
                    />
                    <div className="absolute right-0 top-8 z-50 w-40 bg-background border border-border rounded shadow-lg py-1">
                      <button 
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => setShowActionMenu(null)}
                      >
                        권한 변경
                      </button>
                      <button 
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => handleResetPassword(user.name)}
                      >
                        비밀번호 초기화
                      </button>
                      <button 
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                        onClick={() => setShowActionMenu(null)}
                      >
                        계정 비활성화
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 일괄 등록 모달 */}
      {showBulkUpload && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowBulkUpload(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-1">사용자 일괄 등록</h3>
            <p className="text-sm text-muted-foreground mb-6">
              엑셀 파일로 여러 사용자를 한 번에 등록합니다.
            </p>
            
            <div className="space-y-4">
              <div 
                className="border border-dashed border-border rounded-lg p-8 text-center hover:border-foreground/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('excel-upload')?.click()}
              >
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm">엑셀 파일을 드래그하거나 클릭하여 업로드</p>
                <p className="text-xs text-muted-foreground mt-1">XLSX, XLS 형식 지원</p>
                <input id="excel-upload" type="file" accept=".xlsx,.xls" className="hidden" />
              </div>
              
              <button 
                className="w-full flex items-center justify-center gap-2 py-2 border border-border rounded text-sm hover:bg-muted/50 transition-colors"
                onClick={handleDownloadTemplate}
              >
                <Download className="w-4 h-4" />
                템플릿 다운로드
              </button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• 필수 필드: 군번, 이름, 계급, 소속부대코드</p>
                <p>• 소속 부대 코드에 따라 접근 권한 자동 설정</p>
                <p>• 초기 비밀번호는 군번+생년월일 형식</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="px-4 py-2 text-sm border border-border rounded hover:bg-muted/50 transition-colors"
                onClick={() => setShowBulkUpload(false)}
              >
                취소
              </button>
              <button 
                className="px-4 py-2 text-sm bg-foreground text-background rounded hover:opacity-80 transition-opacity"
                onClick={handleBulkUpload}
              >
                업로드
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
