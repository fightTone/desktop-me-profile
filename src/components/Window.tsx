import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import styled, { keyframes } from 'styled-components';
import 'react-resizable/css/styles.css';
import { TOPBAR_HEIGHT, TASKBAR_HEIGHT } from '../constants';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const WindowContainer = styled.div<{ 
  width: number; 
  height: number; 
  isActive: boolean; 
  zIndex: number;
  isFullscreen: boolean;
}>`
  position: absolute;
  background: ${props => props.isActive ? '#3a3a3a' : '#333'};
  border: 1px solid ${props => props.isActive ? '#666' : '#444'};
  border-radius: ${props => props.isFullscreen ? '0' : '4px'};
  width: ${props => props.isFullscreen ? '100vw' : `${props.width}px`};
  height: ${props => props.isFullscreen ? 'calc(100vh - 30px)' : `${props.height}px`};
  min-width: ${props => props.isFullscreen ? '100vw' : '200px'};
  min-height: ${props => props.isFullscreen ? 'calc(100vh - 30px)' : '150px'};
  top: ${props => props.isFullscreen ? '30px' : 'auto'};
  left: ${props => props.isFullscreen ? '0' : 'auto'};
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-out;
  box-shadow: ${props => props.isActive 
    ? '0 0 20px rgba(0,0,0,0.4), 0 0 2px rgba(255,255,255,0.2)' 
    : '0 0 10px rgba(0,0,0,0.2)'};
  transition: background 0.2s, border 0.2s, box-shadow 0.2s;
  z-index: ${props => props.zIndex};
  animation: ${fadeIn} 0.2s ease-out;
`;

const TitleBar = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? '#505050' : '#444'};
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  flex-shrink: 0;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.isActive ? '#585858' : '#4a4a4a'};
  }
`;

const WindowTitle = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.isActive ? '#fff' : '#ccc'};
  font-weight: ${props => props.isActive ? '500' : 'normal'};
  transition: color 0.2s;
`;

const WindowContent = styled.div`
  flex: 1;
  overflow: auto;
  position: relative;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const WindowButton = styled.button<{ variant?: 'close' | 'minimize' | 'fullscreen' }>`
  background: ${props => {
    switch (props.variant) {
      case 'close': return '#ff5f57';
      case 'minimize': return '#ffbd2e';
      case 'fullscreen': return '#28c940';
      default: return '#666';
    }
  }};
  border: none;
  color: transparent;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.8;
  transition: all 0.2s;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
    color: ${props => props.variant === 'close' ? '#450000' : '#654200'};
  }
`;

interface WindowProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  onMinimize: () => void;
  onFocus?: () => void;
  isActive?: boolean;
  zIndex?: number;
  defaultWidth?: number;
  defaultHeight?: number;
}

const Window: React.FC<WindowProps> = ({ 
  children, 
  title, 
  onClose, 
  onMinimize, 
  onFocus,
  isActive = false,
  zIndex = 1,
  defaultWidth = 600,
  defaultHeight = 400
}) => {
  const getInitialPosition = () => ({
    x: Math.random() * (window.innerWidth - defaultWidth) / 2,
    y: TOPBAR_HEIGHT + Math.random() * (window.innerHeight - defaultHeight - TOPBAR_HEIGHT - TASKBAR_HEIGHT) / 2
  });

  const [dimensions, setDimensions] = useState({ 
    width: defaultWidth, 
    height: defaultHeight 
  });
  const [position, setPosition] = useState(getInitialPosition());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [preFullscreenState, setPreFullscreenState] = useState<{
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
  } | null>(null);

  const onResize = (e: React.SyntheticEvent, { size }: { size: { width: number; height: number } }) => {
    setDimensions(size);
  };

  const onDrag = (e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setPreFullscreenState({ position, dimensions });
      setIsFullscreen(true);
    } else {
      if (preFullscreenState) {
        setPosition(preFullscreenState.position);
        setDimensions(preFullscreenState.dimensions);
      }
      setIsFullscreen(false);
    }
  };

  const getBounds = () => {
    return {
      left: 0,
      right: Math.max(0, window.innerWidth - dimensions.width),
      top: TOPBAR_HEIGHT,
      bottom: Math.max(0, window.innerHeight - dimensions.height - TASKBAR_HEIGHT)
    };
  };

  const windowContent = (
    <WindowContainer 
      width={dimensions.width} 
      height={dimensions.height}
      isActive={isActive}
      zIndex={zIndex}
      isFullscreen={isFullscreen}
    >
      <TitleBar className="title-bar" isActive={isActive}>
        <WindowTitle isActive={isActive}>
          {title}
        </WindowTitle>
        <ButtonGroup>
          <WindowButton variant="minimize" onClick={onMinimize} />
          <WindowButton variant="fullscreen" onClick={toggleFullscreen} />
          <WindowButton variant="close" onClick={onClose} />
        </ButtonGroup>
      </TitleBar>
      <WindowContent>
        {children}
      </WindowContent>
    </WindowContainer>
  );

  return (
    <Draggable
      handle=".title-bar"
      position={isFullscreen ? { x: 0, y: 30 } : position}
      onDrag={onDrag}
      bounds={getBounds()}
      onMouseDown={onFocus}
      disabled={isFullscreen}
    >
      {isFullscreen ? windowContent : (
        <Resizable
          width={dimensions.width}
          height={dimensions.height}
          onResize={onResize}
          minConstraints={[200, 150]}
          maxConstraints={[window.innerWidth - 100, window.innerHeight - 130]}
        >
          {windowContent}
        </Resizable>
      )}
    </Draggable>
  );
};

export default Window;
