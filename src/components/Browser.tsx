import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from '@iconify/react';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(32, 32, 32, 0.95);
  backdrop-filter: blur(20px);
  color: white;
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(48, 48, 48, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 8px;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddressBar = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
  }
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(40, 40, 40, 0.95);
  padding: 8px 8px 0;
  gap: 2px;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  background: ${props => props.active ? 'rgba(48, 48, 48, 0.95)' : 'rgba(40, 40, 40, 0.95)'};
  color: ${props => props.active ? 'white' : '#aaa'};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 120px;
  position: relative;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  
  &:hover {
    background: ${props => props.active ? 'rgba(48, 48, 48, 0.95)' : 'rgba(44, 44, 44, 0.95)'};
  }
`;

const TabClose = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: absolute;
  right: 8px;
  opacity: 0.7;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
    color: #ff5f57;
  }
`;

const NewTabButton = styled(NavButton)`
  background: transparent;
  width: 28px;
  height: 28px;
  margin-left: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const IframeContainer = styled.div`
  flex: 1;
  background: white;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 4px 4px;
  display: flex;
  flex-direction: column;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  display: block;
`;

const BlockedSiteMessage = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  background: rgba(32, 32, 32, 0.95);
  color: white;

  h2 {
    margin-bottom: 16px;
  }

  p {
    margin-bottom: 24px;
    color: #aaa;
  }

  a {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }
`;

interface BrowserTab {
  id: string;
  url: string;
  title: string;
}

const Browser: React.FC = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
      { id: '2', url: 'https://app1.pietone.com/analytics', title: 'Analytics' },
    { id: '1', url: 'https://fighttone.github.io/resume/', title: 'Resume' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1'); // Set Resume as active tab
  const [currentUrl, setCurrentUrl] = useState('https://fighttone.github.io/resume/');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const handleNewTab = () => {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      url: 'https://www.google.com',
      title: 'Google'
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setCurrentUrl(newTab.url);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation(); // Prevent tab activation when closing
    if (tabs.length > 1) {
      const tabIndex = tabs.findIndex(tab => tab.id === tabId);
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(newTabs);
      
      // If we're closing the active tab, activate the previous tab (or the next one if it's the first tab)
      if (tabId === activeTabId) {
        const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
        setActiveTabId(newActiveTab.id);
        setCurrentUrl(newActiveTab.url);
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab) {
      const updatedTabs = tabs.map(tab =>
        tab.id === activeTab.id ? { ...tab, url: currentUrl } : tab
      );
      setTabs(updatedTabs);
      if (iframeRef.current) {
        iframeRef.current.src = currentUrl;
      }
    }
  };

  const isBlockedSite = (url: string): boolean => {
    const blockedDomains = [
      'facebook.com',
      'linkedin.com',
      'www.facebook.com',
      'www.linkedin.com'
    ];
    return blockedDomains.some(domain => url.includes(domain));
  };

  const renderContent = () => {
    if (!activeTab) return null;

    if (isBlockedSite(activeTab.url)) {
      return (
        <BlockedSiteMessage>
          <h2>This site can't be embedded</h2>
          <p>Due to security restrictions, this site cannot be displayed in the browser window.</p>
          <a href={activeTab.url} target="_blank" rel="noopener noreferrer">
            Open in new window ↗
          </a>
        </BlockedSiteMessage>
      );
    }

    return (
      <StyledIframe
        ref={iframeRef}
        src={activeTab.url}
        title={activeTab.title}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        loading="lazy"
      />
    );
  };

  return (
    <BrowserContainer>
      <TabBar>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            active={tab.id === activeTabId}
            onClick={() => {
              setActiveTabId(tab.id);
              setCurrentUrl(tab.url);
            }}
          >
            <Icon icon="mdi:web" width="16" />
            {tab.title}
            <TabClose onClick={(e) => handleCloseTab(e, tab.id)}>
              <Icon icon="mdi:close" width="14" />
            </TabClose>
          </Tab>
        ))}
        <NewTabButton onClick={handleNewTab}>
          <Icon icon="mdi:plus" width="20" />
        </NewTabButton>
      </TabBar>
      <NavBar>
        <NavButton onClick={() => iframeRef.current?.contentWindow?.history.back()}>
          <Icon icon="mdi:arrow-left" width="20" />
        </NavButton>
        <NavButton onClick={() => iframeRef.current?.contentWindow?.history.forward()}>
          <Icon icon="mdi:arrow-right" width="20" />
        </NavButton>
        <NavButton onClick={handleRefresh}>
          <Icon icon="mdi:refresh" width="20" />
        </NavButton>
        <form onSubmit={handleUrlSubmit} style={{ flex: 1 }}>
          <AddressBar
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
          />
        </form>
      </NavBar>
      <IframeContainer>
        {renderContent()}
      </IframeContainer>
    </BrowserContainer>
  );
};

export default Browser;
