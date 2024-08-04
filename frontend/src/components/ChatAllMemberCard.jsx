import React, { useState, useEffect } from 'react';
import { Modal, Avatar, List, Input } from 'antd';

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

const ChatAllMemberCard = ({ visible, onOk, onCancel, refreshData, channelId, cardType }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // student list
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvatars, setSelectedAvatars] = useState([]);

  useEffect(() => {
    if (visible) {
      loadStudentData();
      setSelectedAvatars([]);
    }
  }, [visible]);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const loadStudentData = async () => {
    const response = await apiCall('GET', `v1/message/${channelId}/users/detail`, null, token, true);
    console.log("response:",response);
    console.log("channelId:",channelId);
    if (!response) {
      setData([]);
      setFilteredData([]);
    } else if (response.error) {
      setData([]);
      setFilteredData([]);
    } else {
      // const res = Array.isArray(response.users) ? response : [];
      setData(response.users);
      setFilteredData(response.users);
      // console.log("data:",data);
    }
  }
  const handleCancel = () => {
    onCancel();
  }

  return (
    <>
      <Modal
        title="Members"
        visible={visible}
        footer={null}
        onCancel={handleCancel}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {selectedAvatars.map((user, index) => (
            <Avatar
              key={user.userId}
              id={user.userId}
              src={user.avatarURL ? user.avatarURL : ''}
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
                <Avatar src={item.avatarURL ? item.avatarURL : ''} style={{ marginRight: 16 }} />
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

export default ChatAllMemberCard;