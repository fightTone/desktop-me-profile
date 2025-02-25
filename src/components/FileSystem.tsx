import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fileSystemData, getItemAtPath, FileSystemItem, scanPublicFiles } from '../utils/fileSystem';

const FileSystemContainer = styled.div`
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Breadcrumb = styled.div`
  padding: 8px;
  background: #383838;
  margin-bottom: 8px;
`;

const BreadcrumbItem = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const RefreshButton = styled.button`
  background: #444;
  color: white;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  margin-left: 8px;
  &:hover {
    background: #555;
  }
`;

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FileItem = styled.div`
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  margin: 2px 8px;

  &:hover {
    background: #383838;
  }
`;

const FileIcon = styled.span`
  font-size: 20px;
  min-width: 24px;
  text-align: center;
`;

const FileName = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface FileSystemProps {
  onFileOpen: (file: FileSystemItem) => void;
}

const FileSystem: React.FC<FileSystemProps> = ({ onFileOpen }) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  const refreshFiles = async () => {
    setIsScanning(true);
    try {
      await scanPublicFiles();
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing files:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  const currentFolder = getItemAtPath(currentPath) || fileSystemData;

  const handleNavigate = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.name]);
    } else {
      onFileOpen(item);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index));
  };

  const getFileIcon = (item: FileSystemItem): string => {
    if (item.type === 'folder') return '📁';
    
    switch (item.contentType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/webp':
        return '🖼️';
      case 'audio/mpeg':
        return '🎵';
      case 'video/mp4':
        return '🎬';
      case 'application/pdf':
        return '📄';
      default:
        return '📃';
    }
  };

  const getFileItemStyle = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      return { color: '#4a9eff' };
    }
    switch (item.contentType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image.webp':
        return { color: '#ff9e4a' };
      case 'audio/mpeg':
        return { color: '#4aff9e' };
      case 'video/mp4':
        return { color: '#ff4a9e' };
      case 'application/pdf':
        return { color: '#ff4a4a' };
      default:
        return { color: '#ffffff' };
    }
  };

  return (
    <FileSystemContainer>
      <Breadcrumb>
        <BreadcrumbItem onClick={() => navigateToBreadcrumb(-1)}>🏠 /</BreadcrumbItem>
        {currentPath.map((segment, index) => (
          <React.Fragment key={index}>
            <span> / </span>
            <BreadcrumbItem onClick={() => navigateToBreadcrumb(index)}>
              {segment}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
        <RefreshButton onClick={refreshFiles}>🔄 Refresh</RefreshButton>
      </Breadcrumb>

      <FileList>
        {isScanning ? (
          <div style={{ padding: '16px', color: 'white' }}>Scanning files...</div>
        ) : (
          <>
            {currentPath.length > 0 && (
              <FileItem onClick={() => navigateToBreadcrumb(currentPath.length - 1)}>
                <FileIcon>📂</FileIcon>
                <FileName>..</FileName>
              </FileItem>
            )}
            
            {currentFolder.children?.map((item) => (
              <FileItem 
                key={item.name} 
                onClick={() => handleNavigate(item)}
                style={getFileItemStyle(item)}
              >
                <FileIcon>{getFileIcon(item)}</FileIcon>
                <FileName>{item.name}</FileName>
              </FileItem>
            ))}
          </>
        )}
      </FileList>
    </FileSystemContainer>
  );
};

export default FileSystem;
