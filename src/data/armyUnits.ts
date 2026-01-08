// 대한민국 육군 부대 편제 데이터
// DB 설계에 맞춘 타입 정의

import type { UnitLevel, UnitType as DBUnitType } from '@/types/entities';

// 부대 유형 (DB 설계 기반)
// DB 설계: 'INF' | 'ART' | 'ARM' | 'ENG' | 'COM' | 'INT' | 'AVN' | 'CBR' | 'LOG' | 'MED' | 'MP' | 'EDU' | 'SF' | 'ADA' | 'CMD'
// 기존 프론트엔드 타입과의 호환성을 위한 매핑 타입
export type LegacyUnitType = 
  | 'HQ'          // 본부 (CMD로 매핑)
  | 'INFANTRY'    // 보병 (INF로 매핑)
  | 'MECHANIZED'  // 기계화 (INF로 매핑)
  | 'ARMOR'       // 기갑 (ARM로 매핑)
  | 'ARTILLERY'   // 포병 (ART로 매핑)
  | 'SPECIAL'     // 특수전 (SF로 매핑)
  | 'GOP'         // 일반전초 (INF로 매핑)
  | 'TRAINING'    // 교육/훈련 (EDU로 매핑)
  | 'LOGISTICS'   // 군수 (LOG로 매핑)
  | 'AVIATION'    // 항공 (AVN로 매핑)
  | 'SIGNAL'      // 정보통신 (COM으로 매핑)
  | 'ENGINEERING' // 공병 (ENG로 매핑)
  | 'RESERVE';    // 동원/예비 (LOG로 매핑)

// 레거시 타입을 DB 타입으로 변환하는 함수
export function mapLegacyUnitTypeToDB(legacyType: LegacyUnitType): DBUnitType {
  const mapping: Record<LegacyUnitType, DBUnitType> = {
    'HQ': 'CMD',
    'INFANTRY': 'INF',
    'MECHANIZED': 'INF',
    'ARMOR': 'ARM',
    'ARTILLERY': 'ART',
    'SPECIAL': 'SF',
    'GOP': 'INF',
    'TRAINING': 'EDU',
    'LOGISTICS': 'LOG',
    'AVIATION': 'AVN',
    'SIGNAL': 'COM',
    'ENGINEERING': 'ENG',
    'RESERVE': 'LOG',
  };
  return mapping[legacyType] || 'INF';
}

// DB 타입을 레거시 타입으로 변환하는 함수 (표시용)
export function mapDBUnitTypeToLegacy(dbType: DBUnitType): LegacyUnitType {
  const mapping: Partial<Record<DBUnitType, LegacyUnitType>> = {
    'INF': 'INFANTRY',
    'ART': 'ARTILLERY',
    'ARM': 'ARMOR',
    'ENG': 'ENGINEERING',
    'COM': 'SIGNAL',
    'INT': 'SIGNAL',
    'AVN': 'AVIATION',
    'CBR': 'ENGINEERING',
    'LOG': 'LOGISTICS',
    'MED': 'LOGISTICS',
    'MP': 'LOGISTICS',
    'EDU': 'TRAINING',
    'SF': 'SPECIAL',
    'ADA': 'ARTILLERY',
    'CMD': 'HQ',
  };
  return mapping[dbType] || 'INFANTRY';
}

// 레거시 타입 라벨 (기존 호환성 유지)
export const LEGACY_UNIT_TYPE_LABELS: Record<LegacyUnitType, string> = {
  'HQ': '본부',
  'INFANTRY': '보병',
  'MECHANIZED': '기계화',
  'ARMOR': '기갑',
  'ARTILLERY': '포병',
  'SPECIAL': '특수전',
  'GOP': 'GOP (전방)',
  'TRAINING': '교육훈련',
  'LOGISTICS': '군수지원',
  'AVIATION': '항공',
  'SIGNAL': '정보통신',
  'ENGINEERING': '공병',
  'RESERVE': '동원예비',
};

// DB 타입 라벨
export const DB_UNIT_TYPE_LABELS: Record<DBUnitType, string> = {
  'INF': '보병',
  'ART': '포병',
  'ARM': '기갑',
  'ENG': '공병',
  'COM': '통신',
  'INT': '정보',
  'AVN': '항공',
  'CBR': '화생방',
  'LOG': '군수/수송',
  'MED': '의무',
  'MP': '헌병/군사경찰',
  'EDU': '교육',
  'SF': '특수전',
  'ADA': '방공',
  'CMD': '지휘',
};

export interface ArmyUnit {
  id: string;
  name: string;
  parentId: string | null;
  level: UnitLevel; // DB 설계에 맞춘 타입
  // 지도 표시용 데이터 (선택적)
  lat?: number;
  lng?: number;
  risk?: number;
  unitType?: DBUnitType; // DB 설계에 맞춘 타입
  region?: string;     // 지역 (기상 연계용)
}

