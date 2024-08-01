import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Select, Avatar, Input, Button, message, Typography } from 'antd';

import '../assets/scss/AssignRoleModal.css';
import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';

import TextField from '@mui/material/TextField';

const { Option } = Select;

const statusMap = {
  1: 'TO DO',
  2: 'IN PROGRESS',
  3: 'DONE',
};

const statusColorMap = {
  1: '#808080',   // grey
  2: '#88D2FF',   // blue
  3: '#52c41a'    // green
};

const CreateUserStoryModal = ({ title, visible, description, setDescription, onOk, onCancel, refreshData, sprintNo, teamId, userStoryId, userStoryStatus, setUserStoryStatus }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');
  const navigate = useNavigate();

  // record status
  const handleStatusChange = (value) => {
    setUserStoryStatus(parseInt(value, 10));
  };

  // record description
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  }

  const handleSubmit = async () => {
    // valid check
    if (!description) {
      setSnackbarContent('Please complete description.');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }

    // token check
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login')
      return;
    }

    // request
    const requestBody = {
      sprintNum: parseInt(sprintNo, 10),
      teamId: parseInt(teamId, 10),
      userStoryDescription: description,
      userStoryStatus: userStoryStatus
    };

    console.log("requestBody", requestBody);
    const response = await apiCall('POST', `v1/progress/edit/${userStoryId}`, requestBody, token, true);

    if (response.error) {
      setSnackbarContent(response.error);
      setAlertType('error');
      setAlertOpen(true);
    } else {
      setSnackbarContent('Create successfully');
      setAlertType('success');
      setAlertOpen(true);
      onOk();
      refreshData();
    }
  };

  return (
    <>
      <Modal
        title={title}
        open={visible}
        onOk={handleSubmit}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>Save</Button>
        ]}
      >
        <Typography.Text
          style={{marginRight: '16px'}}
        >
          Select Status:
        </Typography.Text>
        <Select
          className="status-select"
          placeholder="Select status"
          value={userStoryStatus !== null ? userStoryStatus.toString() : undefined}
          onChange={handleStatusChange}
          style={{width: '50%'}}
        >
          {Object.keys(statusMap).map((key) => (
            <Option key={key} value={key} label={statusMap[key]}>
              <span style={{ color: statusColorMap[key] }}>{statusMap[key]}</span>
            </Option>
          ))}
        </Select>
        <div className="modal-body">
          <Input.TextArea 
            placeholder="Description"
            autoSize={{ minRows: 3, maxRows: 6 }} 
            onChange={handleDescriptionChange}
            value={description}
          />
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

export default CreateUserStoryModal;
