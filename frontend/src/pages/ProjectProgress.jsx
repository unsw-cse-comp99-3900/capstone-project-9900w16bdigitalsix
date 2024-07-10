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


const statusColorMap = {
  1: '#808080',   // grey
  2: '#006064',   // blue
  3: '#52c41a'    // green
};

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
  const [data, setData] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isGradeModalVisible, setIsGradeModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [dates, setDates] = useState([]);
  const [sprintNo, setSprintNo] = useState(null);
  const [description, setDescription] = useState('');

  // for delete modal
  const toggleDeleteModal = () => setDeleteModalVisible(!deleteModalVisible);
  const handleDelete = () => {
    console.log('Deleting item:');
    toggleDeleteModal();
  };

  // for calendar modal
  const toggleCalendarModal = (sprintNumber) => {
    setCalendarModalVisible(!calendarModalVisible);
    setSprintNo(sprintNumber);
    console.log("sprintNumber", sprintNumber);
  };

  const handleCalendar = () => {
    console.log('change calendar:');
    toggleCalendarModal();
  };

  const loadUserData = async () => {
    if (loading) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Token not found in localStorage");
      setLoading(false);
      return;
    }
  
    const response = await apiCall('GET', 'v1/admin/get/user/list', null, token, true);
  
    //console.log("response:", response)
    if (!response) {
      setData([]);
      setLoading(false);
    } else if (response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = Array.isArray(response) ? response : [];
      setData(res);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadUserData();
  }, []);

  // for edit user story modal
  const showEditModal = (user, sprintNumber) => {
    setSelectedUser(user);
    setIsEditModalVisible(true);
    setSprintNo(sprintNumber);
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
  };

  const handleCreateOk = () => {
    setIsCreateModalVisible(false);
  };
  
  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
  };  

  // for grade modal
  const showGradeModal = () => {
    setIsGradeModalVisible(true);
  };

  ///////////////////////////////////////////////////////TODO
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
    return sprintData.map((sprint) => (
      <CardBody className="">
        <Typography.Title
          level={5}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
        >
          {/* sprint title & calendar & date */}
          <div>
            {sprint.sprintName}
            <Tooltip title='Select Sprint Duration' placement="right">
              <Button
                type="primary"
                style={{ margin: '8px', width: "20px", background: 'transparent' }}
                onClick={() => toggleCalendarModal(sprint.sprintNumber)}
              >
                <i class="bi bi-calendar-fill" style={{ color: 'black', fontSize: '20px' }}></i>
              </Button>
            </Tooltip>
            <div className="list-item-meta-id" style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
              (Date to be determined)
            </div>
          </div>
          {/* add user story */}
          <Tooltip title="Add User Story">
            <Button type="primary" style={{ margin: '8px' }} icon={<PlusOutlined />} onClick={() => showCreateModal(sprint.sprintNumber)}/>
          </Tooltip>
        </Typography.Title>
        {/* list of user story */}
        <List
          loading={loading}
          dataSource={data}
          renderItem={(item) => (
            <List.Item className="list-item" key={item.userId}>
              <List.Item.Meta
                onClick={() => showEditModal(item, sprint.sprintNumber)}
                style={{ marginLeft: '20px', cursor: 'pointer' }}
                title={
                  <div className="list-item-meta-title">
                    <span className="list-item-meta-name" style={{ fontSize: '16px', fontWeight: 'bold' }}>User Story X</span>
                    <span className="list-item-meta-role" style={{ backgroundColor: roleColorMap[item.role].background, color: roleColorMap[item.role].color }}>
                      {roleMap[item.role]}
                    </span>
                  </div>
                }
                description={
                  <div className="list-item-meta-description">
                    <div className="list-item-meta-id">Description</div>
                  </div>
                }
              />
              <Tooltip title='To Do'>
                <div
                  style={{ 
                    backgroundColor: statusColorMap[1],
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    marginRight: '8px' }}
                ></div>
              </Tooltip>
              {/* delete user story */}
              <Tooltip title='Delete'>
                <Button
                  type="secondary"
                  className="list-item-button"
                  onClick={() => toggleDeleteModal()}
                  style={{ color:"red", border: "0", margin: "1px" }}
                >
                  <i class="bi bi-trash3-fill"></i>
                </Button>
              </Tooltip>
            </List.Item>
          )}
        />
      </CardBody>
    ))
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
                  {item.title} - {item.teamName}
                  <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px' }}>
                    Project Id: {projectId} - Team Id: {item.teamIdShow}
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
          />

          {/* edit user story */}
          <EditUserStoryModal
            title={`Edit User Story - Sprint ${sprintNo}`}
            visible={isEditModalVisible}
            defaultDes={description}
            description={description}
            setDescription={setDescription}
            onOk={handleEditOk}
            onCancel={handleEditCancel}
            refreshData={loadUserData} // update function
          />
          {/* create user story */}
          <EditUserStoryModal
            title={`Create User Story - Sprint ${sprintNo}`}
            visible={isCreateModalVisible}
            defaultDes=""
            description={description}
            setDescription={setDescription}
            onOk={handleCreateOk}
            onCancel={handleCreateCancel}
            refreshData={loadUserData} // update function
          />
          {/* delete modal */}
          <Modal
            title="Confirm Delete"
            visible={deleteModalVisible}
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
            visible={calendarModalVisible}
            onOk={handleCalendar}
            onCancel={toggleCalendarModal}
            okText="Save"
            cancelText="Cancel"
            centered
          >
            <Calendar dates={dates} setDates={setDates}/>
          </Modal>
        </div>
      </div>
    </main>
  );
};

export default ProjectProgress;