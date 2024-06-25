import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, List, Input } from "antd";
import "../styles/teamTutor.css";
// import { useNavigate } from "react-router-dom";
import InviteModel from "./InviteModel";
import { apiCall } from "../helper";

import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { Container } from 'reactstrap';
import { Avatar, Chip, Box } from '@mui/material';

export default function TeamTutor() {
  // const navigate = useNavigate();
  const [team, setTeam] = useState(true);
  const [loading, setLoading] = useState(false);
  const mounting = useRef(true);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);
  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = "v1/team/get/list";
    const studentUrl = "v1/student/unassigned/list";
    const response = await apiCall("GET", team ? url : studentUrl);
    console.log("....list....", response);
    if (response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = response;
      console.log(res);
      setData([...res]);
      setLoading(false);
    }
    // axios
    //   .get(team ? url : studentUrl, { params, headers })
    //   .then((response) => {
    //     const res = response.data;
    //     console.log(res);
    //     setData([...res]);
    //     setLoading(false);
    //   })
    //   .catch((error) => {
    //     setData([]);
    //     setLoading(false);
    //     console.error('Error fetching data:', error);
    //   });
  };
  useEffect(() => {
    if (mounting.current) {
      mounting.current = false;
    } else {
      loadMoreData();
    }
  }, [team]);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log("...token..");
      // if (!localStorage.getItem('token')) {
      //   navigate('/login');
      //   return;
      // }
      loadMoreData();
    }
  }, [mountedRef]);
  const changeList = () => {
    setData([]);
    setTeam(!team);
  };
  const seachList = () => {
     const searchTerm = seachRef.current.input.value.toLowerCase();
     console.log(searchTerm);
     if (searchTerm) {
     let filtered;
     if (team) {
     filtered = data.filter((item) =>
     [item.teamName, item.teamSkills, String(item.teamId)].some((field) =>{
        if (field) {
          return field.toLowerCase().includes(searchTerm)
        }
      }
     )
     );
     } else {
     filtered = data.filter((item) =>
     [item.userName, item.email, String(item.userId)].some((field) => {
      if (field) {
        return field.toLowerCase().includes(searchTerm)
      }
     }
     )
     );
     }
     console.log(filtered);
     setData(filtered);
     } else {
     console.log(data);
     //   setData(data);
     loadMoreData();
     }
     };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleClose = () => {
    setIsModalOpen(false);
  };

  const contentAreaStyle = {
    marginTop: '56px', // Adjust this value to match the Header height
    // padding: '16px', // Optional padding for the content area
  };

  const headerStyleLg = {
    position: "fixed",
    top: 0,
    // width: "100%",
    width: "calc(100% - 260px)",
    zIndex: 1000,
  };

  const headerStyleMd = {
    position: "fixed",
    top: 0,
    width: "100%",
    // width: "calc(100% - 260px)",
    zIndex: 1000,
  };

  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        {/********Sidebar**********/}
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="contentArea" style={contentAreaStyle}>
          <div className="d-mg-none" style={headerStyleLg}>
            {/********Header**********/}
            <Header />
          </div>
          <div className="d-lg-none" style={headerStyleMd}>
            {/********Header**********/}
            <Header />
          </div>
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            {/* add code here */}
            <>
              <div className="titleBtn">
                <Flex gap="small" wrap>
                  <Button
                    style={{ backgroundColor: "#6451e9", borderColor: "#6451e9" }}
                    type="primary"
                    shape="round"
                    onClick={changeList}
                  >
                    {team ? "STUDENT LIST" : "TEAM LIST"}
                  </Button>
                </Flex>
              </div>
              <div className="seach">
                <Input
                  ref={seachRef}
                  size="large"
                  placeholder={team ? "Search Team" : "Search Student"}
                  prefix={<SearchOutlined />}
                />
                <div
                  style={{ marginLeft: "15px", cursor: "pointer" }}
                  onClick={seachList}
                >
                  Filter
                </div>
              </div>
              <div
                id="scrollableDiv"
                style={{
                  maxHeight: 550,
                  overflow: "auto",
                  padding: "0 16px",
                  border: "1px solid rgba(140, 140, 140, 0.35)",
                  background: "#fff",
                }}
              >
                {team ? (
                  <List
                    loading={loading}
                    dataSource={data}
                    renderItem={(item) => (
                      <List.Item key={item.teamId}>
                        <List.Item.Meta title={<a>{item.teamName}</a>} description={
                            <>
                              Skills:
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {item.teamSkills && item.teamSkills.map((skill, index) => (
                                  <Chip key={index} label={skill} variant="outlined" />
                                ))}
                              </Box>
                            </>
                          }/>
                      </List.Item>
                    )}
                  />
                ) : (
                  <List
                    loading={loading}
                    dataSource={data}
                    grid={{
                      gutter: 16,
                      column: 2,
                      xs: 1
                    }}
                    renderItem={(item) => (
                      <List.Item key={item.userId} style={{ marginTop: '16px' }}>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={item.avatarURL}
                              alt="avatar"
                            />}
                          title={<a>{item.userName}</a>}
                          description={
                            <>
                              Email: {item.email}
                              <br />
                              Skills:
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {item.userSkills && item.userSkills.map((skill, index) => (
                                  <Chip key={index} label={skill} variant="outlined" />
                                ))}
                              </Box>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
              {/* <Button type="primary" onClick={showModal}>
                Invite
              </Button> */}
              <InviteModel
                isModalOpen={isModalOpen}
                handleClose={handleClose}
              ></InviteModel>
              {/* <Modal
                title=""
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
              >
                <div className="seach">
                  <Input
                    ref={seachRef}
                    size="large"
                    placeholder="Seach"
                    prefix={<SearchOutlined />}
                  />
                  <div
                    style={{ marginLeft: '15px', cursor: 'pointer' }}
                    onClick={seachList}
                  >
                    Filter
                  </div>
                </div>
                <div
                  id="scrollableDiv"
                  style={{
                    maxHeight: 550,
                    overflow: 'auto',
                    padding: '0 16px',
                    border: '1px solid rgba(140, 140, 140, 0.35)',
                    background: '#fff',
                  }}
                >
                  <List
                    loading={loading}
                    dataSource={data}
                    renderItem={(item, index) => (
                      <List.Item
                        key={item.id}
                        actions={[
                          <Checkbox
                            checked={checkedList.includes(item.id)}
                            key={index}
                            onChange={(e) => handleCheckboxChange(item.id, e)}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          title={<a>{item.name}</a>}
                          description={item.email}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </Modal> */}
            </>
    </Container>
        </div>
      </div>
    </main>
  );
}
