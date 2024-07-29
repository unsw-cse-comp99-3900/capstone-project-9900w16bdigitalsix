import React, { useState, useEffect } from 'react';
import { Modal, Avatar, Button, List, Checkbox, Input } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Search } = Input;

const roleMap = {
  1: 'Student',
  2: 'Tutor',
  3: 'Client',
  4: 'Coordinator',
  5: 'Administrator'
};

const roleColorMap = {
  1: { background: '#e0f7fa', color: '#006064' }, // blue Student
  2: { background: '#e1bee7', color: '#6a1b9a' }, // purple Tutor
  3: { background: '#fff9c4', color: '#f57f17' }, // yellow Client
  4: { background: '#ffe0b2', color: '#e65100' }, // orange Coordinator
  5: { background: '#ffcdd2', color: '#b71c1c' }  // red Administrator
};

const ChatPersonalCard = ({ visible, onOk, onCancel, refreshData, channelId, cardType, setChannelId, channelName, setChannelName, setChannelType }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // student list
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatars, setSelectedAvatars] = useState([]);

  useEffect(() => {
    loadUserData();
    setSelectedIds([]);
    setSelectedAvatars([]);
  }, []);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleSelect = (userId, avatarUrl) => {
    if (selectedIds.includes(userId)) {
      setSelectedIds(prevSelectedIds => prevSelectedIds.filter(id => id !== userId));
      setSelectedAvatars(prevSelectedAvatars => prevSelectedAvatars.filter(user => user.userId !== userId));
    } else {
      setSelectedIds(prevSelectedIds => [...prevSelectedIds, userId]);
      setSelectedAvatars(prevSelectedAvatars => [...prevSelectedAvatars, { userId, avatarUrl }]);
    }
  };

  const loadUserData = async () => {
    const response = await apiCall('GET', 'v1/user/get/user/list', null, token, true);
    
    if (!response) {
      setData([]);
      setFilteredData([]);
    } else if (response.error) {
      setData([]);
      setFilteredData([]);
    } else {
      const res = Array.isArray(response) ? response : [];
      setData(res);
      setFilteredData(res);
      console.log("response:",response);
    }
  }

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      setSnackbarContent('Please select at least one personal card');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }

    // all users will include
    const allUserIds = [parseInt(userId, 10), ...selectedIds.map(id => parseInt(id, 10))];

    let requestBody;
    if (cardType === 'newChannel') {
      if (selectedIds.length === 1) {
        requestBody = {
          channelType: 1, // private channel
          userId: allUserIds,
        };
      } else {
        requestBody = {
          channelType: 2, // group channel
          userId: allUserIds,
        };
      }
      console.log("requestBody:",requestBody);
      const response = await apiCall('POST', 'v1/message/create/channel', requestBody, token, true);
      if (response && !response.error) {
        setChannelId(response.channelID);
        setChannelName(response.channelName);
        setChannelType(response.channelType);
        setSnackbarContent('Operation successful');
        setAlertType('success');
        setAlertOpen(true);
        onOk();
      } else {
        setSnackbarContent('Operation failed');
        setAlertType('error');
        setAlertOpen(true);
      }
    }
    else if (cardType === 'invite') {
      requestBody = {
        channelId: channelId,
        userId: selectedIds.map(id => parseInt(id, 10)),
      };
      const response = await apiCall('POST', 'v1/message/invite/to/channel', requestBody, token, true);
      if (response && !response.error) {
        setSnackbarContent('Operation successful');
        setAlertType('success');
        setAlertOpen(true);
        onOk();
      } else {
        setSnackbarContent('Operation failed');
        setAlertType('error');
        setAlertOpen(true);
      }
    }
    setSelectedIds([]);
    setSelectedAvatars([]);
  };

  const handleCancel = () => {
    onCancel();
    setSelectedIds([]);
    setSelectedAvatars([]);
  }

  return (
    <>
      <Modal
        title="Select people to chat"
        visible={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Invite</Button>
        ]}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {selectedAvatars.map((user, index) => (
            <Avatar
              key={user.userId}
              id={user.userId}
              src={user.avatarUrl ? user.avatarUrl : ''}
              size={64}
              style={{
                marginLeft: index === 0 ? 0 : -16,
                zIndex: selectedAvatars.length - index,
              }}
            />
          ))}
        </div>
        <Search
          placeholder="Search by name or email"
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <List
          dataSource={filteredData}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
          renderItem={item => (
            <List.Item>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Checkbox
                  value={item.userId}
                  checked={selectedIds.includes(item.userId)}
                  onChange={() => handleSelect(item.userId, item.avatarUrl)}
                  style={{ marginRight: 16 }}
                />
                <Avatar src={item.avatarUrl ? item.avatarUrl : ''} style={{ marginRight: 16 }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div><strong>Name:</strong> {item.userName}</div>
                  <div><strong>Email:</strong> {item.email}</div>
                  <div>
                    <span
                      className="list-item-meta-role"
                      style={{
                        backgroundColor: roleColorMap[item.role].background,
                        color: roleColorMap[item.role].color,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'inline-block',
                      }}
                    >
                      {roleMap[item.role]}
                    </span>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Modal>
      <MessageAlert
        open={alertOpen}
        alertType={alertType}
        handleClose={() => setAlertOpen(false)}
        snackbarContent={snackbarContent}
      />
    </>
  );
};

export default ChatPersonalCard;