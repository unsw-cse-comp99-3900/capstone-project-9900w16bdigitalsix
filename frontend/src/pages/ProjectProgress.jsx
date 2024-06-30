import { Outlet } from "react-router-dom";
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
import { StarFilled, TrophyFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall, fileToDataUrl } from '../helper';
import EditUserStoryModal from '../components/EditUserStoryModal';
import '../assets/scss/RoleManage.css'
import '../assets/scss/FullLayout.css';//make sure import this
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

const ProjectProgress = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const seachRef = useRef();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // for delete modal
  const toggleDeleteModal = () => setDeleteModalVisible(!deleteModalVisible);
  const handleDelete = () => {
    console.log('Deleting item:');
    toggleDeleteModal();
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
  
    if (response.error) {
      setData([]);
      setFilteredData([]);
      setLoading(false);
    } else {
      const res = Array.isArray(response) ? response : [];
      setData(res);
      setFilteredData(res);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    loadUserData();
  }, []);

  const showEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalVisible(true);
  };
  
  const handleOk = () => {
    setIsEditModalVisible(false);
  };
  
  const handleCancel = () => {
    setIsEditModalVisible(false);
  };  

  const searchList = () => {
    const searchTerm = seachRef.current.input.value.toLowerCase();
    if (searchTerm) {
      const filtered = data.filter(item => 
        (item.userId && item.userId.toString().includes(searchTerm)) ||
        (item.userName && item.userName.toLowerCase().includes(searchTerm)) || 
        (item.email && item.email.toLowerCase().includes(searchTerm))
        
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };  

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
                  Project Title - Team name
                  <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px' }}>
                    Project Id: xxx - Team Id: xxx
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tooltip title="Grade">
                    <Button type="primary" style={{ margin: '8px', width: "20px" }}><StarFilled style={{ color: '#fadb14', fontSize: '20px' }} /></Button>
                  </Tooltip>
                  <Tooltip title="Add User Story">
                    <Button type="primary" style={{ margin: '8px' }} icon={<PlusOutlined />} />
                  </Tooltip>
                </div>
              </CardTitle>
              <CardBody className="">
                <Typography.Title level={5}>Sprint 1</Typography.Title>
                <List
                  loading={loading}
                  dataSource={filteredData}
                  renderItem={(item) => (
                    <List.Item className="list-item" key={item.userId}>
                      <List.Item.Meta
                        onClick={() => showEditModal(item)}
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
            </Card>
          </Container>
          <EditUserStoryModal
            visible={isEditModalVisible}
            user={selectedUser}
            onOk={handleOk}
            onCancel={handleCancel}
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
        </div>
      </div>
    </main>
  );
};

export default ProjectProgress;