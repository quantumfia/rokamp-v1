import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatbotSkeleton } from '@/components/skeletons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: Array<{
    title: string;
    source: string;
    url?: string;
  }>;
}

const SUGGESTED_QUESTIONS = [
  '동절기 차량 사고 예방 대책은?',
  '야간 훈련 시 안전 수칙 알려줘',
  '화재 예방 점검 항목이 뭐야?',
  '행군 중 저체온증 대처 방법은?',
];

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: '안녕하세요! 저는 ROKA-MP 안전 AI 어시스턴트입니다. 안전사고 예방에 관한 질문이 있으시면 언제든지 물어보세요.',
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = getAIResponse(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        references: response.references,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (question: string): { content: string; references: Array<{ title: string; source: string; url?: string }> } => {
    if (question.includes('차량') || question.includes('동절기')) {
      return {
        content: `동절기 차량 사고 예방을 위한 핵심 대책을 안내드립니다.

■ 출발 전 필수 점검사항
• 배터리 전압 12.4V 이상 유지, 부동액 농도 50% 확인
• 타이어 공기압 정상치 대비 10% 증가 주입
• 워셔액 동결 방지제 혼합 및 와이퍼 블레이드 상태 확인
• 연료 잔량 1/2 이상 유지 (결빙 방지)

■ 운행 중 안전수칙
• 급가속·급제동·급핸들 조작 금지 (ABS 작동 시에도 제동거리 2~3배 증가)
• 커브길 진입 전 충분한 감속, 기어 변속 최소화
• 결빙 의심구간: 교량, 터널 출입구, 음지, 고갯길
• 안전거리 건조노면 대비 2배 이상 확보

■ 비상대비 장구류
• 필수: 삼각대, 손전등, 견인로프, 구급함
• 동절기 추가: 스노우체인, 염화칼슘, 삽, 모래주머니
• 차량 고장 시: 갓길 정차 → 비상등 점등 → 삼각대 설치(100m 후방) → 대피`,
        references: [
          { title: '육군 차량 운행 안전관리 규정', source: '육군본부 2024.03', url: '#' },
          { title: '동절기 교통사고 예방 대책', source: '국방부 안전정책과', url: '#' },
          { title: '군용차량 정비 및 점검 기준', source: '육군 군수사령부', url: '#' },
        ]
      };
    }
    
    if (question.includes('야간') || question.includes('훈련')) {
      return {
        content: `야간 훈련 시 안전수칙을 안내드립니다.

■ 훈련 전 준비사항
• 훈련장 사전답사 실시 (주간에 위험요소 식별)
• 야광 식별띠, 안전조끼, 후레쉬 등 야간장비 지급 확인
• 통신장비 작동상태 및 비상연락체계 점검
• 의무요원 및 응급의약품 배치 확인

■ 이동 간 안전수칙
• 2인 1조 버디시스템 유지, 상호 위치 확인
• 식별표지(야광띠) 필수 착용, 이동 시 일렬종대 유지
• 차량 이동 시 유도요원 배치 및 서행 운전
• 절벽, 수로 등 위험지역 통제선 설치

■ 사격훈련 시 추가사항
• 조명탄 발사계획 수립 및 사격통제관 지정
• 탄착지역 이중 확인, 민간인 통제 철저
• 야간 표적 조명시설 점검

■ 비상상황 대응
• 낙오자 발생 시 즉시 훈련 중지 및 수색
• 부상자 발생 시 응급처치 후 즉시 후송`,
        references: [
          { title: '야간훈련 안전관리 지침', source: '육군훈련소 2024.06', url: '#' },
          { title: '훈련장 안전사고 예방 매뉴얼', source: '육군본부', url: '#' },
        ]
      };
    }
    
    if (question.includes('화재') || question.includes('점검')) {
      return {
        content: `화재 예방 점검 항목을 안내드립니다.

■ 일일 점검사항
• 전열기구 사용 후 전원 차단 확인
• 가스밸브 잠금 상태 확인
• 소화기 위치 및 압력게이지 정상 여부
• 비상구 및 대피로 장애물 적치 여부

■ 주간 점검사항
• 전기시설 누전 여부 (누전차단기 테스트)
• 콘센트 문어발 사용 및 과열 흔적
• 유류·가스 저장시설 누출 점검
• 소방시설 작동 테스트 (감지기, 경보기)

■ 월간 점검사항
• 소화기 외관 점검 및 충약 상태 확인
• 옥내소화전 방수압력 테스트
• 비상발전기 시운전 및 연료량 확인
• 피난유도등 점등 상태 및 배터리 확인

■ 화기 취급 시 준수사항
• 화기작업 전 소화기 비치 및 감시자 지정
• 인화성 물질 5m 이내 화기작업 금지
• 작업 종료 후 30분간 잔화 감시`,
        references: [
          { title: '군 시설물 화재예방 규정', source: '국방부 2024.01', url: '#' },
          { title: '소방안전관리 업무편람', source: '육군 시설관리단', url: '#' },
          { title: '전기·가스 안전점검 체크리스트', source: '한국전기안전공사', url: '#' },
        ]
      };
    }
    
    if (question.includes('행군') || question.includes('저체온')) {
      return {
        content: `행군 중 저체온증 대처 방법을 안내드립니다.

■ 저체온증 초기 증상
• 1단계 (경증): 심한 오한, 피부 창백, 손발 저림
• 2단계 (중등도): 오한 감소, 의식 혼미, 판단력 저하, 발음 불명확
• 3단계 (중증): 오한 멈춤, 의식 소실, 맥박·호흡 약화

■ 현장 응급처치
• 즉시 바람과 비를 피할 수 있는 장소로 이동
• 젖은 의복 제거 후 마른 담요·침낭으로 보온
• 핫팩 적용 위치: 목, 겨드랑이, 서혜부 (직접 피부 접촉 금지)
• 의식 있을 경우 따뜻한 음료 제공 (카페인·알코올 금지)

■ 후송 판단 기준
• 의식저하, 오한 없이 체온 지속 하강 시 즉시 후송
• 심폐소생술 필요 시 30분간 지속하며 후송

■ 예방 대책
• 출발 전 충분한 수분·열량 섭취
• 땀 배출 가능한 기능성 내의 착용
• 휴식 시 즉시 방풍·보온 조치
• 버디시스템으로 상호 이상징후 관찰`,
        references: [
          { title: '한랭질환 응급처치 매뉴얼', source: '국군의무사령부 2024.11', url: '#' },
          { title: '동계 행군 안전관리 지침', source: '육군본부', url: '#' },
        ]
      };
    }

    return {
      content: `문의하신 내용에 대해 답변드립니다.

안전사고 예방의 기본 원칙은 다음과 같습니다:

■ 사전 예방 활동
• 작업·훈련 전 위험요소 식별 및 안전교육 실시
• 개인보호장구 착용상태 상호 확인
• 비상시 행동요령 숙지 및 연락체계 확인

■ 현장 안전수칙
• 규정된 절차 준수, 임의 생략 금지
• 이상징후 발견 시 즉시 보고 및 작업 중지
• 무리한 일정 강행 금지, 충분한 휴식 보장

■ 사고 발생 시 대응
• 추가 피해 방지 조치 우선
• 응급처치 실시 및 신속 후송
• 현장 보존 및 정확한 상황 보고

더 구체적인 질문이 있으시면 말씀해 주세요.`,
      references: [
        { title: '육군 안전관리 규정', source: '육군본부', url: '#' },
      ]
    };
  };

  if (isPageLoading) {
    return <ChatbotSkeleton />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-6 pb-4 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">지능형 챗봇</h1>
        <p className="text-sm text-muted-foreground mt-1">법령/규정 RAG 기반 질의응답 및 관련 자료 추천</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center flex-shrink-0 text-xs font-medium text-muted-foreground">
                AI
              </div>
            )}
            <div
              className={cn(
                'max-w-[70%] text-sm',
                message.role === 'user'
                  ? 'bg-foreground text-background px-4 py-2.5 rounded-lg'
                  : ''
              )}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.references && message.references.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <p className="text-xs text-muted-foreground">참고 자료</p>
                  {message.references.map((ref, index) => (
                    <a
                      key={index}
                      href={ref.url}
                      className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      [{ref.source}] {ref.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {message.role === 'user' && (
              <div className="w-6 h-6 rounded-sm bg-foreground flex items-center justify-center flex-shrink-0 text-xs font-medium text-background">
                U
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-sm bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
              AI
            </div>
            <div className="text-sm text-muted-foreground">
              응답을 생성하고 있습니다...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground mb-2">추천 질문</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, index) => (
              <button
                key={index}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 border border-border rounded hover:bg-muted/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="안전에 관해 궁금한 점을 물어보세요..."
            className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-foreground text-background rounded hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
