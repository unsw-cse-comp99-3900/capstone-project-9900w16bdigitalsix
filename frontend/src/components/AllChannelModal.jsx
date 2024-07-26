import React, { useState, useEffect, useRef } from 'react';
import { Modal, Select, Avatar, Button, message, List, Radio, Input } from 'antd';
import { Button as MUIButton } from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Option } = Select;

const AllChannelModal = ({ visible, onOk, onCancel, refreshData, channelId, setChannelId, data, channelType, setChannelType, channelName, setChannelName }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const userId = parseInt(localStorage.getItem('userId'));
  const token = localStorage.getItem('token');

  // share a personal card
  const handleClick = (id, type, name) => {
    setChannelId(id);
    setChannelType(type);
    setChannelName(name);
    onOk();
  };

  const handleCancel = () => {
    onCancel();
  }

  return (
    <>
      <Modal
        title="Select a channel"
        open={visible}
        onCancel={handleCancel}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <div>
            <strong>Private Channels</strong>
            <List
              dataSource={data.length > 0 ? data.filter(item => parseInt(item.type) === 1): []}
              style={{ maxHeight: '400px', overflowY: 'auto' }}
              renderItem={item => (
                <List.Item onClick={() => handleClick(item.channelId, item.type, item.channelName)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div
                      style={{ 
                        backgroundColor: '#006064',
                        borderRadius: '50%',
                        width: '10px',
                        height: '10px',
                        marginRight: '5px',
                        marginLeft: '20px',
                      }}
                    ></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>{item.channelName}</div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div>
            <strong>Group Channels</strong>
            <List
              dataSource={data.length > 0 ? data.filter(item => parseInt(item.type) === 2) : []}
              style={{ maxHeight: '400px', overflowY: 'auto' }}
              renderItem={item => (
                <List.Item onClick={() => handleClick(item.channelId, item.type, item.channelName)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div
                      style={{ 
                        backgroundColor: '#e65100',
                        borderRadius: '50%',
                        width: '10px',
                        height: '10px',
                        marginRight: '5px',
                        marginLeft: '20px',
                      }}
                    ></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div>{item.channelName}</div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>

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

export default AllChannelModal;
