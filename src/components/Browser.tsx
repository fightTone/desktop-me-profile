import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
`;

const NavBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  background: #333;
  gap: 8px;
`;

const NavButton = styled.button`
  background: #444;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: #555;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddressBar = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #222;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const TabBar = styled.div`
  display: flex;
  background: #282828;
  padding: 4px 4px 0;
  gap: 2px;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  background: ${props => props.active ? '#333' : '#2a2a2a'};
  color: ${props => props.active ? 'white' : '#aaa'};
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 100px;
  position: relative;
  
  &:hover {
    background: ${props => props.active ? '#333' : '#2f2f2f'};
  }
`;

const TabClose = styled.span`
  position: absolute;
  right: 8px;
  opacity: 0.7;
  font-size: 14px;
  &:hover {
    opacity: 1;
    color: #ff5f57;
  }
`;

const NewTabButton = styled(NavButton)`
  margin: 0;
  padding: 4px 8px;
  background: transparent;
  &:hover {
    background: #444;
  }
`;

const IframeContainer = styled.div`
  flex: 1;
  background: white;
  position: relative;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  flex: 1;
  border: none;
  min-height: 0;
  display: block;
`;

const BlockedSiteMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  background: #f5f5f5;

  h2 {
    margin-bottom: 16px;
    color: #333;
  }

  p {
    margin-bottom: 16px;
    color: #666;
  }

  a {
    padding: 10px 20px;
    background: #2196f3;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background: #1976d2;
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
        title="browser-content"
        scrolling="auto"
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
            <span>📄</span>
            {tab.title}
            <TabClose onClick={(e) => handleCloseTab(e, tab.id)}>×</TabClose>
          </Tab>
        ))}
        <NewTabButton onClick={handleNewTab}>+</NewTabButton>
      </TabBar>
      <NavBar>
        <NavButton onClick={() => iframeRef.current?.contentWindow?.history.back()}>
          ◀
        </NavButton>
        <NavButton onClick={() => iframeRef.current?.contentWindow?.history.forward()}>
          ▶
        </NavButton>
        <NavButton onClick={handleRefresh}>🔄</NavButton>
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
