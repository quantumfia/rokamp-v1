import { X, Bell, AlertTriangle, Info, FileText, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types/entities';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationPanelProps {
  onClose: () => void;
  onShowNotice: () => void;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'NOTICE',
    message: '12월 1일부터 2월 28일까지 강화 기간 운영',
    createdAt: '10분 전',
    isRead: false,
  },
  {
    id: '2',
    type: 'RISK_ALERT',
    message: '위험 지수가 경고 수준(78%)에 도달했습니다',
    createdAt: '1시간 전',
    isRead: false,
  },
  {
    id: '3',
    type: 'APPROVAL_RES',
    message: '12월 2주차 통계 보고서가 준비되었습니다',
    createdAt: '3시간 전',
    isRead: true,
  },
  {
    id: '4',
    type: 'SYSTEM',
    message: '매주 일요일 02:00-04:00 점검 진행',
    createdAt: '1일 전',
    isRead: true,
  },
  {
    id: '5',
    type: 'SECURITY',
    message: '강원 영서 지역 대설주의보 발효',
    createdAt: '2일 전',
    isRead: true,
  },
];

export function NotificationPanel({ onClose, onShowNotice }: NotificationPanelProps) {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'NOTICE':
        return <FileText className="w-4 h-4" />;
      case 'RISK_ALERT':
      case 'SECURITY':
        return <AlertTriangle className="w-4 h-4" />;
      case 'APPROVAL_RES':
        return <CheckCircle className="w-4 h-4" />;
      case 'APPROVAL_REQ':
        return <FileText className="w-4 h-4" />;
      case 'SYSTEM':
        return <Info className="w-4 h-4" />;
    }
  };

  const getTitle = (type: Notification['type']) => {
    switch (type) {
      case 'NOTICE':
        return '공지사항';
      case 'RISK_ALERT':
        return '위험 알림';
      case 'APPROVAL_REQ':
        return '결재 요청';
      case 'APPROVAL_RES':
        return '결재 결과';
      case 'SECURITY':
        return '보안 경고';
      case 'SYSTEM':
        return '시스템 알림';
    }
  };

  const isAlertType = (type: Notification['type']) =>
    type === 'RISK_ALERT' || type === 'SECURITY';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-4 top-14 z-50 w-80 bg-sidebar border border-sidebar-border rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-sidebar-foreground" />
            <span className="text-sm font-medium text-sidebar-foreground">알림</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-status-error text-white rounded">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-sidebar-accent rounded transition-colors"
          >
            <X className="w-4 h-4 text-sidebar-muted" />
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto divide-y divide-sidebar-border">
          {MOCK_NOTIFICATIONS.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                if (notification.type === 'NOTICE') {
                  onShowNotice();
                }
              }}
              className={cn(
                'w-full px-4 py-3 text-left hover:bg-sidebar-accent transition-colors',
                !notification.isRead && 'bg-sidebar-accent/50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-1.5 rounded',
                  isAlertType(notification.type) ? 'bg-status-error/20 text-status-error' :
                  'bg-sidebar-accent text-sidebar-muted'
                )}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      'text-xs font-medium truncate',
                      notification.isRead ? 'text-sidebar-muted' : 'text-sidebar-foreground'
                    )}>
                      {getTitle(notification.type)}
                    </p>
                    {!notification.isRead && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-sidebar-muted truncate mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-sidebar-muted/70 mt-1">
                    {notification.createdAt}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-sidebar-border">
          <button 
            onClick={onShowNotice}
            className="w-full text-center text-xs text-primary hover:underline"
          >
            공지사항 전체보기
          </button>
        </div>
      </div>
    </>
  );
}
