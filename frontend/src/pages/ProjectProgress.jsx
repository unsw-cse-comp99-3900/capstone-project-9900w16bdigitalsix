import { Outlet, useLocation } from "react-router-dom";
import { 
  Container,
  Alert,
  UncontrolledAlert,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";
import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input, Modal, Avatar, Tooltip, Typography } from 'antd';
import { StarFilled, TrophyFilled, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall, fileToDataUrl } from '../helper';
import EditUserStoryModal from '../components/EditUserStoryModal';
import CreateUserStoryModal from "../components/CreateUserStoryModal";

import GradeModal from "../components/GradeModal";

import '../assets/scss/RoleManage.css'
import '../assets/scss/FullLayout.css';//make sure import this
import Calendar from "../components/Calendar";
import MessageAlert from '../components/MessageAlert';

// student, tutor and client can edit project progress
// student can't edit grade

const statusColorMap = {
  1: '#808080',   // grey
  2: '#88D2FF',   // blue
  3: '#52c41a'    // green
};

const statusTextMap = {
  1: 'TO DO',   // grey
  2: 'IN PROGRESS',   // blue
  3: 'DONE'    // green
};

const sprintData = [
  { sprintNumber: 1, sprintName: 'Sprint 1' },
  { sprintNumber: 2, sprintName: 'Sprint 2' },
  { sprintNumber: 3, sprintName: 'Sprint 3' },
];

