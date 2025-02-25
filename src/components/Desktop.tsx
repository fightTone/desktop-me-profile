import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Window from './Window';
import Taskbar from './Taskbar';
import TopPanel from './TopPanel';
import Terminal from './Terminal';
import FileSystem from './FileSystem';
import Browser from './Browser';
import Settings from './Settings';
import FileViewer from './FileViewer';
import { FileSystemItem } from '../utils/fileSystem';

const DesktopContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: url('/files/Pictures/wallpaper/wallpaper1.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);  // Optional: adds a slight dark overlay to make icons more visible
    pointer-events: none;
  }
`;

const DesktopIcons = styled.div`
  padding: 20px;
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 80px);
  gap: 20px;
`;

const DesktopIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const IconEmoji = styled.span`
  font-size: 32px;
  margin-bottom: 8px;
`;

const IconLabel = styled.span`
  color: white;
  font-size: 14px;
  text-align: center;
  word-break: break-word;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

interface WindowData {
  id: string;
  type: 'terminal' | 'filesystem' | 'browser' | 'settings' | 'viewer';
  title: string;
  isMinimized: boolean;
  file?: FileSystemItem;  // Add this for viewer windows
  zIndex: number;
  width: number;
  height: number;
}

const Desktop: React.FC = () => {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);

  // Add an initial terminal window when the desktop loads
  useEffect(() => {
    spawnWindow('terminal');
  }, []);

  const bringToFront = (id: string) => {
    setActiveWindowId(id);
    setMaxZIndex(prev => prev + 1);
    setWindows(windows.map(window => 
      window.id === id 
        ? { ...window, zIndex: maxZIndex + 1 }
        : window
    ));
  };

  const getWindowDimensions = (type: string) => {
    switch (type) {
      case 'browser':
        return { width: 1200, height: 800 };
      case 'filesystem':
        return { width: 800, height: 600 };
      case 'terminal':
        return { width: 600, height: 400 };
      default:
        return { width: 600, height: 400 };
    }
  };

  const spawnWindow = (type: 'terminal' | 'filesystem' | 'browser' | 'settings') => {
    const dimensions = getWindowDimensions(type);
    const newWindow: WindowData = {
      id: `${type}-${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      isMinimized: false,
      zIndex: maxZIndex + 1,
      ...dimensions
    };
    setMaxZIndex(prev => prev + 1);
    setActiveWindowId(newWindow.id);
    setWindows([...windows, newWindow]);
  };

  const spawnViewerWindow = (file: FileSystemItem) => {
    const newWindow: WindowData = {
      id: `viewer-${Date.now()}`,
      type: 'viewer',
      title: file.name,
      isMinimized: false,
      file: file,
      zIndex: maxZIndex + 1,
      width: 600,
      height: 400
    };
    setMaxZIndex(prev => prev + 1);
    setActiveWindowId(newWindow.id);
    setWindows([...windows, newWindow]);
  };

  const toggleMinimize = (id: string) => {
    setWindows(windows.map(window => 
      window.id === id ? { ...window, isMinimized: !window.isMinimized } : window
    ));
  };

  const openSettings = () => {
    const settingsWindow = windows.find(w => w.type === 'settings');
    if (!settingsWindow) {
      spawnWindow('settings');
    } else if (settingsWindow.isMinimized) {
      toggleMinimize(settingsWindow.id);
    }
  };

  return (
    <DesktopContainer>
      <TopPanel onOpenSettings={openSettings} />
      <DesktopIcons>
        <DesktopIcon onClick={() => spawnWindow('terminal')}>
          <IconEmoji>🖥️</IconEmoji>
          <IconLabel>Terminal</IconLabel>
        </DesktopIcon>
        <DesktopIcon onClick={() => spawnWindow('filesystem')}>
          <IconEmoji>📁</IconEmoji>
          <IconLabel>Files</IconLabel>
        </DesktopIcon>
        <DesktopIcon onClick={() => spawnWindow('browser')}>
          <IconEmoji>🌐</IconEmoji>
          <IconLabel>Browser</IconLabel>
        </DesktopIcon>
      </DesktopIcons>
      
      {windows.map(window => !window.isMinimized && (
        <Window 
          key={window.id}
          title={window.title}
          onClose={() => setWindows(windows.filter(w => w.id !== window.id))}
          onMinimize={() => toggleMinimize(window.id)}
          onFocus={() => bringToFront(window.id)}
          isActive={window.id === activeWindowId}
          zIndex={window.zIndex}
          defaultWidth={window.width}
          defaultHeight={window.height}
        >
          {window.type === 'terminal' && <Terminal />}
          {window.type === 'filesystem' && (
            <FileSystem onFileOpen={spawnViewerWindow} />
          )}
          {window.type === 'browser' && <Browser />}
          {window.type === 'settings' && <Settings />}
          {window.type === 'viewer' && window.file && (
            <FileViewer file={window.file} />
          )}
        </Window>
      ))}
      <Taskbar 
        windows={windows}
        onSpawnWindow={spawnWindow}
        onWindowClick={toggleMinimize}
      />
    </DesktopContainer>
  );
};

export default Desktop;
