import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Shield, Car, Flame, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatbotSkeleton } from '@/components/skeletons';
import armyLogo from '@/assets/army-logo.png';

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
  { icon: Car, text: '동절기 차량 사고 예방 대책은?', color: 'text-blue-400' },
  { icon: Shield, text: '야간 훈련 시 안전 수칙 알려줘', color: 'text-emerald-400' },
  { icon: Flame, text: '화재 예방 점검 항목이 뭐야?', color: 'text-orange-400' },
  { icon: Mountain, text: '행군 중 저체온증 대처 방법은?', color: 'text-cyan-400' },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasConversation = messages.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
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

**출발 전 필수 점검사항**
• 배터리 전압 12.4V 이상 유지, 부동액 농도 50% 확인
• 타이어 공기압 정상치 대비 10% 증가 주입
• 워셔액 동결 방지제 혼합 및 와이퍼 블레이드 상태 확인
• 연료 잔량 1/2 이상 유지 (결빙 방지)

**운행 중 안전수칙**
• 급가속·급제동·급핸들 조작 금지
• 커브길 진입 전 충분한 감속, 기어 변속 최소화
• 결빙 의심구간: 교량, 터널 출입구, 음지, 고갯길
• 안전거리 건조노면 대비 2배 이상 확보

**비상대비 장구류**
• 필수: 삼각대, 손전등, 견인로프, 구급함
• 동절기 추가: 스노우체인, 염화칼슘, 삽, 모래주머니`,
        references: [
          { title: '육군 차량 운행 안전관리 규정', source: '육군본부 2024.03', url: '#' },
          { title: '동절기 교통사고 예방 대책', source: '국방부 안전정책과', url: '#' },
        ]
      };
    }
    
    if (question.includes('야간') || question.includes('훈련')) {
      return {
        content: `야간 훈련 시 안전수칙을 안내드립니다.

**훈련 전 준비사항**
• 훈련장 사전답사 실시 (주간에 위험요소 식별)
• 야광 식별띠, 안전조끼, 후레쉬 등 야간장비 지급 확인
• 통신장비 작동상태 및 비상연락체계 점검
• 의무요원 및 응급의약품 배치 확인

**이동 간 안전수칙**
• 2인 1조 버디시스템 유지, 상호 위치 확인
• 식별표지(야광띠) 필수 착용, 이동 시 일렬종대 유지
• 차량 이동 시 유도요원 배치 및 서행 운전

**비상상황 대응**
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

**일일 점검사항**
• 전열기구 사용 후 전원 차단 확인
• 가스밸브 잠금 상태 확인
• 소화기 위치 및 압력게이지 정상 여부
• 비상구 및 대피로 장애물 적치 여부

**주간 점검사항**
• 전기시설 누전 여부 (누전차단기 테스트)
• 콘센트 문어발 사용 및 과열 흔적
• 유류·가스 저장시설 누출 점검
• 소방시설 작동 테스트 (감지기, 경보기)

**화기 취급 시 준수사항**
• 화기작업 전 소화기 비치 및 감시자 지정
• 인화성 물질 5m 이내 화기작업 금지
• 작업 종료 후 30분간 잔화 감시`,
        references: [
          { title: '군 시설물 화재예방 규정', source: '국방부 2024.01', url: '#' },
          { title: '소방안전관리 업무편람', source: '육군 시설관리단', url: '#' },
        ]
      };
    }
    
    if (question.includes('행군') || question.includes('저체온')) {
      return {
        content: `행군 중 저체온증 대처 방법을 안내드립니다.

**저체온증 초기 증상**
• 1단계 (경증): 심한 오한, 피부 창백, 손발 저림
• 2단계 (중등도): 오한 감소, 의식 혼미, 판단력 저하
• 3단계 (중증): 오한 멈춤, 의식 소실, 맥박·호흡 약화

**현장 응급처치**
• 즉시 바람과 비를 피할 수 있는 장소로 이동
• 젖은 의복 제거 후 마른 담요·침낭으로 보온
• 핫팩 적용 위치: 목, 겨드랑이, 서혜부
• 의식 있을 경우 따뜻한 음료 제공 (카페인·알코올 금지)

**예방 대책**
• 출발 전 충분한 수분·열량 섭취
• 땀 배출 가능한 기능성 내의 착용
• 휴식 시 즉시 방풍·보온 조치`,
        references: [
          { title: '한랭질환 응급처치 매뉴얼', source: '국군의무사령부 2024.11', url: '#' },
          { title: '동계 행군 안전관리 지침', source: '육군본부', url: '#' },
        ]
      };
    }

    return {
      content: `문의하신 내용에 대해 답변드립니다.

안전사고 예방의 기본 원칙은 다음과 같습니다:

**사전 예방 활동**
• 작업·훈련 전 위험요소 식별 및 안전교육 실시
• 개인보호장구 착용상태 상호 확인
• 비상시 행동요령 숙지 및 연락체계 확인

**현장 안전수칙**
• 규정된 절차 준수, 임의 생략 금지
• 이상징후 발견 시 즉시 보고 및 작업 중지
• 무리한 일정 강행 금지, 충분한 휴식 보장

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
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Subtle background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.03]"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col">
        {!hasConversation ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col items-center justify-center px-4 animate-page-enter">
            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div 
                  className="absolute -inset-8 rounded-full blur-2xl opacity-20"
                  style={{ background: 'hsl(var(--primary))' }}
                />
                <img src={armyLogo} alt="ROKA-MP" className="w-16 h-16 relative" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">ROKA-MP Assistant</h1>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                안전사고 예방에 관한 질문에 답변드립니다.<br />
                법령, 규정, 매뉴얼 기반의 정확한 정보를 제공합니다.
              </p>
            </div>

            {/* Suggested Questions Grid */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {SUGGESTED_QUESTIONS.map((q, index) => {
                const Icon = q.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSend(q.text)}
                    className="group flex items-start gap-3 p-4 text-left border border-border rounded-lg hover:bg-muted/50 hover:border-muted-foreground/20 transition-all duration-200"
                  >
                    <div className={cn('mt-0.5', q.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-foreground group-hover:text-foreground/90">{q.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Input at bottom of welcome */}
            <div className="w-full max-w-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="relative"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="무엇이든 물어보세요..."
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3.5 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[11px] text-muted-foreground text-center mt-3">
                AI가 생성한 답변은 참고용이며, 정확한 규정은 원문을 확인하세요.
              </p>
            </div>
          </div>
        ) : (
          /* Conversation View */
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md'
                          : 'text-foreground'
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={i} className="font-semibold mt-4 mb-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
                          }
                          return <span key={i}>{line}{'\n'}</span>;
                        })}
                      </div>
                      {message.references && message.references.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/50 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">참고 자료</p>
                          {message.references.map((ref, index) => (
                            <a
                              key={index}
                              href={ref.url}
                              className="block text-xs text-primary/80 hover:text-primary transition-colors"
                            >
                              {ref.title} · {ref.source}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0 text-xs font-medium text-background">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input - Conversation Mode */}
            <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto px-4 py-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="relative"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
