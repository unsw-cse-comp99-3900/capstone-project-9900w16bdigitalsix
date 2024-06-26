import { Outlet } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input, Modal, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall, fileToDataUrl } from '../helper';
import AssignRoleModal from '../components/AssignRoleModal';
import '../assets/scss/RoleManage.css'

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

const RoleManage = () => {
  const headerStyleLg = {
    position: "fixed",
    top: 0,
    // width: "100%",
    width: "calc(100% - 260px)",
    zIndex: 1000,
  };

  const contentAreaStyle = {
    marginTop: '56px', // Adjust this value to match the Header height
    // padding: '16px', // Optional padding for the content area
  };

  const headerStyleMd = {
    position: "fixed",
    top: 0,
    width: "100%",
    // width: "calc(100% - 260px)",
    zIndex: 1000,
  };

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const seachRef = useRef();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const showModal = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };
  
  const handleOk = () => {
    setIsModalVisible(false);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
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
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        <div className="contentArea" style={contentAreaStyle}>
          <div className="d-mg-none" style={headerStyleLg}>
            <Header />
          </div>
          <div className="d-lg-none" style={headerStyleMd}>
            <Header />
          </div>
          <Container className="p-4 wrapper" fluid>
            <div className="search">
              <Input
                ref={seachRef}
                size="large"
                placeholder="Search User"
                prefix={<SearchOutlined />}
                onChange={searchList}
              />
            </div>
            <div id="scrollableDiv">
              <List
                loading={loading}
                dataSource={filteredData}
                renderItem={(item) => (
                  <List.Item className="list-item" key={item.userId}>
                    <Avatar src={item.avatar || ''} size={48} className="avatar" />
                    <List.Item.Meta
                      title={
                        <div className="list-item-meta-title">
                          <span className="list-item-meta-name" style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.userName}</span>
                          <span className="list-item-meta-role" style={{ backgroundColor: roleColorMap[item.role].background, color: roleColorMap[item.role].color }}>
                            {roleMap[item.role]}
                          </span>
                        </div>
                      }
                      description={
                        <div className="list-item-meta-description">
                          <div className="list-item-meta-id">ID: {item.userId}</div>
                          <div className="list-item-meta-email">Email: {item.email}</div>
                        </div>
                      }
                    />
                    <Button type="primary" className="list-item-button" onClick={() => showModal(item)}>Assign</Button>
                  </List.Item>
                )}
              />
            </div>
          </Container>
          <AssignRoleModal
            visible={isModalVisible}
            user={selectedUser}
            onOk={handleOk}
            onCancel={handleCancel}
            refreshData={loadUserData} // update function
          />
        </div>
      </div>
    </main>
  );
};

export default RoleManage;