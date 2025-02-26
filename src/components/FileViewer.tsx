import React from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { FileSystemItem, getItemAtPath } from '../utils/fileSystem';
import Media from './Media';  // Add this import

const ViewerContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #282828;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; // Changed from auto to hidden
  position: relative;
  background: rgba(0, 0, 0, 0.3);

  &:hover .nav-button {
    opacity: 1;
  }
`;

const ImageViewer = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const PDFViewer = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const NavigationOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  opacity: 0;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const NavButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.1);
  }
`;

interface FileViewerProps {
  file: FileSystemItem;
  onNavigate?: (file: FileSystemItem) => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ file, onNavigate }) => {
  const renderContent = () => {
    const isMediaFile = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
      .includes(file.contentType || '');

    if (isMediaFile) {
      console.log('Opening media file:', file.name);
      return (
        <Media 
          file={file} 
          onNavigate={(newFile) => {
            console.log('Navigating to:', newFile.name, 'from:', file.name);
            onNavigate?.(newFile);
          }} 
        />
      );
    }

    // Handle other file types as before
    switch (file.contentType) {
      case 'application/pdf':
        return (
          <Content>
            <PDFViewer src={file.path} title={file.name} />
          </Content>
        );
      case 'audio/mpeg':
        return (
          <Content>
            <audio controls src={file.path}>
              Your browser does not support the audio element.
            </audio>
          </Content>
        );

      default:
        return (
          <Content>
            <a href={file.path} download style={{ color: 'white' }}>
              Download {file.name}
            </a>
          </Content>
        );
    }
  };

  return (
    <ViewerContainer>
      {renderContent()}
    </ViewerContainer>
  );
};

export default FileViewer;
