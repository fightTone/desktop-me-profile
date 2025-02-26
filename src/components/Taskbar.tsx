import React from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { TASKBAR_HEIGHT } from '../constants';

const TaskbarContainer = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  height: ${TASKBAR_HEIGHT}px;
  background: rgba(32, 32, 32, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  padding: 4px 16px;
  gap: 8px;
  margin: 0 auto;
  z-index: 9999;
  max-width: 700px; // Add max-width to prevent stretching
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
`;

const TaskbarButton = styled.button<{ isActive?: boolean }>`
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: none;
  color: white;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    width: 4px;
    height: 4px;
    background: ${props => props.isActive ? 'white' : 'transparent'};
    border-radius: 50%;
  }

  svg {
    width: 28px;
    height: 28px;
    color: #fff;
  }
`;

const getIconForWindow = (type: string): string => {
  switch (type) {
    case 'terminal':
      return 'codicon:terminal';
    case 'filesystem':
      return 'fluent:folder-48-filled';
    case 'browser':
      return 'ri:safari-fill';
    case 'settings':
      return 'ci:settings-filled';
    case 'viewer':
      return 'material-symbols:image';
    default:
      return 'ci:file-blank';
  }
};

interface TaskbarProps {
  windows: Array<{ id: string; title: string; type: string }>;
  onSpawnWindow: (type: 'terminal' | 'filesystem' | 'browser') => void;
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onSpawnWindow, onWindowClick }) => {
  const defaultApps = [
    { type: 'terminal', icon: 'codicon:terminal', label: 'Terminal' },
    { type: 'filesystem', icon: 'fluent:folder-48-filled', label: 'Files' },
    { type: 'browser', icon: 'ri:safari-fill', label: 'Browser' }
  ];

  return (
    <TaskbarContainer>
      {defaultApps.map(app => (
        <TaskbarButton
          key={app.type}
          onClick={() => onSpawnWindow(app.type as any)}
          title={app.label}
        >
          <Icon icon={app.icon} width="24" height="24" />
        </TaskbarButton>
      ))}
      {windows.map(window => (
        <TaskbarButton
          key={window.id}
          onClick={() => onWindowClick(window.id)}
          title={window.title}
        >
          <Icon icon={getIconForWindow(window.type)} width="24" height="24" />
        </TaskbarButton>
      ))}
    </TaskbarContainer>
  );
};

export default Taskbar;
