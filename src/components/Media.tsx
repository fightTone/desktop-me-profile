import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';
import { FileSystemItem, getItemAtPath } from '../utils/fileSystem';

const MediaContainer = styled.div`
  height: 100%;
  width: 100%;
  background: #1a1a1a;
  display: flex;
  position: relative;
`;

const MediaViewer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const NavigationHint = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.3;
  transition: all 0.3s;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.1);
    opacity: 1;
  }

  &.prev { left: 20px; }
  &.next { right: 20px; }

  ${MediaViewer}:hover & {
    opacity: 0.7;
  }
`;

const NavigationHintText = styled.div`
  color: white;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  position: absolute;
  bottom: 20px;

  ${NavigationHint}:hover & {
    opacity: 1;
  }
`;

const MediaContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 95%;
    max-height: 95%;
    object-fit: contain;
    margin: auto;
  }

  video {
    max-width: 95%;
    max-height: 95%;
    margin: auto;
  }
`;

const MediaInfo = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
`;

interface MediaProps {
  file: FileSystemItem;
  onNavigate?: (file: FileSystemItem) => void;
}

const Media: React.FC<MediaProps> = ({ file, onNavigate }) => {
  const [mediaFiles, setMediaFiles] = useState<FileSystemItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!file.path) return;

    // Get the current directory path
    const pathSegments = file.path.split('/');
    const fileName = pathSegments.pop(); // Remove current file name
    const currentDir = pathSegments.join('/');
    console.log('Current directory:', currentDir);

    const folder = getItemAtPath(pathSegments);
    if (folder) {
      // Get all media files in the current directory
      const files = folder.children
        ?.filter(item => {
          const isMedia = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
            .includes(item.contentType || '');
          return isMedia;
        })
        .sort((a, b) => a.name.localeCompare(b.name)) || [];

      console.log('Media files in directory:', files.map(f => f.name));
      setMediaFiles(files);

      // Find and set the current file index
      const index = files.findIndex(f => f.name === fileName);
      console.log('Current file:', fileName, 'at index:', index);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [file.path]);

  const navigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < mediaFiles.length) {
      const nextFile = mediaFiles[newIndex];
      console.log(`Navigating ${direction} to:`, nextFile.name);
      onNavigate?.(nextFile);
      setCurrentIndex(newIndex);
    }
  };

  const handleKeyNavigation = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') navigate('prev');
    if (e.key === 'ArrowRight') navigate('next');
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [currentIndex, mediaFiles]);

  const renderMedia = () => {
    switch (file.contentType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={file.path} alt={file.name} />;
      case 'video/mp4':
        return (
          <video controls>
            <source src={file.path} type="video/mp4" />
          </video>
        );
      default:
        return null;
    }
  };

  return (
    <MediaContainer>
      <MediaViewer>
        {currentIndex > 0 && (
          <>
            <NavigationHint className="left" onClick={() => navigate('prev')}>
              <NavigationButton className="prev" title="Previous (Left Arrow)">
                <Icon icon="mdi:chevron-left" width="32" />
              </NavigationButton>
              <NavigationHintText>Previous</NavigationHintText>
            </NavigationHint>
          </>
        )}
        
        <MediaContent>
          {renderMedia()}
          {mediaFiles.length > 0 && (
            <MediaInfo>
              <span>{file.name}</span>
              <span>{`${currentIndex + 1} / ${mediaFiles.length}`}</span>
            </MediaInfo>
          )}
        </MediaContent>

        {currentIndex < mediaFiles.length - 1 && (
          <>
            <NavigationHint className="right" onClick={() => navigate('next')}>
              <NavigationButton className="next" title="Next (Right Arrow)">
                <Icon icon="mdi:chevron-right" width="32" />
              </NavigationButton>
              <NavigationHintText>Next</NavigationHintText>
            </NavigationHint>
          </>
        )}
      </MediaViewer>
    </MediaContainer>
  );
};

export default Media;