const ProjectProgress = (props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { item } = location.state || {};

  const { projectId, teamId } = useParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [storys, setStorys] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [description, setDescription] = useState('');

  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [dates, setDates] = useState([]);
  const [sprintNo, setSprintNo] = useState(null);
  const [userStoryId, setUserStoryId] = useState(null);
  const [userStoryStatus, setUserStoryStatus] = useState(null);
  const [gradeComment, setGradeComment] = useState(null);
  // for messageAlert component
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');

  // get localstorage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // for delete modal
  const toggleDeleteModal = () => setDeleteModalVisible(!deleteModalVisible);
  const handleDeleteClick = (id) => {
    toggleDeleteModal();
    setUserStoryId(id);
  }
  const handleDelete = async() => {
    const response = await apiCall('DELETE', `v1/progress/delete/${userStoryId}`, null, token, true);
    if (!response) {
      setSnackbarContent("null");
      setAlertType('error');
      setAlertOpen(true);
    } else if (response.error) {
      setSnackbarContent(response.error);
      setAlertType('error');
      setAlertOpen(true);
    } else {
      setSnackbarContent('Delete successfully');
      setAlertType('success');
      setAlertOpen(true);
      toggleDeleteModal();
      loadUserData();
    }
  };

  // for calendar modal
  const toggleCalendarModal = (sprintNumber) => {
    setCalendarModalVisible(!calendarModalVisible);
    setSprintNo(sprintNumber);
    setDates([]);
  };

  const handleCalendar = async() => {
    const requestBody = {
      endDate: dates[1].format('YYYY-MM-DD'),
      sprintNum: parseInt(sprintNo, 10),
      startDate: dates[0].format('YYYY-MM-DD'),
      teamId: parseInt(item.teamId, 10),
    };
    const response = await apiCall('POST', `v1/progress/edit/sprint/date`, requestBody, token, true);
    if(response.error){
      setSnackbarContent(response.error);
      setAlertType('error');
      setAlertOpen(true);
    } else {
      setSnackbarContent("Change successfully");
      setAlertType('success');
      setAlertOpen(true);
    }
    loadUserData();
    toggleCalendarModal();
  };

  const loadUserData = async () => {
    if (loading) return;
    setLoading(true);
    if (!token) {
      console.error("Token not found in localStorage");
      setLoading(false);
      return;
    }
  
    const response = await apiCall('GET', `v1/progress/get/detail/${item?.teamId}`, null, token, true);
    if (!response) {
      setData(null);
      setLoading(false);
    } else if (response.error) {
      setData(null);
      setLoading(false);
    } else {
      setData(response);
      const allUserStories = response.sprints.reduce((acc, sprint) => {
        // Map each user story with its sprint number
        const userStoriesWithIndexes = sprint.userStoryList.map((story, index) => ({
          ...story,
          sprintNum: sprint.sprintNum,
          globalIndex: acc.length + index + 1
        }));
        // Concatenate mapped user stories to accumulator
        return acc.concat(userStoriesWithIndexes);
      }, []);
      setStorys(allUserStories);

      // update grade and comment
      let grades = [];
      let comments = [];
      for (let sprintNum = 1; sprintNum <= 3; sprintNum++) {
        let sprint = response.sprints.find(s => s.sprintNum === sprintNum);
        if (sprint) {
            grades.push(sprint.sprintGrade ? sprint.sprintGrade : '');
            comments.push(sprint.sprintComment ? sprint.sprintComment : '');
        } else {
            grades.push('');
            comments.push('');
        }
      }
      setGradeComment({grades: grades, comments: comments});
      setLoading(false);
      console.log("{grades: grades, comments: comments}", {grades: grades, comments: comments});
    }
  };
  

  useEffect(() => {
    loadUserData();
  }, []);

  // for edit user story modal
  const handleUserStoryClick = (story, sprintNumber) => {
    setIsEditModalVisible(true);
    setDescription(story.userStoryDescription);
    setSprintNo(sprintNumber);
    setUserStoryId(story.userStoryId);
    setUserStoryStatus(story.userStoryStatus);
  };

  const handleEditOk = () => {
    setIsEditModalVisible(false);
  };
  
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  // for create user story modal
  const showCreateModal = (sprintNumber) => {
    setIsCreateModalVisible(true);
    setSprintNo(sprintNumber);
    setDescription('');
    setUserStoryStatus(1);
  };

  const handleCreateOk = async() => {
    setIsCreateModalVisible(false);
  };
  
  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
  };  

  // for grade modal
  const showGradeModal = () => {
    setIsGradeModalVisible(true);
  };


  const handleGradeOk = () => {
    setIsGradeModalVisible(false);
  };
  
  const handleGradeCancel = () => {
    setIsGradeModalVisible(false);
  };  

  const clickReport = () => {
    navigate(`/project/report/${projectId}/${teamId}`);
  };

  const renderSprints = () => {
    return sprintData.map((sprint, index) => {
      const currentSprint = data?.sprints?.find(s => s.sprintNum === sprint.sprintNumber);
      const startDate = currentSprint ? currentSprint.startDate : null;
      const endDate = currentSprint ? currentSprint.endDate : null;
      const sprintGrade = currentSprint ? currentSprint.sprintGrade : null;
      // generate date list
      const datesRender = [];
      if (startDate) datesRender.push(startDate);
      if (endDate) datesRender.push(endDate);

      return ( item ? 
        <CardBody className="">
          <Typography.Title
            level={5}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
          >
            {/* sprint title & calendar & date */}
            <div>
              {sprint.sprintName}
              <span style={{ fontSize: '14px', color: '#888', fontStyle: 'italic', marginLeft: '5px' }}>
                {sprintGrade ? `(${sprintGrade} / 100)` : '(. / 100)'}
              </span>
              <Tooltip title='Select Sprint Duration' placement="right">
                {(parseInt(role, 10) !== 3) && (
                  <Button
                    type="primary"
                    style={{ margin: '8px', width: "20px", background: 'transparent' }}
                    onClick={() => toggleCalendarModal(sprint.sprintNumber)}
                  >
                    <i class="bi bi-calendar-fill" style={{ color: 'black', fontSize: '20px' }}></i>
                  </Button>
                )}
              </Tooltip>
              <div className="list-item-meta-id" style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
              {startDate && endDate ? `(${startDate}, ${endDate})` : '(Date to be determined)'}
              </div>
            </div>
            {/* add user story */}
            <Tooltip title="Add User Story">
            {parseInt(role, 10) !== 3 && (
              <Button
                type="primary"
                style={{ margin: '8px' }}
                icon={<PlusOutlined />}
                onClick={() => showCreateModal(sprint.sprintNumber)}
              />
            )}
            </Tooltip>
          </Typography.Title>
          {/* list of user story */}
          <List
            dataSource={storys.filter(story => story.sprintNum === sprint.sprintNumber)}
            renderItem={(story, index) => (
              <List.Item className="list-item" key={story.userStoryId}>
                <List.Item.Meta
                  onClick={() => handleUserStoryClick(story, sprint.sprintNumber)}
                  style={{ marginLeft: '20px', cursor: 'pointer' }}
                  title={
                    <div className="list-item-meta-title">
                      <span className="list-item-meta-name" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {`User Story ${story.globalIndex}`}
                      </span>
                    </div>
                  }
                  description={
                    <div className="list-item-meta-description">
                      <div className="list-item-meta-id" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {story.userStoryDescription}
                      </div>
                    </div>
                  }
                />
                <Tooltip title={statusTextMap[story.userStoryStatus]}>
                  <div
                    style={{ 
                      backgroundColor: statusColorMap[story.userStoryStatus],
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      marginRight: '10px' }}
                  ></div>
                </Tooltip>
                {/* delete user story */}
                <Tooltip title='Delete'>
                {parseInt(role, 10) !== 3 && (
                  <Button
                    type="secondary"
                    className="list-item-button"
                    onClick={() => handleDeleteClick(story.userStoryId)}
                    style={{ color:"red", border: "0", margin: "1px" }}
                  >
                    <i class="bi bi-trash3-fill"></i>
                  </Button>
                )}
                </Tooltip>
              </List.Item>
            )}
          />
        </CardBody> : <></>
    )});
  };

  // main screen
  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        {/********Sidebar**********/}
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="contentArea">
          <div className="d-lg-none headerMd">
            {/********Header**********/}
            <Header />
          </div>
          <div className="d-none d-lg-block headerLg">
            {/********Header**********/}
            <Header />
          </div>
          <Container className="p-4 wrapper" fluid>
            <Card>
              <CardTitle
                tag="h5"
                className="border-bottom p-3 mb-0"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
              >
                <div>
                  {item?.title} - {item?.teamName}
                  <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px' }}>
                    Project Id: {projectId} - Team Id: {item?.teamIdShow}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tooltip title="Grade">
                    <Button
                      type="primary"
                      style={{ margin: '8px', width: "20px" }}
                      onClick={showGradeModal}
                    >
                      <StarFilled style={{ color: '#fadb14', fontSize: '20px' }} />
                    </Button>
                  </Tooltip>
                  <Tooltip title="Report">
                    <Button
                      type="primary"
                      style={{ margin: '8px', width: "20px" }}
                      onClick={clickReport}
                      disabled={!item}
                    >
                      <FileTextOutlined style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }} />
                    </Button>
                    </Tooltip>
                </div>
              </CardTitle>
                {renderSprints()}
            </Card>
          </Container>

          {/* Grade Modal */}
          <GradeModal
            title="Grade"
            sprintData={sprintData}
            visible={isGradeModalVisible}
            onOk={handleGradeOk}
            onCancel={handleGradeCancel}
            gradeComment={gradeComment}
            setGradeComment={setGradeComment}
            teamId={item?.teamId}
            loadUserData={loadUserData}
          />
          {/* edit user story */}
          <EditUserStoryModal
            title={`Edit User Story - Sprint ${sprintNo}`}
            visible={isEditModalVisible}
            description={description}
            setDescription={setDescription}
            onOk={handleEditOk}
            onCancel={handleEditCancel}
            refreshData={loadUserData} // update function
            sprintNo={`${sprintNo}`}
            teamId={item?.teamId}
            userStoryId={userStoryId}
            userStoryStatus={userStoryStatus}
            setUserStoryStatus={setUserStoryStatus}
          />
          {/* create user story */}
          <CreateUserStoryModal
            title={`Create User Story - Sprint ${sprintNo}`}
            visible={isCreateModalVisible}
            description={description}
            setDescription={setDescription}
            onOk={handleCreateOk}
            onCancel={handleCreateCancel}
            refreshData={loadUserData} // update function
            sprintNo={`${sprintNo}`}
            teamId={item?.teamId}
            userStoryStatus={userStoryStatus}
            setUserStoryStatus={setUserStoryStatus}
          />
          {/* delete modal */}
          <Modal
            title="Confirm Delete"
            open={deleteModalVisible}
            onOk={handleDelete}
            onCancel={toggleDeleteModal}
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <p>Are you sure you want to delete this user story?</p>
          </Modal>
          {/* sprint duration calendar */}
          <Modal
            title="Select Sprint Duration"
            open={calendarModalVisible}
            onOk={handleCalendar}
            onCancel={toggleCalendarModal}
            okText="Save"
            cancelText="Cancel"
            centered
          >
            <Calendar 
              dates={dates}
              setDates={setDates}
            />
          </Modal>
        </div>
      </div>
      <MessageAlert
        open={alertOpen}
        alertType={alertType}
        handleClose={() => setAlertOpen(false)}
        snackbarContent={snackbarContent}
      />
    </main>
  );
};

export default ProjectProgress;