// 부대별 위치 및 위험도 데이터 (민감 정보 제거: commander, personnel)
export const UNIT_LOCATIONS: Record<string, { lat: number; lng: number; risk: number; unitType?: LegacyUnitType; region?: string }> = {
  // 육군본부
  'hq': { lat: 37.48, lng: 127.04, risk: 25, unitType: 'HQ', region: '경기 계룡' },
  
  // 직할부대
  'sdc': { lat: 37.53, lng: 127.00, risk: 32, unitType: 'INFANTRY', region: '서울' },
  'sdc-div-52': { lat: 37.58, lng: 126.95, risk: 28, unitType: 'INFANTRY', region: '서울 서부' },
  'sdc-div-56': { lat: 37.48, lng: 127.08, risk: 35, unitType: 'INFANTRY', region: '서울 동부' },
  'swc': { lat: 37.45, lng: 127.12, risk: 45, unitType: 'SPECIAL', region: '경기 성남' },
  'swc-bde-sf-1': { lat: 37.42, lng: 127.15, risk: 48, unitType: 'SPECIAL', region: '경기 성남' },
  'swc-bde-sf-7': { lat: 37.47, lng: 127.10, risk: 52, unitType: 'SPECIAL', region: '경기 성남' },
  'tradoc': { lat: 36.30, lng: 127.35, risk: 22, unitType: 'TRAINING', region: '충남 논산' },
  'tradoc-katc': { lat: 36.12, lng: 128.35, risk: 18, unitType: 'TRAINING', region: '경북 영천' },
  'amc': { lat: 36.95, lng: 127.15, risk: 15, unitType: 'LOGISTICS', region: '경기 평택' },
  'hrc': { lat: 37.50, lng: 127.02, risk: 12, unitType: 'HQ', region: '서울' },
  'amsc': { lat: 36.85, lng: 127.25, risk: 38, unitType: 'ARTILLERY', region: '충남' },
  'aac': { lat: 37.15, lng: 127.08, risk: 42, unitType: 'AVIATION', region: '경기' },
  'amfc': { lat: 36.65, lng: 127.45, risk: 20, unitType: 'RESERVE', region: '충남' },
  'kma': { lat: 37.62, lng: 127.08, risk: 15, unitType: 'TRAINING', region: '서울 노원' },
  'kma3': { lat: 35.88, lng: 128.58, risk: 14, unitType: 'TRAINING', region: '경북 영천' },
  
  // 지상작전사령부
  'goc': { lat: 37.75, lng: 127.05, risk: 35, unitType: 'HQ', region: '경기 용인' },
  'goc-div-36': { lat: 37.65, lng: 126.92, risk: 38, unitType: 'INFANTRY', region: '경기 고양' },
  'goc-div-55': { lat: 37.58, lng: 127.12, risk: 32, unitType: 'INFANTRY', region: '경기 남양주' },
  
  // 수도군단
  'corps-cap': { lat: 37.68, lng: 126.88, risk: 42, unitType: 'INFANTRY', region: '경기 고양' },
  'corps-cap-div-17': { lat: 37.72, lng: 126.85, risk: 45, unitType: 'INFANTRY', region: '경기 고양' },
  'corps-cap-div-51': { lat: 37.65, lng: 126.90, risk: 38, unitType: 'INFANTRY', region: '경기 고양' },
  
  // 제1군단 (GOP 전방부대)
  'corps-1': { lat: 37.95, lng: 127.05, risk: 55, unitType: 'GOP', region: '경기 연천' },
  'corps-1-div-1': { lat: 37.98, lng: 127.02, risk: 48, unitType: 'GOP', region: '경기 파주' },
  'corps-1-div-9': { lat: 37.92, lng: 127.08, risk: 58, unitType: 'GOP', region: '경기 연천' },
  'corps-1-div-25': { lat: 38.02, lng: 127.00, risk: 62, unitType: 'GOP', region: '경기 파주' },
  'corps-1-bde-armor-2': { lat: 37.88, lng: 127.10, risk: 52, unitType: 'ARMOR', region: '경기 포천' },
  'corps-1-bde-armor-30': { lat: 37.95, lng: 127.15, risk: 48, unitType: 'ARMOR', region: '경기 포천' },
  
  // 제2군단 (GOP 전방부대)
  'corps-2': { lat: 38.05, lng: 127.45, risk: 68, unitType: 'GOP', region: '강원 철원' },
  'corps-2-div-7': { lat: 38.10, lng: 127.48, risk: 72, unitType: 'GOP', region: '강원 철원' },
  'corps-2-div-15': { lat: 38.00, lng: 127.42, risk: 65, unitType: 'GOP', region: '강원 화천' },
  
  // 제3군단 (동해안)
  'corps-3': { lat: 37.75, lng: 128.90, risk: 58, unitType: 'GOP', region: '강원 고성' },
  'corps-3-div-12': { lat: 37.80, lng: 128.85, risk: 55, unitType: 'GOP', region: '강원 고성' },
  'corps-3-div-21': { lat: 37.70, lng: 128.95, risk: 62, unitType: 'GOP', region: '강원 양양' },
  'corps-3-div-22': { lat: 37.78, lng: 129.00, risk: 58, unitType: 'INFANTRY', region: '강원 강릉' },
  
  // 제5군단 (서부전선 GOP)
  'corps-5': { lat: 37.88, lng: 126.82, risk: 72, unitType: 'GOP', region: '경기 김포' },
  'corps-5-div-3': { lat: 37.92, lng: 126.78, risk: 75, unitType: 'GOP', region: '인천 강화' },
  'corps-5-div-5': { lat: 37.85, lng: 126.85, risk: 68, unitType: 'GOP', region: '경기 김포' },
  'corps-5-div-6': { lat: 37.90, lng: 126.88, risk: 70, unitType: 'GOP', region: '경기 파주' },
  
  // 제7군단 (기계화)
  'corps-7': { lat: 36.35, lng: 127.38, risk: 35, unitType: 'MECHANIZED', region: '충남 계룡' },
  'corps-7-div-mech-cap': { lat: 36.38, lng: 127.35, risk: 38, unitType: 'MECHANIZED', region: '충남 계룡' },
  'corps-7-div-rrd-2': { lat: 36.32, lng: 127.42, risk: 42, unitType: 'MECHANIZED', region: '충남 계룡' },
  'corps-7-div-8': { lat: 36.40, lng: 127.45, risk: 32, unitType: 'MECHANIZED', region: '충남' },
  'corps-7-div-11': { lat: 36.28, lng: 127.35, risk: 35, unitType: 'MECHANIZED', region: '충남' },
  
  // 제2작전사령부 (후방)
  'soc-2': { lat: 35.85, lng: 128.55, risk: 28, unitType: 'INFANTRY', region: '대구' },
  'soc-2-div-31': { lat: 36.80, lng: 127.15, risk: 25, unitType: 'INFANTRY', region: '충남 천안' },
  'soc-2-div-32': { lat: 36.15, lng: 127.45, risk: 28, unitType: 'INFANTRY', region: '충남 논산' },
  'soc-2-div-35': { lat: 36.35, lng: 127.95, risk: 32, unitType: 'INFANTRY', region: '충북 청주' },
  'soc-2-div-37': { lat: 35.15, lng: 128.95, risk: 22, unitType: 'INFANTRY', region: '경남 창원' },
  'soc-2-div-39': { lat: 35.90, lng: 127.75, risk: 26, unitType: 'INFANTRY', region: '전북 전주' },
  'soc-2-div-50': { lat: 35.55, lng: 129.35, risk: 24, unitType: 'INFANTRY', region: '경북 포항' },
  'soc-2-div-53': { lat: 35.25, lng: 128.60, risk: 20, unitType: 'INFANTRY', region: '경남 창원' },
};

