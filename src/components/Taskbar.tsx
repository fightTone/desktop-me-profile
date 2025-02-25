import React from 'react';
import styled from 'styled-components';
import { TASKBAR_HEIGHT } from '../constants';

const TaskbarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${TASKBAR_HEIGHT}px;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 9999;
`;

const TaskbarButton = styled.button`
  background: #444;
  border: none;
  color: white;
  padding: 8px 16px;
  margin-right: 8px;
  cursor: pointer;
  &:hover {
    background: #555;
  }
`;

interface TaskbarProps {
  windows: Array<{ id: string; title: string }>;
  onSpawnWindow: (type: 'terminal' | 'filesystem' | 'browser') => void;
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onSpawnWindow, onWindowClick }) => {
  return (
    <TaskbarContainer>
      <TaskbarButton onClick={() => onSpawnWindow('terminal')}>
        Terminal
      </TaskbarButton>
      <TaskbarButton onClick={() => onSpawnWindow('filesystem')}>
        Files
      </TaskbarButton>
      <TaskbarButton onClick={() => onSpawnWindow('browser')}>
        Browser
      </TaskbarButton>
      {windows.map(window => (
        <TaskbarButton key={window.id} onClick={() => onWindowClick(window.id)}>
          {window.title}
        </TaskbarButton>
      ))}
    </TaskbarContainer>
  );
};

export default Taskbar;
