import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Training {
  id: string;
  name: string;
  date: string;
}

interface RiskFactor {
  id: string;
  description: string;
}

interface UnitDetailPanelProps {
  unitId: string;
  onClose: () => void;
  onChatbotClick: () => void;
}

// Mock data
const MOCK_TRAININGS: Training[] = [
  { id: '1', name: '사격 훈련', date: '12/15' },
  { id: '2', name: '야간 행군', date: '12/17' },
  { id: '3', name: '차량 기동훈련', date: '12/19' },
];

const MOCK_RISK_FACTORS: RiskFactor[] = [
  { id: '1', description: '폭우 예보로 인한 차량 전복 위험 증가' },
  { id: '2', description: '야간 행군 중 저체온증 주의 필요' },
  { id: '3', description: '사격장 결빙으로 인한 미끄러짐 주의' },
];

export function UnitDetailPanel({ unitId, onClose, onChatbotClick }: UnitDetailPanelProps) {
  const unitName = '제7사단 3연대';
  const riskValue = 78;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{unitName}</h3>
          <p className="text-[10px] text-muted-foreground">상세 정보</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Risk Value */}
          <div className="p-4 rounded border border-border bg-muted/20">
            <p className="text-[10px] text-muted-foreground mb-1">현재 위험도</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">{riskValue}%</p>
          </div>

          {/* Weather Info */}
          <div className="p-3 rounded border border-border">
            <h4 className="text-[10px] text-muted-foreground mb-2">기상 정보</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground">기온</p>
                <p className="font-medium text-foreground">-5°C</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">날씨</p>
                <p className="font-medium text-foreground">눈 예보</p>
              </div>
            </div>
          </div>

          {/* Training Schedule */}
          <div>
            <h4 className="text-[10px] text-muted-foreground mb-2">주간 훈련 일정</h4>
            <div className="space-y-1">
              {MOCK_TRAININGS.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between p-2 rounded border border-border"
                >
                  <span className="text-xs text-foreground">{training.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{training.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          <div>
            <h4 className="text-[10px] text-muted-foreground mb-2">예측 위험 요인</h4>
            <div className="space-y-1">
              {MOCK_RISK_FACTORS.map((factor) => (
                <div
                  key={factor.id}
                  className="p-2 rounded border border-border"
                >
                  <span className="text-xs text-foreground">{factor.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot CTA */}
      <div className="p-3 border-t border-border">
        <Button
          onClick={onChatbotClick}
          className="w-full"
          variant="secondary"
          size="sm"
        >
          예방 대책 확인하기
        </Button>
      </div>
    </div>
  );
}