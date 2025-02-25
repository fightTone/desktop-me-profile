import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import styled from 'styled-components';
import { fileSystemData, FileSystemItem } from '../utils/fileSystem';

const TerminalContainer = styled.div`
  background: #1a1a1a;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;

  & .xterm {
    height: 100%;
    padding: 12px;
  }

  & .xterm-viewport {
    /* Custom scrollbar */
    &::-webkit-scrollbar {
      width: 10px;
    }
    
    &::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 5px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }
`;

const Terminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');

  const getCurrentFolder = (): FileSystemItem => {
    let current = fileSystemData;
    for (const segment of currentPath) {
      const found = current.children?.find(item => item.name === segment);
      if (found && found.type === 'folder') {
        current = found;
      }
    }
    return current;
  };

  const getPrompt = () => {
    const path = currentPath.length === 0 ? '~' : '~/' + currentPath.join('/');
    return `\r\nuser@react-desktop:${path}$ `;
  };

  const handleCommand = (command: string) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    // Write a new line after command
    xtermRef.current?.write('\r\n');
  
    switch (cmd) {
      case 'ls':
        const currentFolder = getCurrentFolder();
        const items = currentFolder.children || [];
        if (items.length === 0) {
          xtermRef.current?.writeln('Directory is empty');
        } else {
          items.forEach(item => {
            const color = item.type === 'folder' ? '\x1b[34;1m' : '\x1b[37m';
            xtermRef.current?.writeln(`${color}${item.name}\x1b[0m`);
          });
        }
        break;
  
      case 'cd':
        const target = args[0] || '';
        if (target === '..') {
          if (currentPath.length > 0) {
            setCurrentPath(prev => prev.slice(0, -1));
          }
        } else if (target === '~' || target === '/') {
          setCurrentPath([]);
        } else {
          const folder = getCurrentFolder().children?.find(
            item => item.name === target && item.type === 'folder'
          );
          if (folder) {
            setCurrentPath(prev => [...prev, target]);
          } else {
            xtermRef.current?.writeln('Directory not found');
          }
        }
        break;
  
      case 'pwd':
        xtermRef.current?.writeln(`/${currentPath.join('/')}`);
        break;
  
      case 'clear':
        xtermRef.current?.clear();
        break;
  
      case '':
        break;
  
      default:
        xtermRef.current?.writeln('\x1b[31m😈 Nice try! But I cannot allow that command... xD\x1b[0m');
        break;
    }

    // Write new prompt after command execution
    xtermRef.current?.write(getPrompt());
  };

  useEffect(() => {
    if (terminalRef.current) {
      xtermRef.current = new XTerm({
        theme: {
          background: '#1a1a1a',
          foreground: '#f0f0f0',
          cursor: '#f0f0f0',
          selectionBackground: 'rgba(255, 255, 255, 0.3)',
          black: '#000000',
          blue: '#2472c8',
          brightBlue: '#3b8eea',
          green: '#0dbc79',
          brightGreen: '#23d18b'
        },
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 16,
        lineHeight: 1.2,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
        convertEol: true,
        cols: 80,
        rows: 24,
        allowTransparency: true,
        fontWeight: 'normal',
        letterSpacing: 0
      });

      xtermRef.current.open(terminalRef.current);
      xtermRef.current.writeln('\x1b[1;32mWelcome to React Terminal v1.0.0\x1b[0m');
      xtermRef.current.writeln('Available commands: \x1b[1mls\x1b[0m, \x1b[1mcd\x1b[0m, \x1b[1mpwd\x1b[0m, \x1b[1mclear\x1b[0m');
      xtermRef.current.write(getPrompt());

      xtermRef.current.onKey(({ key, domEvent }) => {
        if (domEvent.keyCode === 13) { // Enter
          handleCommand(currentInput);
          setCurrentInput('');
        } else if (domEvent.keyCode === 8) { // Backspace
          if (currentInput.length > 0) {
            setCurrentInput(prev => prev.slice(0, -1));
            xtermRef.current?.write('\b \b');
          }
        } else if (!domEvent.ctrlKey && !domEvent.altKey && key.length === 1) {
          setCurrentInput(prev => prev + key);
          xtermRef.current?.write(key);
        }
      });
    }

    return () => {
      xtermRef.current?.dispose();
    };
  }, []); // Remove currentInput dependency

  // Remove the currentPath useEffect as it's now handled in handleCommand

  return <TerminalContainer ref={terminalRef} />;
};

export default Terminal;
