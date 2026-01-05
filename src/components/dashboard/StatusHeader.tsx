import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudSun } from 'lucide-react';

// 현재 날짜/시간 포맷
function formatDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return {
    date: `${year}.${month}.${day} (${weekday})`,
    time: `${hours}:${minutes}:${seconds}`
  };
}

// 날씨 아이콘 컴포넌트
function WeatherIcon({ condition }: { condition: string }) {
  const iconClass = "w-5 h-5";
  
  switch (condition) {
    case 'sunny':
      return <Sun className={`${iconClass} text-amber-400`} />;
    case 'cloudy':
      return <Cloud className={`${iconClass} text-gray-400`} />;
    case 'partly-cloudy':
      return <CloudSun className={`${iconClass} text-amber-300`} />;
    case 'rain':
      return <CloudRain className={`${iconClass} text-blue-400`} />;
    case 'snow':
      return <CloudSnow className={`${iconClass} text-blue-200`} />;
    default:
      return <Sun className={`${iconClass} text-amber-400`} />;
  }
}

// Mock 날씨 데이터
const mockWeatherData = {
  today: {
    condition: 'partly-cloudy',
    high: 9,
    low: -6,
  },
  tomorrow: {
    condition: 'cloudy',
    high: 7,
    low: -3,
  },
};

export function StatusHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { date, time } = formatDateTime(currentTime);

  return (
    <div className="flex items-center gap-4 px-4 py-3 h-[60px] w-56">
      {/* 오늘의 날씨 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        <span className="text-[10px] text-muted-foreground leading-tight">오늘의 날씨</span>
        <div className="flex items-center gap-2.5">
          <WeatherIcon condition={mockWeatherData.today.condition} />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-red-500 font-medium text-xs leading-tight">{mockWeatherData.today.high}°C</span>
            <span className="text-blue-500 font-medium text-xs leading-tight">{mockWeatherData.today.low}°C</span>
          </div>
        </div>
      </div>

      {/* 내일의 날씨 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        <span className="text-[10px] text-muted-foreground leading-tight">내일의 날씨</span>
        <div className="flex items-center gap-2.5">
          <WeatherIcon condition={mockWeatherData.tomorrow.condition} />
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-red-500 font-medium text-xs leading-tight">{mockWeatherData.tomorrow.high}°C</span>
            <span className="text-blue-500 font-medium text-xs leading-tight">{mockWeatherData.tomorrow.low}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}