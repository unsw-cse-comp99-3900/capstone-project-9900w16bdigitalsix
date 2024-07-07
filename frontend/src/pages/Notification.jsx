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
import { CloseOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input, Modal, Avatar, Tooltip, Typography } from 'antd';
import { StarFilled, TrophyFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall, fileToDataUrl } from '../helper';
import EditUserStoryModal from '../components/EditUserStoryModal';
import '../assets/scss/RoleManage.css'
import '../assets/scss/FullLayout.css';//make sure import this

const Notification = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // for Clear notification
  const toggleDeleteModal = () => setDeleteModalVisible(!deleteModalVisible);
  const handleDelete = async () => {
    console.log('Clear notification:');
    const response = await apiCall('DELETE', `v1/notification/clear/all/${userId}`, null, token, true);
    loadUserData();
    toggleDeleteModal();
  };

  
  const loadUserData = async () => {
    if (loading) return;
    setLoading(true);
    if (!token) {
      console.error("Token not found in localStorage");
      setLoading(false);
      return;
    }
  
    const response = await apiCall('GET', `v1/notification/get/all/${userId}`, null, token, true);
  
    console.log("response:", response);
    console.log("userId:", userId);
    if (!response) {
      setData([]);
      setFilteredData([]);
      setLoading(false);
    } else if (response.error) {
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
                  Notifications
                </div>
                <Button 
                  type="primary" 
                  style={{ margin: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  onClick={() => toggleDeleteModal()}
                >
                  {hovered ? (
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Clear</span>
                  ) : (
                    <CloseOutlined style={{ fontSize: '20px' }} />
                  )}
                </Button>
              </CardTitle>
              <CardBody className="">
                <List
                  loading={loading}
                  dataSource={filteredData}
                  renderItem={(item) => (
                    <List.Item className="list-item" key={item.userId}>
                      <div
                        style={{ 
                          backgroundColor: '#006064',
                          borderRadius: '50%',
                          width: '10px',
                          height: '10px',
                          marginRight: '20px',
                          marginLeft: '20px',
                        }}
                      ></div>
                      <List.Item.Meta
                        title={
                          <div className="list-item-meta-title">
                            <span className="list-item-meta-name" style={{ fontSize: '16px', fontWeight: '600', color: '#333', fontFamily: 'Arial, sans-serif' }}>
                              {item.content}
                            </span>
                          </div>
                        }
                        description={
                          <div className="list-item-meta-description">
                            <div className="list-item-meta-id" style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
                              date
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </CardBody>
            </Card>
          </Container>
          {/* delete modal */}
          <Modal
            title="Confirm Clear"
            visible={deleteModalVisible}
            onOk={handleDelete}
            onCancel={toggleDeleteModal}
            okText="Clear"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <p>Are you sure you want to clear all the notifications?</p>
          </Modal>
        </div>
      </div>
    </main>
  );
};

export default Notification;