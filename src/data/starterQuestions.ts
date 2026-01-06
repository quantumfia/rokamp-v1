import { Car, Shield, Flame, Mountain, LucideIcon } from "lucide-react";

export interface StarterQuestion {
  id: string;
  icon: string;
  text: string;
  color: string;
}

// 아이콘 매핑
export const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  Shield,
  Flame,
  Mountain,
};

// 색상 옵션
export const COLOR_OPTIONS = [
  { id: "blue", label: "파랑", value: "text-blue-400" },
  { id: "emerald", label: "초록", value: "text-emerald-400" },
  { id: "orange", label: "주황", value: "text-orange-400" },
  { id: "cyan", label: "청록", value: "text-cyan-400" },
  { id: "purple", label: "보라", value: "text-purple-400" },
  { id: "red", label: "빨강", value: "text-red-400" },
];

// 아이콘 옵션
export const ICON_OPTIONS = [
  { id: "Car", label: "차량" },
  { id: "Shield", label: "안전" },
  { id: "Flame", label: "화재" },
  { id: "Mountain", label: "산악" },
];

// 초기 목데이터
export const DEFAULT_STARTER_QUESTIONS: StarterQuestion[] = [
  { id: "1", icon: "Car", text: "동절기 차량 사고 예방 대책은?", color: "text-blue-400" },
  { id: "2", icon: "Shield", text: "야간 훈련 시 안전 수칙 알려줘", color: "text-emerald-400" },
  { id: "3", icon: "Flame", text: "화재 예방 점검 항목이 뭐야?", color: "text-orange-400" },
  { id: "4", icon: "Mountain", text: "행군 중 저체온증 대처 방법은?", color: "text-cyan-400" },
];
