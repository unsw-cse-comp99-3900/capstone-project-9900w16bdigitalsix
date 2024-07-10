import { Outlet } from "react-router-dom";
import { Container } from "reactstrap";
import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input, Modal, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';

import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { apiCall, fileToDataUrl } from '../helper';
import '../assets/scss/RoleManage.css'
import '../assets/scss/FullLayout.css';//make sure import this

const ProjectAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const seachRef = useRef();
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
    if (!response){
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

  const solveClickAssign = (item) => {
    navigate(`/project/admin/${item.projectId}`, { state: { item } });
  };
  

  const searchList = () => {
    const searchTerm = seachRef.current.input.value.toLowerCase();
    if (searchTerm) {
      const filtered = data.filter(item => 
        (item.title && item.title.toString().includes(searchTerm)) ||
        (item.clientName && item.clientName.toLowerCase().includes(searchTerm)) || 
        (item.clientEmail && item.clientEmail.toLowerCase().includes(searchTerm)) ||
        (item.field && item.field.toLowerCase().includes(searchTerm))
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
        </div>
      </div>
    </main>
  );
};

export default ProjectAdmin;