import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { TOPBAR_HEIGHT } from '../constants';

const Panel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${TOPBAR_HEIGHT}px;  // Use the constant instead of hardcoded 30px
  background: rgba(32, 32, 32, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  color: white;
  z-index: 1000;
  user-select: none;  // Prevent text selection
  margin: 0;  // Remove any margin
  box-sizing: border-box;  // Ensure padding doesn't affect height
`;

const CalendarDropdown = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(40, 40, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  display: ${props => props.isVisible ? 'block' : 'none'};
  color: white;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  min-width: 300px;
  z-index: 1001;
`;

const Calendar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MonthYear = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
`;

const Days = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const Day = styled.div<{ isToday?: boolean; isCurrentMonth?: boolean }>`
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  color: ${props => props.isCurrentMonth ? 'white' : '#666'};
  background: ${props => props.isToday ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  font-weight: ${props => props.isToday ? 'bold' : 'normal'};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TimeDisplay = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatusIcons = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 0 12px;
  height: 100%;
  
  & > * {
    padding: 0 8px;
    height: 100%;
    display: flex;
    align-items: center;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

interface PowerMenuProps {
  isVisible: boolean;
}

const PowerMenu = styled.div<PowerMenuProps>`
  position: absolute;
  top: calc(100% + 4px);  // Add small gap from top
  right: 16px;
  background: rgba(40, 40, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  border-radius: 8px;
  min-width: 200px;
  display: ${({ isVisible }) => isVisible ? 'block' : 'none'};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 18px;
  }
`;

const IconButton = styled.div`
  cursor: pointer;
  padding: 4px 8px;
  &:hover {
    background: #444;
    border-radius: 4px;
  }
`;

interface TopPanelProps {
  onOpenSettings: () => void;
}

const TopPanel: React.FC<TopPanelProps> = ({ onOpenSettings }) => {
  const [time, setTime] = useState(new Date());
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePowerAction = (action: string) => {
    setShowPowerMenu(false);
    switch (action) {
      case 'settings':
        onOpenSettings();
        break;
      case 'logout':
        console.log('Logout clicked');
        break;
      case 'poweroff':
        console.log('Power off clicked');
        break;
    }
  };

  const getDaysInMonth = (date: Date) => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = [];
    
    // Add previous month's days
    const prevMonthDays = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true });
    }
    
    // Add next month's days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, currentMonth: false });
    }
    
    return days;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear();
  };

  // Add click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPowerMenu && !(event.target as Element).closest('.power-menu-container')) {
        setShowPowerMenu(false);
      }
      if (showCalendar && !(event.target as Element).closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPowerMenu, showCalendar]);

  return (
    <Panel>
      <div>Applications</div>
      <TimeDisplay onClick={() => setShowCalendar(!showCalendar)}>
        {time.toLocaleTimeString()}
      </TimeDisplay>
      <CalendarDropdown isVisible={showCalendar}>
        <Calendar>
          <CalendarHeader>
            <Icon 
              icon="mdi:chevron-left" 
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            />
            <MonthYear>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </MonthYear>
            <Icon 
              icon="mdi:chevron-right" 
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            />
          </CalendarHeader>
          <WeekDays>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </WeekDays>
          <Days>
            {getDaysInMonth(currentMonth).map(({ day, currentMonth }, index) => (
              <Day 
                key={`${day}-${index}`}
                isToday={currentMonth && isToday(day)}
                isCurrentMonth={currentMonth}
              >
                {day}
              </Day>
            ))}
          </Days>
        </Calendar>
      </CalendarDropdown>
      <StatusIcons>
        <IconButton>
          <Icon icon="mdi:wifi" width="20" />
        </IconButton>
        <div className="power-menu-container">
          <IconButton onClick={() => setShowPowerMenu(!showPowerMenu)}>
            <Icon icon="mdi:power" width="20" />
          </IconButton>
          <PowerMenu isVisible={showPowerMenu}>
            <MenuItem onClick={() => handlePowerAction('settings')}>
              <Icon icon="mdi:cog" />
              Settings
            </MenuItem>
            <MenuItem onClick={() => handlePowerAction('logout')}>
              <Icon icon="mdi:logout" />
              Log Out
            </MenuItem>
            <MenuItem onClick={() => handlePowerAction('poweroff')} style={{ color: '#ff5f57' }}>
              <Icon icon="mdi:power" />
              Power Off
            </MenuItem>
          </PowerMenu>
        </div>
      </StatusIcons>
    </Panel>
  );
};

export default TopPanel;
