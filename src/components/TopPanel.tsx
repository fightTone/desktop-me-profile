import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TOPBAR_HEIGHT } from '../constants';

const TopPanelContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${TOPBAR_HEIGHT}px;
  background: #1a1a1a;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 9999;
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  color: white;
  z-index: 1000;
`;

const TimeDisplay = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const StatusIcons = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

interface PowerMenuProps {
  isVisible: boolean;
}

const PowerMenu = styled.div<PowerMenuProps>`
  position: absolute;
  top: 100%;
  right: 0;
  background: #444;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  min-width: 200px;
  display: ${({ isVisible }) => isVisible ? 'block' : 'none'};
`;

const MenuItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  &:hover {
    background: #555;
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

  return (
    <Panel>
      <div>Applications</div>
      <TimeDisplay>
        {time.toLocaleTimeString()}
      </TimeDisplay>
      <StatusIcons>
        <IconButton>📶</IconButton>
        <IconButton onClick={() => setShowPowerMenu(!showPowerMenu)}>⏻</IconButton>
        <PowerMenu isVisible={showPowerMenu}>
          <MenuItem onClick={() => handlePowerAction('settings')}>Settings</MenuItem>
          <MenuItem onClick={() => handlePowerAction('logout')}>Log Out</MenuItem>
          <MenuItem onClick={() => handlePowerAction('poweroff')}>Power Off</MenuItem>
        </PowerMenu>
      </StatusIcons>
    </Panel>
  );
};

export default TopPanel;
