import React, { useState } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  display: flex;
  height: 100%;
  color: white;
`;

const Sidebar = styled.div`
  width: 200px;
  background: #383838;
  padding: 16px;
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
`;

const MenuItem = styled.div<{ active?: boolean }>`
  padding: 8px;
  margin: 4px 0;
  cursor: pointer;
  background: ${props => props.active ? '#444' : 'transparent'};
  border-radius: 4px;
  &:hover {
    background: #444;
  }
`;

const Settings: React.FC = () => {
  const [activePage, setActivePage] = useState('personalization');

  return (
    <SettingsContainer>
      <Sidebar>
        <MenuItem 
          active={activePage === 'personalization'} 
          onClick={() => setActivePage('personalization')}
        >
          Personalization
        </MenuItem>
        <MenuItem 
          active={activePage === 'general'} 
          onClick={() => setActivePage('general')}
        >
          General
        </MenuItem>
        <MenuItem 
          active={activePage === 'about'} 
          onClick={() => setActivePage('about')}
        >
          About
        </MenuItem>
      </Sidebar>
      <Content>
        <h2>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h2>
        <p>Settings content will go here...</p>
      </Content>
    </SettingsContainer>
  );
};

export default Settings;
