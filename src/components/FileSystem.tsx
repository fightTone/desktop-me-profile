import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { fileSystemData, getItemAtPath, FileSystemItem, scanPublicFiles } from '../utils/fileSystem';

const FileSystemContainer = styled.div`
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(32, 32, 32, 0.95);
  backdrop-filter: blur(20px);
`;

const Breadcrumb = styled.div`
  padding: 12px 16px;
  background: rgba(48, 48, 48, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BreadcrumbItem = styled.span`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const FileList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  /* Styled scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 5px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const FileItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 6px;
  margin: 2px 0;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }
`;

const FileIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FileName = styled.span`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileDetails = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
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
    if (item.type === 'folder') return 'fluent:folder-48-filled';
    
    switch (item.contentType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return 'material-symbols:image';
      case 'audio/mpeg':
        return 'material-symbols:audio-file';
      case 'video/mp4':
        return 'material-symbols:video-file';
      case 'application/pdf':
        return 'mdi:file-pdf-box';
      default:
        return 'mdi:file-document-outline';
    }
  };

  return (
    <FileSystemContainer>
      <Breadcrumb>
        <BreadcrumbItem onClick={() => navigateToBreadcrumb(-1)}>
          <Icon icon="material-symbols:home" />
          Home
        </BreadcrumbItem>
        {currentPath.map((segment, index) => (
          <React.Fragment key={index}>
            <span>/</span>
            <BreadcrumbItem onClick={() => navigateToBreadcrumb(index)}>
              {segment}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
        <RefreshButton onClick={refreshFiles}>
          <Icon icon="mdi:refresh" />
          Refresh
        </RefreshButton>
      </Breadcrumb>

      <FileList>
        {isScanning ? (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Icon icon="eos-icons:loading" />
            Scanning files...
          </div>
        ) : (
          <>
            {currentPath.length > 0 && (
              <FileItem onClick={() => navigateToBreadcrumb(currentPath.length - 1)}>
                <FileIcon>
                  <Icon icon="material-symbols:arrow-upward" width="24" />
                </FileIcon>
                <FileInfo>
                  <FileName>..</FileName>
                  <FileDetails>Parent Directory</FileDetails>
                </FileInfo>
              </FileItem>
            )}
            
            {currentFolder.children?.map((item) => (
              <FileItem 
                key={item.name} 
                onClick={() => handleNavigate(item)}
              >
                <FileIcon>
                  <Icon icon={getFileIcon(item)} width="24" />
                </FileIcon>
                <FileInfo>
                  <FileName>{item.name}</FileName>
                  <FileDetails>
                    {item.type === 'folder' ? 'Folder' : item.contentType}
                  </FileDetails>
                </FileInfo>
              </FileItem>
            ))}
          </>
        )}
      </FileList>
    </FileSystemContainer>
  );
};

export default FileSystem;
