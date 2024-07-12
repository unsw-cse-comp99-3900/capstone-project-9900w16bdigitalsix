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


const GradeModal = ({ title, sprintData, visible, onCancel, gradeComment, setGradeComment, teamId, loadUserData }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  // handle change for grade or comment
  const handleChangeGrade = (value, sprintNum) => {
    const updatedGradeComment = {
      ...gradeComment,
      grades: {
        ...gradeComment.grades,
        [sprintNum - 1]: value,
      },
    };
    console.log("updatedGradeComment", updatedGradeComment);
    setGradeComment(updatedGradeComment);
  };
  
  const handleChangeComment = (value, sprintNum) => {
    const updatedGradeComment = {
      ...gradeComment,
      comments: {
        ...gradeComment.comments,
        [sprintNum - 1]: value,
      },
    };
    setGradeComment(updatedGradeComment);
  };

  // handle edit grade:
  const onOk = async() => {
    let sprints = [];
    // convert to standard format
    Object.keys(gradeComment.grades).map((key, index) => {
      let grade = gradeComment.grades[index];
      let comment = gradeComment.comments[index];
      
      let sprint = {
        sprintNum: parseInt(index + 1), 
        grade: parseInt(grade),
        comment: comment
      };
      sprints.push(sprint);
    });

    // call request
    const requestBody = {
      notification: {
        content: "Your team's grade has been updated",
        to: {
          teamId: parseInt(teamId),
        }
      },
      sprints: sprints,
      teamId: parseInt(teamId),
    }
    console.log("requestBody", requestBody);
    const response = await apiCall('POST', `v1/progress/edit/grade`, requestBody, token, true);
    loadUserData();
  };

  // won't show edit button for students
  const renderFooter = () => {
    if (parseInt(role) !== 1) {
      return [
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={onOk}>Save</Button>
      ];
    }
    return null; 
  };

  const renderSprints = () => {
    return sprintData.map((sprint) => (
      <CardBody key={sprint.sprintId}>
        <Typography.Title
          level={5}
          style={{ fontWeight: 'bold' }}
        >
          {/* sprint title & calendar & date */}
            {sprint.sprintName}
        </Typography.Title>
        {/* list of user story */}
        <TextField
          id={`grade-${sprint.sprintName}`}
          label="Grade"
          type="text"
          fullWidth
          style={{ marginBottom: '16px' }}
          value={`${gradeComment && gradeComment.grades[sprint.sprintNumber - 1] != undefined? gradeComment.grades[sprint.sprintNumber - 1] : ''}`}
          onChange={e => handleChangeGrade(e.target.value, sprint.sprintNumber)}
          disabled={parseInt(role) === 1}
        /> 
        <Input.TextArea
          id={`comment-${sprint.sprintName}`}
          placeholder="Comment"
          autoSize={{ minRows: 3, maxRows: 6 }}
          style={{ marginBottom: '16px', borderColor: '#CBCBCB'}}
          onMouseOver={(e) => { e.target.style.borderColor = 'black'; }}  // 鼠标悬停时边框颜色变化
          onMouseOut={(e) => { e.target.style.borderColor = '#CBCBCB'; }}
          value={`${gradeComment && gradeComment.comments[sprint.sprintNumber - 1] != undefined? gradeComment.comments[sprint.sprintNumber - 1] : ''}`}
          onChange={e => handleChangeComment(e.target.value, sprint.sprintNumber)}
          disabled={parseInt(role) === 1}
        />
      </CardBody>
    ))
  };

  return (
    <>
      <Modal
        title={title}
        open={visible}
        onOk={onOk}
        onCancel={onCancel}
        footer={renderFooter}
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
