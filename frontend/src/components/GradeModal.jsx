import React, { useState, useEffect } from 'react';
import { 
  Container,
  Alert,
  UncontrolledAlert,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";
import { Button, Flex, List, Input, Modal, Avatar, Tooltip, Typography } from 'antd';
import TextField from '@mui/material/TextField';
import Textarea from '@mui/joy/Textarea';
import { styled } from '@mui/joy/styles';

import { apiCall } from '../helper';
import MessageAlert from './MessageAlert';


const GradeModal = ({ title, sprintData, visible, onOk, onCancel }) => {

  const renderSprints = () => {
    return sprintData.map((sprint) => (
      <CardBody key={sprint.sprintId}>
        <Typography.Title
          level={5}
          style={{ fontWeight: 'bold' }}
        >
          {/* sprint title & calendar & date */}
            {sprint.sprintName}
            <div className="list-item-meta-id" style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
              (Date to be determined)
            </div>
        </Typography.Title>
        {/* list of user story */}
        <TextField
          id={`grade-${sprint.sprintName}`}
          label="Grade"
          type="text"
          fullWidth
          style={{ marginBottom: '16px' }}
          // value="{}"
          // onChange={e => setPassword(e.target.value)}
        /> 
        <Input.TextArea
          id={`comment-${sprint.sprintName}`}
          placeholder="Comment"
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ marginBottom: '16px', borderColor: '#CBCBCB'}}
        />
      </CardBody>
    ))
  };

  return (
    <>
      <Modal
        title={title}
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={onOk}>Save</Button>
        ]}
        style={{ marginLeft: '8px', transform: 'none' }}
        centered
      >
        <div className="modal-content">
          {renderSprints()}
        </div>
      </Modal>
    </>
  );
};

export default GradeModal;
