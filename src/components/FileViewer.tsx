import React from 'react';
import styled from 'styled-components';
import { FileSystemItem } from '../utils/fileSystem';

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
  overflow: auto;
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

interface FileViewerProps {
  file: FileSystemItem;
}

const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  if (!file.path) return null;

  switch (file.contentType) {
    case 'image/jpeg':
    case 'image/png':
    case 'image/gif':
    case 'image/webp':
      return (
        <ViewerContainer>
          <Content>
            <ImageViewer src={file.path} alt={file.name} />
          </Content>
        </ViewerContainer>
      );
    
    case 'application/pdf':
      return (
        <ViewerContainer>
          <Content>
            <PDFViewer src={file.path} title={file.name} />
          </Content>
        </ViewerContainer>
      );

    case 'audio/mpeg':
      return (
        <ViewerContainer>
          <Content>
            <audio controls src={file.path}>
              Your browser does not support the audio element.
            </audio>
          </Content>
        </ViewerContainer>
      );

    case 'video/mp4':
      return (
        <ViewerContainer>
          <Content>
            <video controls style={{ maxWidth: '100%', maxHeight: '100%' }}>
              <source src={file.path} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </Content>
        </ViewerContainer>
      );

    default:
      return (
        <ViewerContainer>
          <Content>
            <a href={file.path} download style={{ color: 'white' }}>
              Download {file.name}
            </a>
          </Content>
        </ViewerContainer>
      );
  }
};

export default FileViewer;
