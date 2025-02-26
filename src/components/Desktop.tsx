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
    background: rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }
`;

const WindowsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: all;
`;

interface WindowState {
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  isFullscreen: boolean;
}

interface WindowData {
  id: string;
  type: 'terminal' | 'filesystem' | 'browser' | 'settings' | 'viewer';
  title: string;
  isMinimized: boolean;
  file?: FileSystemItem;
  zIndex: number;
  width: number;
  height: number;
  state?: WindowState;  // Add this to store window state
}

const getViewerTitle = (file: FileSystemItem): string => {
  if (file.contentType?.startsWith('image/')) return `Image - ${file.name}`;
  if (file.contentType?.startsWith('video/')) return `Video - ${file.name}`;
  if (file.contentType?.startsWith('audio/')) return `Audio - ${file.name}`;
  return file.name;
};

const Desktop: React.FC = () => {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);

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

  const saveWindowState = (id: string, state: WindowState) => {
    setWindows(windows.map(window => 
      window.id === id 
        ? { ...window, state }
        : window
    ));
  };

  const spawnWindow = (type: 'terminal' | 'filesystem' | 'browser' | 'settings') => {
    const dimensions = getWindowDimensions(type);
    const newWindow: WindowData = {
      id: `${type}-${Date.now()}`,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      isMinimized: false,
      zIndex: maxZIndex + 1,
      ...dimensions,
      state: {
        position: {
          x: Math.random() * (window.innerWidth - dimensions.width) / 2,
          y: 30 + Math.random() * (window.innerHeight - dimensions.height - 60) / 2
        },
        dimensions: {
          width: dimensions.width,
          height: dimensions.height
        },
        isFullscreen: false
      }
    };
    setMaxZIndex(prev => prev + 1);
    setActiveWindowId(newWindow.id);
    setWindows([...windows, newWindow]);
  };

  const spawnViewerWindow = (file: FileSystemItem) => {
    const existingViewer = windows.find(w => 
      w.type === 'viewer' && w.file?.path === file.path
    );

    if (existingViewer) {
      // If viewer already exists, just focus it
      if (existingViewer.isMinimized) {
        toggleMinimize(existingViewer.id);
      }
      bringToFront(existingViewer.id);
    } else {
      const newWindow: WindowData = {
        id: `viewer-${Date.now()}`,
        type: 'viewer',
        title: getViewerTitle(file),  // Use the new title function
        isMinimized: false,
        file: file,
        zIndex: maxZIndex + 1,
        width: 800,  // Increased default size
        height: 600
      };
      setMaxZIndex(prev => prev + 1);
      setActiveWindowId(newWindow.id);
      setWindows([...windows, newWindow]);
    }
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

  const handleMediaNavigation = (windowId: string, newFile: FileSystemItem) => {
    console.log('Navigating to:', newFile.name);
    setWindows(windows.map(w =>
      w.id === windowId 
        ? { 
            ...w, 
            file: newFile, 
            title: getViewerTitle(newFile),
            // Ensure state has all required properties
            state: {
              position: w.state?.position || { x: 0, y: 0 },
              dimensions: w.state?.dimensions || { width: w.width, height: w.height },
              isFullscreen: w.state?.isFullscreen || false
            }
          }
        : w
    ));
  };

  return (
    <DesktopContainer>
      <TopPanel onOpenSettings={openSettings} />
      <WindowsContainer>
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
            initialState={window.state}
            onStateChange={(state) => saveWindowState(window.id, state)}
          >
            {window.type === 'terminal' && <Terminal />}
            {window.type === 'filesystem' && (
              <FileSystem onFileOpen={spawnViewerWindow} />
            )}
            {window.type === 'browser' && <Browser />}
            {window.type === 'settings' && <Settings />}
            {window.type === 'viewer' && window.file && (
              <FileViewer 
                file={window.file} 
                onNavigate={(newFile) => {
                  console.log('FileViewer navigation triggered'); // Debug log
                  handleMediaNavigation(window.id, newFile);
                }}
              />
            )}
          </Window>
        ))}
      </WindowsContainer>
      <Taskbar 
        windows={windows}
        onSpawnWindow={spawnWindow}
        onWindowClick={toggleMinimize}
      />
    </DesktopContainer>
  );
};

export default Desktop;
