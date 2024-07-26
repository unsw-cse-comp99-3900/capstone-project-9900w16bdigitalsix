import React, { useState, useEffect, useRef } from 'react';
import { Modal, Select, Avatar, Button, message, List, Radio, Input } from 'antd';
import { Button as MUIButton } from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

const { Option } = Select;

const AllChannelModal = ({ visible, onOk, onCancel, refreshData, channelId, setChannelId }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  const userId = parseInt(localStorage.getItem('userId'));
  const token = localStorage.getItem('token');

  // channel list
  const [data, setData] = useState([]);

  useEffect(() => {
    loadChannelData();
  }, []);


  // fetch channel list
  const loadChannelData = async() => {
    const response = await apiCall('GET', 'v1/message/get/all/channels', null, token, true);
      if (!response) {
        setData([]);
      } else if (response.error) {
        setData([]);
      } else {
        setData(response.channels);
      }
  }

  // share a personal card
  const handleClick = (id) => {
    setChannelId(id);
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
                <List.Item onClick={() => handleClick(item.channelId)} style={{ cursor: 'pointer' }}>
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
                <List.Item onClick={() => handleClick(item.channelId)} style={{ cursor: 'pointer' }}>
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
