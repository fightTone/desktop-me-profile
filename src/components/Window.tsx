import React, { useState, useEffect } from 'react';
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
  background: ${props => props.isActive ? 'rgba(32, 32, 32, 0.95)' : 'rgba(40, 40, 40, 0.95)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: ${props => props.isFullscreen ? '0' : '4px'};
  width: ${props => props.isFullscreen ? '100vw' : `${props.width}px`};
  height: ${props => props.isFullscreen ? `calc(100vh - ${TOPBAR_HEIGHT}px)` : `${props.height}px`};
  min-width: ${props => props.isFullscreen ? '100vw' : '200px'};
  min-height: ${props => props.isFullscreen ? 'calc(100vh - 30px)' : '150px'};
  top: ${props => props.isFullscreen ? '0' : 'auto'};
  left: ${props => props.isFullscreen ? '0' : 'auto'};
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-out;
  box-shadow: ${props => props.isActive 
    ? '0 8px 32px rgba(0,0,0,0.3), 0 0 2px rgba(255,255,255,0.1)' 
    : '0 4px 16px rgba(0,0,0,0.2)'};
  transition: background 0.2s, border 0.2s, box-shadow 0.2s;
  z-index: ${props => props.zIndex};
  animation: ${fadeIn} 0.2s ease-out;
  margin-top: ${props => props.isFullscreen ? `${TOPBAR_HEIGHT}px` : 'auto'};
`;

const TitleBar = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(60, 60, 60, 0.95)' : 'rgba(50, 50, 50, 0.95)'};
  padding: 8px 12px;
  height: 32px;
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
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    opacity: 1;
    transform: scale(1.1);
    color: ${props => props.variant === 'close' ? '#450000' : '#654200'};
  }

  &:hover::before {
    opacity: 1;
    content: ${props => {
      switch (props.variant) {
        case 'close': return '"×"';
        case 'minimize': return '"−"';
        case 'fullscreen': return '"+"';
        default: return '""';
      }
    }};
    color: #000;
    font-size: 10px;
  }
`;

const DragOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 255, 0.1);
  pointer-events: none;
  opacity: ${props => props.isVisible ? 1 : 0};
  z-index: 9999;
  transition: opacity 0.2s;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: rgba(0, 0, 255, 0.2);
  }
`;

interface WindowState {
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  isFullscreen: boolean;
}

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
  initialState?: WindowState;
  onStateChange?: (state: WindowState) => void;
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
  defaultHeight = 400,
  initialState,
  onStateChange,
}) => {
  const getInitialPosition = () => ({
    x: Math.random() * (window.innerWidth - defaultWidth) / 2,
    y: TOPBAR_HEIGHT + Math.random() * (window.innerHeight - defaultHeight - TOPBAR_HEIGHT - TASKBAR_HEIGHT) / 2
  });

  const [dimensions, setDimensions] = useState(
    initialState?.dimensions || { width: defaultWidth, height: defaultHeight }
  );
  const [position, setPosition] = useState(
    initialState?.position || getInitialPosition()
  );
  const [isFullscreen, setIsFullscreen] = useState(initialState?.isFullscreen || false);
  const [preFullscreenState, setPreFullscreenState] = useState<{
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ y: 0 });

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

  const getBounds = () => ({
    left: -10,
    right: window.innerWidth - dimensions.width + 10,
    top: -10, // Allow dragging above top bar for snapping
    bottom: window.innerHeight - dimensions.height - TASKBAR_HEIGHT
  });

  const handleDragStart = (e: any, data: any) => {
    setIsDragging(true);
    setDragPosition({ y: data.y });
  };

  const handleDrag = (e: any, data: any) => {
    setDragPosition({ y: data.y });
  };

  const handleDragStop = (e: any, data: any) => {
    setIsDragging(false);

    // Handle fullscreen snap with more forgiving threshold
    if (data.y <= 10) {
      setIsFullscreen(true);
      setPosition({ x: 0, y: TOPBAR_HEIGHT });
      return;
    }

    // Handle left snap
    if (data.x <= 5) {
      setPosition({ x: 0, y: TOPBAR_HEIGHT });
      setDimensions({
        width: window.innerWidth / 2,
        height: window.innerHeight - TOPBAR_HEIGHT - TASKBAR_HEIGHT
      });
      return;
    }

    // Handle right snap
    if (data.x >= window.innerWidth - dimensions.width - 5) {
      setPosition({ x: window.innerWidth - dimensions.width, y: TOPBAR_HEIGHT });
      setDimensions({
        width: window.innerWidth / 2,
        height: window.innerHeight - TOPBAR_HEIGHT - TASKBAR_HEIGHT
      });
      return;
    }

    // Update position normally if no snap, but ensure window stays below top bar
    setPosition({ 
      x: data.x, 
      y: data.y < TOPBAR_HEIGHT ? TOPBAR_HEIGHT : data.y
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      // Windows key + Arrow shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'ArrowUp':
            toggleFullscreen();
            break;
          case 'ArrowLeft':
            setIsFullscreen(false);
            setPosition({ x: 0, y: TOPBAR_HEIGHT });
            setDimensions({
              width: window.innerWidth / 2,
              height: window.innerHeight - TOPBAR_HEIGHT - TASKBAR_HEIGHT
            });
            break;
          case 'ArrowRight':
            setIsFullscreen(false);
            setPosition({ x: window.innerWidth / 2, y: TOPBAR_HEIGHT });
            setDimensions({
              width: window.innerWidth / 2,
              height: window.innerHeight - TOPBAR_HEIGHT - TASKBAR_HEIGHT
            });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  useEffect(() => {
    onStateChange?.({
      position,
      dimensions,
      isFullscreen
    });
  }, [position, dimensions, isFullscreen]);

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
    <>
      <DragOverlay isVisible={isDragging && dragPosition.y < 10} />
      <Draggable
        handle=".title-bar"
        position={isFullscreen ? { x: 0, y: 0 } : position} // Ensure exact positioning
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
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
    </>
  );
};

export default Window;