// UNIT_LOCATIONS의 unitType을 DBUnitType으로 변환하는 헬퍼 함수
function convertUnitLocationToDB(location: { lat: number; lng: number; risk: number; unitType?: LegacyUnitType; region?: string }): { lat: number; lng: number; risk: number; unitType?: DBUnitType; region?: string } {
  if (!location.unitType) return location;
  return {
    ...location,
    unitType: mapLegacyUnitTypeToDB(location.unitType),
  };
}

export const ARMY_UNITS: ArmyUnit[] = [
  // ========================================
  // 직할부대 (최상위)
  // ========================================

  // 수도방위사령부
  { id: 'sdc', name: '수도방위사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['sdc']) },
  { id: 'sdc-div-52', name: '제52보병사단', parentId: 'sdc', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['sdc-div-52'] },
  { id: 'sdc-div-56', name: '제56보병사단', parentId: 'sdc', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['sdc-div-56'] },
  { id: 'sdc-bde-ad-1', name: '제1방공여단', parentId: 'sdc', level: 'BRIG' },
  { id: 'sdc-grp-guard-1', name: '제1경비단', parentId: 'sdc', level: 'REGT' },
  { id: 'sdc-bn-guard-1', name: '제1경비대대', parentId: 'sdc-grp-guard-1', level: 'BN' },
  { id: 'sdc-bn-sm-2', name: '제2특수임무대대', parentId: 'sdc-grp-guard-1', level: 'BN' },
  { id: 'sdc-bn-sm-35', name: '제35특수임무대대', parentId: 'sdc-grp-guard-1', level: 'BN' },
  { id: 'sdc-grp-guard-55', name: '제55경비단', parentId: 'sdc', level: 'REGT' },
  { id: 'sdc-grp-sig-122', name: '제122정보통신단', parentId: 'sdc', level: 'REGT' },
  { id: 'sdc-grp-eng-1113', name: '제1113공병단', parentId: 'sdc', level: 'REGT' },
  { id: 'sdc-grp-mp', name: '군사경찰단', parentId: 'sdc', level: 'REGT' },
  { id: 'sdc-bn-cbrn-22', name: '제22화생방대대', parentId: 'sdc', level: 'BN' },
  { id: 'sdc-bn-css', name: '군수지원대대', parentId: 'sdc', level: 'BN' },
  { id: 'sdc-bn-shield', name: '방패교육대', parentId: 'sdc', level: 'BN' },

  // 육군특수전사령부
  { id: 'swc', name: '육군특수전사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['swc'] },
  { id: 'swc-school', name: '특수전학교', parentId: 'swc', level: 'BRIG' },
  { id: 'swc-bde-sf-1', name: '제1공수특전여단', parentId: 'swc', level: 'BRIG', ...convertUnitLocationToDB(UNIT_LOCATIONS['swc-bde-sf-1'] },
  { id: 'swc-bde-sf-3', name: '제3공수특전여단', parentId: 'swc', level: 'BRIG' },
  { id: 'swc-bde-sf-7', name: '제7공수특전여단', parentId: 'swc', level: 'BRIG', ...convertUnitLocationToDB(UNIT_LOCATIONS['swc-bde-sf-7'] },
  { id: 'swc-bde-sf-9', name: '제9공수특전여단', parentId: 'swc', level: 'BRIG' },
  { id: 'swc-bde-sf-11', name: '제11공수특전여단', parentId: 'swc', level: 'BRIG' },
  { id: 'swc-bde-sf-13', name: '제13특수임무여단', parentId: 'swc', level: 'BRIG' },
  { id: 'swc-grp-707', name: '제707특수임무단', parentId: 'swc', level: 'REGT' },
  { id: 'swc-grp-ipsd', name: '국제평화지원단', parentId: 'swc', level: 'REGT' },
  { id: 'swc-grp-soag', name: '특수작전항공단', parentId: 'swc', level: 'REGT' },
  { id: 'swc-grp-sig-123', name: '제123정보통신단', parentId: 'swc', level: 'REGT' },

  // 육군교육사령부
  { id: 'tradoc', name: '육군교육사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['tradoc'] },
  { id: 'tradoc-nco', name: '육군부사관학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-nco-grp', name: '교육단', parentId: 'tradoc-nco', level: 'REGT' },
  { id: 'tradoc-katc', name: '육군훈련소', parentId: 'tradoc', level: 'BRIG', ...convertUnitLocationToDB(UNIT_LOCATIONS['tradoc-katc'] },
  { id: 'tradoc-katc-reg-23', name: '제23신병교육연대', parentId: 'tradoc-katc', level: 'REGT' },
  { id: 'tradoc-katc-reg-25', name: '제25신병교육연대', parentId: 'tradoc-katc', level: 'REGT' },
  { id: 'tradoc-katc-reg-26', name: '제26신병교육연대', parentId: 'tradoc-katc', level: 'REGT' },
  { id: 'tradoc-katc-reg-27', name: '제27신병교육연대', parentId: 'tradoc-katc', level: 'REGT' },
  { id: 'tradoc-katc-reg-28', name: '제28신병교육연대', parentId: 'tradoc-katc', level: 'REGT' },
  { id: 'tradoc-katc-reg-29', name: '제29신병교육연대', parentId: 'tradoc-katc', level: 'REGT' },
  { id: 'tradoc-katc-reg-30', name: '제30신병교육연대', parentId: 'tradoc-katc', level: 'REGT' },
  { id: 'tradoc-katc-hosp', name: '육군훈련소지구병원', parentId: 'tradoc-katc', level: 'BN' },
  { id: 'tradoc-admin', name: '육군종합행정학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-inf', name: '육군보병학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-inf-bde', name: '교육여단', parentId: 'tradoc-inf', level: 'BRIG' },
  { id: 'tradoc-arty', name: '육군포병학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-arty-bde', name: '교육여단', parentId: 'tradoc-arty', level: 'BRIG' },
  { id: 'tradoc-arty-bn-298', name: '제298포병대대', parentId: 'tradoc-arty-bde', level: 'BN' },
  { id: 'tradoc-armor', name: '육군기계화학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-armor-bde', name: '교육여단', parentId: 'tradoc-armor', level: 'BRIG' },
  { id: 'tradoc-armor-bn-9', name: '제9전차대대', parentId: 'tradoc-armor-bde', level: 'BN' },
  { id: 'tradoc-armor-bn-11', name: '제11전차대대', parentId: 'tradoc-armor-bde', level: 'BN' },
  { id: 'tradoc-log', name: '육군종합군수학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-log-grp-log', name: '군수교육단', parentId: 'tradoc-log', level: 'BRIG' },
  { id: 'tradoc-log-grp-ord', name: '병기교육단', parentId: 'tradoc-log', level: 'BRIG' },
  { id: 'tradoc-log-grp-qm', name: '병참교육단', parentId: 'tradoc-log', level: 'BRIG' },
  { id: 'tradoc-log-grp-trans', name: '수송교육단', parentId: 'tradoc-log', level: 'BRIG' },
  { id: 'tradoc-log-reg-trans-1', name: '제1수송교육연대', parentId: 'tradoc-log-grp-trans', level: 'REGT' },
  { id: 'tradoc-log-reg-trans-2', name: '제2수송교육연대', parentId: 'tradoc-log-grp-trans', level: 'REGT' },
  { id: 'tradoc-log-reg-trans-3', name: '제3수송교육연대', parentId: 'tradoc-log-grp-trans', level: 'REGT' },
  { id: 'tradoc-eng', name: '육군공병학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-intel', name: '육군정보학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-sig', name: '육군정보통신학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-avn', name: '육군항공학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-ada', name: '육군방공학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-cbrn', name: '육군화생방학교', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-kctc', name: '육군과학화전투훈련단', parentId: 'tradoc', level: 'BRIG' },
  { id: 'tradoc-kctc-reg', name: '전문대항군연대', parentId: 'tradoc-kctc', level: 'REGT' },
  { id: 'tradoc-leadership', name: '육군리더십센터', parentId: 'tradoc', level: 'REGT' },
  { id: 'tradoc-sangmu-spt', name: '상무대 근무지원단', parentId: 'tradoc', level: 'REGT' },
  { id: 'tradoc-k9', name: '군견교육대', parentId: 'tradoc', level: 'BN' },

  // 육군군수사령부
  { id: 'amc', name: '육군군수사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['amc'] },
  { id: 'amc-supply', name: '육군종합보급창', parentId: 'amc', level: 'BRIG' },
  { id: 'amc-supply-grp-1', name: '제1보급단', parentId: 'amc-supply', level: 'REGT' },
  { id: 'amc-supply-grp-2', name: '제2보급단', parentId: 'amc-supply', level: 'REGT' },
  { id: 'amc-supply-grp-3', name: '제3보급단', parentId: 'amc-supply', level: 'REGT' },
  { id: 'amc-maint', name: '육군종합정비창', parentId: 'amc', level: 'BRIG' },
  { id: 'amc-maint-grp-mobile', name: '기동화력장비정비단', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-maint-grp-parts', name: '기동화력부품정비단', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-maint-grp-wpn', name: '총포사통장비정비단', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-maint-grp-sig', name: '통신전자장비정비단', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-maint-grp-prod', name: '생산지원단', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-maint-grp-spec', name: '특수무기정비단', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-maint-grp-avn', name: '항공기정비단', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-maint-research', name: '정비기술연구소', parentId: 'amc-maint', level: 'REGT' },
  { id: 'amc-ammo', name: '육군탄약지원사령부', parentId: 'amc', level: 'BRIG' },

  // 육군인사사령부
  { id: 'hrc', name: '육군인사사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['hrc'] },
  { id: 'hrc-records', name: '육군기록정보관리단', parentId: 'hrc', level: 'REGT' },
  { id: 'hrc-welfare', name: '육군복지지원대대', parentId: 'hrc', level: 'BN' },
  { id: 'hrc-8army', name: '주한 미8군 한국군지원단', parentId: 'hrc', level: 'REGT' },
  { id: 'hrc-repldep', name: '중앙보충대대', parentId: 'hrc', level: 'BN' },
  { id: 'hrc-band', name: '육군군악의장대대', parentId: 'hrc', level: 'BN' },

  // 육군미사일전략사령부
  { id: 'amsc', name: '육군미사일전략사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['amsc'] },

  // 육군항공사령부
  { id: 'aac', name: '육군항공사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['aac'] },
  { id: 'aac-bde-1', name: '제1전투항공여단', parentId: 'aac', level: 'BRIG' },
  { id: 'aac-bde-2', name: '제2전투항공여단', parentId: 'aac', level: 'BRIG' },
  { id: 'aac-bde-maint', name: '항공정비여단', parentId: 'aac', level: 'BRIG' },
  { id: 'aac-medevac', name: '의무후송항공대', parentId: 'aac', level: 'BN' },

  // 육군동원전력사령부
  { id: 'amfc', name: '육군동원전력사령부', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['amfc'] },
  { id: 'amfc-div-60', name: '제60보병사단', parentId: 'amfc', level: 'DIV' },
  { id: 'amfc-div-66', name: '제66보병사단', parentId: 'amfc', level: 'DIV' },
  { id: 'amfc-div-72', name: '제72보병사단', parentId: 'amfc', level: 'DIV' },
  { id: 'amfc-div-73', name: '제73보병사단', parentId: 'amfc', level: 'DIV' },
  { id: 'amfc-div-75', name: '제75보병사단', parentId: 'amfc', level: 'DIV' },
  { id: 'amfc-grp-31', name: '제31동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-32', name: '제32동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-35', name: '제35동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-37', name: '제37동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-50', name: '제50동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-51', name: '제51동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-52', name: '제52동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-53', name: '제53동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-55', name: '제55동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-56', name: '제56동원지원단', parentId: 'amfc', level: 'REGT' },
  { id: 'amfc-grp-convoy', name: '동원자원호송단', parentId: 'amfc', level: 'REGT' },

  // 육군사관학교
  { id: 'kma', name: '육군사관학교', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['kma'] },
  { id: 'kma-prof', name: '교수부', parentId: 'kma', level: 'BRIG' },
  { id: 'kma-cadet', name: '생도대', parentId: 'kma', level: 'BRIG' },
  { id: 'kma-staff', name: '참모부', parentId: 'kma', level: 'REGT' },

  // 육군3사관학교
  { id: 'kma3', name: '육군3사관학교', parentId: null, level: 'DRU', ...convertUnitLocationToDB(UNIT_LOCATIONS['kma3'] },
  { id: 'kma3-prof', name: '교수부', parentId: 'kma3', level: 'BRIG' },
  { id: 'kma3-cadet', name: '생도대', parentId: 'kma3', level: 'BRIG' },
  { id: 'kma3-staff', name: '참모부', parentId: 'kma3', level: 'REGT' },

  // 육군학생군사학교
  { id: 'rotc-school', name: '육군학생군사학교', parentId: null, level: 'DRU' },
  { id: 'rotc-school-grp', name: '학생군사교육단', parentId: 'rotc-school', level: 'REGT' },

  // 기타 직할부대
  { id: 'awc', name: '육군대학', parentId: null, level: 'DRU' },
  { id: 'cid', name: '육군수사단', parentId: null, level: 'DRU' },
  { id: 'jag', name: '육군검찰단', parentId: null, level: 'DRU' },
  { id: 'bctp', name: '육군전투지휘훈련단', parentId: null, level: 'DRU' },
  { id: 'tiger-plan', name: '육군아미타이거4.0통합기획단', parentId: null, level: 'DRU' },
  { id: 'ai-grp', name: '육군지능정보기술단', parentId: null, level: 'DRU' },
  { id: 'peo', name: '육군전력지원체계사업단', parentId: null, level: 'DRU' },
  { id: 'safety', name: '육군전투준비안전단', parentId: null, level: 'DRU' },
  { id: 'test', name: '육군시험평가단', parentId: null, level: 'DRU' },
  { id: 'cyber', name: '육군사이버작전센터', parentId: null, level: 'DRU' },
  { id: 'future', name: '육군미래혁신연구센터', parentId: null, level: 'DRU' },
  { id: 'guard-2', name: '제2경비단', parentId: null, level: 'DRU' },

  // ========================================
  // 예하부대 (최상위)
  // ========================================

  // 지상작전사령부
  { id: 'goc', name: '지상작전사령부', parentId: null, level: 'CMD', ...convertUnitLocationToDB(UNIT_LOCATIONS['goc'] },
  { id: 'goc-div-36', name: '제36보병사단', parentId: 'goc', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['goc-div-36'] },
  { id: 'goc-div-55', name: '제55보병사단', parentId: 'goc', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['goc-div-55'] },
  { id: 'goc-lsc-1', name: '제1군수지원사령부', parentId: 'goc', level: 'BRIG' },
  { id: 'goc-lsc-1-grp-cap', name: '수도군수지원단', parentId: 'goc-lsc-1', level: 'REGT' },
  { id: 'goc-lsc-1-grp-6', name: '제6군수지원단', parentId: 'goc-lsc-1', level: 'REGT' },
  { id: 'goc-lsc-1-grp-8', name: '제8군수지원단', parentId: 'goc-lsc-1', level: 'REGT' },
  { id: 'goc-fires', name: '화력여단', parentId: 'goc', level: 'BRIG' },
  { id: 'goc-sig', name: '정보통신여단', parentId: 'goc', level: 'BRIG' },
  { id: 'goc-smb', name: '특수기동지원여단', parentId: 'goc', level: 'BRIG' },
  { id: 'goc-eng-1101', name: '제1101공병단', parentId: 'goc', level: 'REGT' },
  { id: 'goc-intel', name: '지상정보여단', parentId: 'goc', level: 'BRIG' },
  { id: 'goc-drone', name: '드론봇전투단', parentId: 'goc-intel', level: 'REGT' },
  { id: 'goc-mp', name: '군사경찰단', parentId: 'goc', level: 'REGT' },
  { id: 'goc-spt', name: '지상작전사령부 근무지원단', parentId: 'goc', level: 'REGT' },
  { id: 'goc-terrain-3', name: '제3지형분석대', parentId: 'goc', level: 'BN' },
  { id: 'goc-cfc-coord', name: '연합사단협조단', parentId: 'goc', level: 'BRIG' },
  { id: 'goc-asoc', name: '공군 항공지원작전본부', parentId: 'goc', level: 'BRIG' },
  { id: 'goc-jsa', name: 'JSA경비대대', parentId: 'goc', level: 'BN' },

  // 1.2.1.1 수도군단
  { id: 'corps-cap', name: '수도군단', parentId: 'goc', level: 'CORPS', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-cap'] },
  { id: 'corps-cap-div-17', name: '제17보병사단', parentId: 'corps-cap', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-cap-div-17'] },
  { id: 'corps-cap-div-17-grp-3', name: '제3경비단', parentId: 'corps-cap-div-17', level: 'REGT' },
  { id: 'corps-cap-div-51', name: '제51보병사단', parentId: 'corps-cap', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-cap-div-51'] },
  { id: 'corps-cap-bde-arty', name: '수도포병여단', parentId: 'corps-cap', level: 'BRIG' },
  { id: 'corps-cap-grp-avn-10', name: '제10항공단', parentId: 'corps-cap', level: 'REGT' },
  { id: 'corps-cap-grp-ada-10', name: '제10방공단', parentId: 'corps-cap', level: 'REGT' },
  { id: 'corps-cap-grp-sig-100', name: '제100정보통신단', parentId: 'corps-cap', level: 'REGT' },
  { id: 'corps-cap-grp-eng-1175', name: '제1175공병단', parentId: 'corps-cap', level: 'REGT' },
  { id: 'corps-cap-reg-700', name: '제700특공연대', parentId: 'corps-cap', level: 'REGT' },
  { id: 'corps-cap-bn-cbrn-10', name: '제10화생방대대', parentId: 'corps-cap', level: 'BN' },
  { id: 'corps-cap-bn-intel-140', name: '제140정보대대', parentId: 'corps-cap', level: 'BN' },

  // 1.2.1.2 제1군단
  { id: 'corps-1', name: '제1군단', parentId: 'goc', level: 'CORPS', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-1'] },
  { id: 'corps-1-div-1', name: '제1보병사단', parentId: 'corps-1', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-1-div-1'] },
  { id: 'corps-1-div-9', name: '제9보병사단', parentId: 'corps-1', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-1-div-9'] },
  { id: 'corps-1-div-25', name: '제25보병사단', parentId: 'corps-1', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-1-div-25'] },
  { id: 'corps-1-bde-eng-1', name: '제1공병여단', parentId: 'corps-1', level: 'BRIG' },
  { id: 'corps-1-bde-arty-1', name: '제1포병여단', parentId: 'corps-1', level: 'BRIG' },
  { id: 'corps-1-bde-armor-2', name: '제2기갑여단', parentId: 'corps-1', level: 'BRIG', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-1-bde-armor-2'] },
  { id: 'corps-1-bde-armor-30', name: '제30기갑여단', parentId: 'corps-1', level: 'BRIG', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-1-bde-armor-30'] },
  { id: 'corps-1-bde-css-1', name: '제1군수지원여단', parentId: 'corps-1', level: 'BRIG' },
  { id: 'corps-1-grp-avn-11', name: '제11항공단', parentId: 'corps-1', level: 'REGT' },
  { id: 'corps-1-grp-ada-11', name: '제11방공단', parentId: 'corps-1', level: 'REGT' },
  { id: 'corps-1-grp-sig-101', name: '제101정보통신단', parentId: 'corps-1', level: 'REGT' },
  { id: 'corps-1-reg-guard-301', name: '제301경비연대', parentId: 'corps-1', level: 'REGT' },
  { id: 'corps-1-reg-701', name: '제701특공연대', parentId: 'corps-1', level: 'REGT' },
  { id: 'corps-1-grp-mp', name: '군사경찰단', parentId: 'corps-1', level: 'REGT' },
  { id: 'corps-1-bn-intel-141', name: '제141정보대대', parentId: 'corps-1', level: 'BN' },
  { id: 'corps-1-bn-cbrn-11', name: '제11화생방대대', parentId: 'corps-1', level: 'BN' },

  // 1.2.1.3 제2군단
  { id: 'corps-2', name: '제2군단', parentId: 'goc', level: 'CORPS', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-2'] },
  { id: 'corps-2-div-7', name: '제7보병사단', parentId: 'corps-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-2-div-7'] },
  { id: 'corps-2-div-15', name: '제15보병사단', parentId: 'corps-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-2-div-15'] },
  { id: 'corps-2-bde-eng-2', name: '제2공병여단', parentId: 'corps-2', level: 'BRIG' },
  { id: 'corps-2-bde-arty-2', name: '제2포병여단', parentId: 'corps-2', level: 'BRIG' },
  { id: 'corps-2-bde-armor-3', name: '제3기갑여단', parentId: 'corps-2', level: 'BRIG' },
  { id: 'corps-2-bde-css-2', name: '제2군수지원여단', parentId: 'corps-2', level: 'BRIG' },
  { id: 'corps-2-grp-sig-102', name: '제102정보통신단', parentId: 'corps-2', level: 'REGT' },
  { id: 'corps-2-grp-avn-12', name: '제12항공단', parentId: 'corps-2', level: 'REGT' },
  { id: 'corps-2-grp-ada-12', name: '제12방공단', parentId: 'corps-2', level: 'REGT' },
  { id: 'corps-2-grp-guard-302', name: '제302경비단', parentId: 'corps-2', level: 'REGT' },
  { id: 'corps-2-reg-702', name: '제702특공연대', parentId: 'corps-2', level: 'REGT' },
  { id: 'corps-2-grp-mp', name: '군사경찰단', parentId: 'corps-2', level: 'REGT' },
  { id: 'corps-2-bn-intel-142', name: '제142정보대대', parentId: 'corps-2', level: 'BN' },
  { id: 'corps-2-bn-cbrn-12', name: '제12화생방대대', parentId: 'corps-2', level: 'BN' },
  { id: 'corps-2-bn-ada-512', name: '제512방공대대', parentId: 'corps-2', level: 'BN' },

  // 1.2.1.4 제3군단
  { id: 'corps-3', name: '제3군단', parentId: 'goc', level: 'CORPS', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-3'] },
  { id: 'corps-3-div-12', name: '제12보병사단', parentId: 'corps-3', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-3-div-12'] },
  { id: 'corps-3-div-21', name: '제21보병사단', parentId: 'corps-3', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-3-div-21'] },
  { id: 'corps-3-div-22', name: '제22보병사단', parentId: 'corps-3', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-3-div-22'] },
  { id: 'corps-3-bde-eng-3', name: '제3공병여단', parentId: 'corps-3', level: 'BRIG' },
  { id: 'corps-3-bde-arty-3', name: '제3포병여단', parentId: 'corps-3', level: 'BRIG' },
  { id: 'corps-3-bde-armor-20', name: '제20기갑여단', parentId: 'corps-3', level: 'BRIG' },
  { id: 'corps-3-bde-armor-102', name: '제102기갑여단', parentId: 'corps-3', level: 'BRIG' },
  { id: 'corps-3-bde-mtn-1', name: '제1산악여단', parentId: 'corps-3', level: 'BRIG' },
  { id: 'corps-3-bde-guard-23', name: '제23경비여단', parentId: 'corps-3', level: 'BRIG' },
  { id: 'corps-3-bde-css-3', name: '제3군수지원여단', parentId: 'corps-3', level: 'BRIG' },
  { id: 'corps-3-grp-css-east', name: '동해안군수지원단', parentId: 'corps-3-bde-css-3', level: 'REGT' },
  { id: 'corps-3-grp-avn-13', name: '제13항공단', parentId: 'corps-3', level: 'REGT' },
  { id: 'corps-3-grp-ada-13', name: '제13방공단', parentId: 'corps-3', level: 'REGT' },
  { id: 'corps-3-grp-sig-103', name: '제103정보통신단', parentId: 'corps-3', level: 'REGT' },
  { id: 'corps-3-grp-guard-303', name: '제303경비단', parentId: 'corps-3', level: 'REGT' },
  { id: 'corps-3-reg-703', name: '제703특공연대', parentId: 'corps-3', level: 'REGT' },
  { id: 'corps-3-grp-mp', name: '군사경찰단', parentId: 'corps-3', level: 'REGT' },
  { id: 'corps-3-bn-cbrn-13', name: '제13화생방대대', parentId: 'corps-3', level: 'BN' },
  { id: 'corps-3-bn-intel-143', name: '제143정보대대', parentId: 'corps-3', level: 'BN' },

  // 1.2.1.5 제5군단
  { id: 'corps-5', name: '제5군단', parentId: 'goc', level: 'CORPS', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-5'] },
  { id: 'corps-5-div-3', name: '제3보병사단', parentId: 'corps-5', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-5-div-3'] },
  { id: 'corps-5-div-5', name: '제5보병사단', parentId: 'corps-5', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-5-div-5'] },
  { id: 'corps-5-div-6', name: '제6보병사단', parentId: 'corps-5', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-5-div-6'] },
  { id: 'corps-5-bde-armor-1', name: '제1기갑여단', parentId: 'corps-5', level: 'BRIG' },
  { id: 'corps-5-bde-armor-5', name: '제5기갑여단', parentId: 'corps-5', level: 'BRIG' },
  { id: 'corps-5-bde-eng-5', name: '제5공병여단', parentId: 'corps-5', level: 'BRIG' },
  { id: 'corps-5-bde-arty-5', name: '제5포병여단', parentId: 'corps-5', level: 'BRIG' },
  { id: 'corps-5-bde-css-5', name: '제5군수지원여단', parentId: 'corps-5', level: 'BRIG' },
  { id: 'corps-5-grp-avn-15', name: '제15항공단', parentId: 'corps-5', level: 'REGT' },
  { id: 'corps-5-grp-ada-15', name: '제15방공단', parentId: 'corps-5', level: 'REGT' },
  { id: 'corps-5-grp-sig-105', name: '제105정보통신단', parentId: 'corps-5', level: 'REGT' },
  { id: 'corps-5-reg-guard-305', name: '제305경비연대', parentId: 'corps-5', level: 'REGT' },
  { id: 'corps-5-reg-705', name: '제705특공연대', parentId: 'corps-5', level: 'REGT' },
  { id: 'corps-5-grp-mp', name: '군사경찰단', parentId: 'corps-5', level: 'REGT' },
  { id: 'corps-5-bn-cbrn-15', name: '제15화생방대대', parentId: 'corps-5', level: 'BN' },
  { id: 'corps-5-bn-intel-145', name: '제145정보대대', parentId: 'corps-5', level: 'BN' },

  // 1.2.1.6 제7군단
  { id: 'corps-7', name: '제7군단', parentId: 'goc', level: 'CORPS', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-7'] },
  { id: 'corps-7-div-mech-cap', name: '수도기계화보병사단', parentId: 'corps-7', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-7-div-mech-cap'] },
  { id: 'corps-7-div-rrd-2', name: '제2신속대응사단', parentId: 'corps-7', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-7-div-rrd-2'] },
  { id: 'corps-7-div-8', name: '제8기동사단', parentId: 'corps-7', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-7-div-8'] },
  { id: 'corps-7-div-11', name: '제11기동사단', parentId: 'corps-7', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['corps-7-div-11'] },
  { id: 'corps-7-bde-eng-7', name: '제7공병여단', parentId: 'corps-7', level: 'BRIG' },
  { id: 'corps-7-bde-arty-7', name: '제7포병여단', parentId: 'corps-7', level: 'BRIG' },
  { id: 'corps-7-grp-css-7', name: '제7군수지원단', parentId: 'corps-7', level: 'REGT' },
  { id: 'corps-7-grp-sig-107', name: '제107정보통신단', parentId: 'corps-7', level: 'REGT' },
  { id: 'corps-7-grp-avn-17', name: '제17항공단', parentId: 'corps-7', level: 'REGT' },
  { id: 'corps-7-grp-mp', name: '군사경찰단', parentId: 'corps-7', level: 'REGT' },
  { id: 'corps-7-bn-air-1', name: '제1강습대대', parentId: 'corps-7', level: 'BN' },
  { id: 'corps-7-bn-air-2', name: '제2강습대대', parentId: 'corps-7', level: 'BN' },
  { id: 'corps-7-bn-ada-517', name: '제517방공대대', parentId: 'corps-7', level: 'BN' },
  { id: 'corps-7-bn-intel-147', name: '제147정보대대', parentId: 'corps-7', level: 'BN' },
  { id: 'corps-7-bn-cbrn-17', name: '제17화생방대대', parentId: 'corps-7', level: 'BN' },

  // 1.2.2 제2작전사령부
  { id: 'soc-2', name: '제2작전사령부', parentId: 'subordinate-units', level: 'CMD', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2'] },
  { id: 'soc-2-div-31', name: '제31보병사단', parentId: 'soc-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2-div-31'] },
  { id: 'soc-2-div-32', name: '제32보병사단', parentId: 'soc-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2-div-32'] },
  { id: 'soc-2-grp-sejong', name: '세종시경비단', parentId: 'soc-2-div-32', level: 'REGT' },
  { id: 'soc-2-div-35', name: '제35보병사단', parentId: 'soc-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2-div-35'] },
  { id: 'soc-2-div-37', name: '제37보병사단', parentId: 'soc-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2-div-37'] },
  { id: 'soc-2-div-39', name: '제39보병사단', parentId: 'soc-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2-div-39'] },
  { id: 'soc-2-div-50', name: '제50보병사단', parentId: 'soc-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2-div-50'] },
  { id: 'soc-2-div-53', name: '제53보병사단', parentId: 'soc-2', level: 'DIV', ...convertUnitLocationToDB(UNIT_LOCATIONS['soc-2-div-53'] },
  { id: 'soc-2-lsc-5', name: '제5군수지원사령부', parentId: 'soc-2', level: 'BRIG' },
  { id: 'soc-2-lsc-5-grp-51', name: '제51군수지원단', parentId: 'soc-2-lsc-5', level: 'REGT' },
  { id: 'soc-2-lsc-5-grp-52', name: '제52군수지원단', parentId: 'soc-2-lsc-5', level: 'REGT' },
  { id: 'soc-2-lsc-5-grp-53', name: '제53군수지원단', parentId: 'soc-2-lsc-5', level: 'REGT' },
  { id: 'soc-2-spt', name: '제2작전사령부 근무지원단', parentId: 'soc-2', level: 'REGT' },
  { id: 'soc-2-grp-sig-12', name: '제12정보통신단', parentId: 'soc-2', level: 'REGT' },
  { id: 'soc-2-grp-avn-21', name: '제21항공단', parentId: 'soc-2', level: 'REGT' },
  { id: 'soc-2-grp-eng-1115', name: '제1115공병단', parentId: 'soc-2', level: 'REGT' },
  { id: 'soc-2-grp-eng-1117', name: '제1117공병단', parentId: 'soc-2', level: 'REGT' },
  { id: 'soc-2-grp-mp', name: '군사경찰단', parentId: 'soc-2', level: 'REGT' },
  { id: 'soc-2-bn-chem-19', name: '제19화학대대', parentId: 'soc-2', level: 'BN' },
  { id: 'soc-2-repldep', name: '제2보충대', parentId: 'soc-2', level: 'BN' },
  { id: 'soc-2-terrain', name: '지형분석대', parentId: 'soc-2', level: 'BN' },
  { id: 'soc-2-print', name: '제5지구인쇄소', parentId: 'soc-2', level: 'BN' },
];

// 검색 가능한 부대 목록 (위치 정보가 있는 부대만)
export function getSearchableUnits(): ArmyUnit[] {
  return ARMY_UNITS.filter(unit => unit.lat !== undefined && unit.lng !== undefined);
}

// 유틸리티 함수들
export function getUnitById(id: string): ArmyUnit | undefined {
  return ARMY_UNITS.find(unit => unit.id === id);
}

export function getChildUnits(parentId: string | null): ArmyUnit[] {
  return ARMY_UNITS.filter(unit => unit.parentId === parentId);
}

export function getUnitPath(unitId: string): ArmyUnit[] {
  const path: ArmyUnit[] = [];
  let current = getUnitById(unitId);
  
  while (current) {
    path.unshift(current);
    current = current.parentId ? getUnitById(current.parentId) : undefined;
  }
  
  return path;
}

export function getUnitFullName(unitId: string): string {
  const path = getUnitPath(unitId);
  return path
    .map(u => u.name)
    .join(' > ');
}

export function getUnitName(unitId: string): string {
  const unit = getUnitById(unitId);
  return unit?.name || unitId;
}

export function getAllDescendants(unitId: string): ArmyUnit[] {
  const descendants: ArmyUnit[] = [];
  const children = getChildUnits(unitId);
  
  for (const child of children) {
    descendants.push(child);
    descendants.push(...getAllDescendants(child.id));
  }
  
  return descendants;
}

export function hasChildren(unitId: string): boolean {
  return getChildUnits(unitId).length > 0;
}

// 레벨별 한글 라벨 (DB 설계 기반)
export const LEVEL_LABELS: Record<UnitLevel, string> = {
  HQ: '본부',
  CMD: '작전사령부',
  CORPS: '군단',
  DIV: '사단',
  BRIG: '여단',
  REGT: '연대/단',
  BN: '대대',
  CO: '중대',
  DRU: '직할대',
};

// 기존 호환성을 위한 export
export const UNIT_LEVEL_LABELS = LEVEL_LABELS;
export const UNIT_TYPE_LABELS = DB_UNIT_TYPE_LABELS; // DB 타입 라벨 사용
