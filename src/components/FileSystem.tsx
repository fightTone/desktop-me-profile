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

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
  padding: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
`;

const ViewButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
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

const GridView = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  padding: 20px;
  align-items: start;
`;

const GridItem = styled.div<{ isFolder?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.isFolder ? '12px' : '0'};
  cursor: pointer;
  transition: all 0.2s;
  width: 120px;
  margin: 0 auto;
  user-select: none; // Prevent text selection
  
  &:active {
    transform: ${props => props.isFolder ? 'scale(0.95)' : 'none'};
  }

  &:hover {
    transform: ${props => props.isFolder ? 'translateY(-4px)' : 'none'};
    
    ${props => props.isFolder && `
      svg {
        transform: scale(1.1);
        opacity: 1;
      }
    `}
  }
`;

const Preview = styled.div<{ isFolder?: boolean }>`
  ${props => !props.isFolder && `
    width: 120px;
    height: 120px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  `}
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
  margin-bottom: 8px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  svg {
    width: ${props => props.isFolder ? '48px' : '32px'};
    height: ${props => props.isFolder ? '48px' : '32px'};
    color: ${props => props.isFolder ? '#64B5F6' : '#aaa'};
    opacity: ${props => props.isFolder ? 0.8 : 0.6};
    transition: all 0.2s;
  }
`;

const ItemInfo = styled.div<{ isFolder?: boolean }>`
  width: 100%;
  text-align: center;
  
  .name {
    font-size: ${props => props.isFolder ? '13px' : '12px'};
    font-weight: ${props => props.isFolder ? '500' : 'normal'};
    color: ${props => props.isFolder ? '#fff' : '#ddd'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
    padding: 0 4px;
  }

  .type {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    display: ${props => props.isFolder ? 'none' : 'block'};
    margin-top: 2px;
  }
`;

const FolderItem = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: all; // Ensure clicks are captured
`;

interface FileSystemProps {
  onFileOpen: (file: FileSystemItem) => void;
}

const FileSystem: React.FC<FileSystemProps> = ({ onFileOpen }) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

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

  const renderGridView = () => (
    <GridView>
      {currentPath.length > 0 && (
        <GridItem isFolder onClick={() => navigateToBreadcrumb(currentPath.length - 1)}>
          <FolderItem>
            <Preview isFolder>
              <Icon icon="material-symbols:arrow-upward" />
            </Preview>
            <ItemInfo isFolder>
              <div className="name">..</div>
            </ItemInfo>
          </FolderItem>
        </GridItem>
      )}
      
      {/* Show folders first */}
      {currentFolder.children
        ?.filter(item => item.type === 'folder')
        .map((item) => (
          <GridItem 
            key={item.name} 
            isFolder 
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              handleNavigate(item);
            }}
          >
            <FolderItem>
              <Preview isFolder>
                <Icon icon={getFileIcon(item)} />
              </Preview>
              <ItemInfo isFolder>
                <div className="name">{item.name}</div>
              </ItemInfo>
            </FolderItem>
          </GridItem>
      ))}

      {/* Then show files */}
      {currentFolder.children
        ?.filter(item => item.type !== 'folder')
        .map((item) => (
          <GridItem key={item.name} onClick={() => handleNavigate(item)}>
            <Preview className="preview-container">
              {item.contentType?.startsWith('image/') ? (
                <img src={item.path} alt={item.name} loading="lazy" />
              ) : (
                <Icon icon={getFileIcon(item)} />
              )}
            </Preview>
            <ItemInfo>
              <div className="name">{item.name}</div>
              <div className="type">{item.contentType}</div>
            </ItemInfo>
          </GridItem>
      ))}
    </GridView>
  );

  const renderListView = () => (
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
  );

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
        <ViewToggle>
          <ViewButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            <Icon icon="mdi:list" />
            List
          </ViewButton>
          <ViewButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')}
          >
            <Icon icon="mdi:grid" />
            Grid
          </ViewButton>
        </ViewToggle>
      </Breadcrumb>

      {viewMode === 'grid' ? renderGridView() : renderListView()}
    </FileSystemContainer>
  );
};

export default FileSystem;
