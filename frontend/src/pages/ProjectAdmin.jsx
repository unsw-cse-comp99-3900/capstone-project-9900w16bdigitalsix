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
import '../assets/scss/FullLayout.css';//make sure import this

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

const ProjectAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const seachRef = useRef();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const loadUserData = async () => {
    if (loading) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Token not found in localStorage");
      setLoading(false);
      return;
    }
  
    const response = await apiCall('GET', 'v1/project/get/public_project/list');
  
    console.log("response:", response)
  
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

  const solveClickAssign = (item) => {
    navigate(`/project/admin/${item.projectId}`, { state: { item } });
    // setSelectedUser(user);
    // setIsModalVisible(true);
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
            <div className="search">
              <Input
                ref={seachRef}
                size="large"
                placeholder="Search Project"
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
                    {/* <Avatar src={item.avatar || ''} size={48} className="avatar" /> */}
                    <List.Item.Meta style={{paddingLeft: "8px"}}

                      title={
                        <div className="list-item-meta-title">
                          <span className="list-item-meta-name" style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.title}</span>
                          {/* <span className="list-item-meta-role" style={{ backgroundColor: roleColorMap[item.role].background, color: roleColorMap[item.role].color }}>
                            {roleMap[item.role]}
                          </span> */}
                        </div>
                      }
                      description={
                        <div className="list-item-meta-description">
                          <div className="list-item-meta-id">Client: {item.clientName}</div>
                          <div className="list-item-meta-email">Client Email: {item.clientEmail}</div>
                          <div className="list-item-meta-field">Field: {item.field}</div>
                        </div>
                      }
                    />
                    <Button type="primary" className="list-item-button" onClick={() => solveClickAssign(item)}>Assign</Button>
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

export default ProjectAdmin;