import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, List, Input } from "antd";
import "../styles/teamTutor.css";
// import { useNavigate } from "react-router-dom";
import InviteModel from "../components/InviteModel";
import { apiCall } from "../helper";
import '../assets/scss/FullLayout.css';//make sure import this

import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { Container } from 'reactstrap';
import { Avatar, Chip, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export default function TeamTutor() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [team, setTeam] = useState(true);
  const [loading, setLoading] = useState(false);
  const mounting = useRef(true);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State to manage input value

  const seachRef = useRef();
  const mountedRef = useRef(false);
  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = "v1/team/get/list";
    const studentUrl = "v1/student/unassigned/list";
    const response = await apiCall("GET", team ? url : studentUrl);
    console.log("....list....", response);
    if (!response || response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = response;
      console.log("res", res);
      setData([...res]);
      setLoading(false);
      setAllData([...res]);
    }
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
        filtered = allData.filter((item) =>
          [item.teamName, item.teamSkills, String(item.teamId)].some((field) => {
            console.log("field", field);
            if (field) {
              if (Array.isArray(field)) {
                field = field.join(' ');
              }
              return field.toLowerCase().includes(searchTerm);
            }
          })
        );
      } else {
        filtered = allData.filter((item) =>
          [item.userName, item.email, String(item.userId)].some((field) => {
            if (field) {
              if (Array.isArray(field)) {
                field = field.join(' ');
              }
              return field.toLowerCase().includes(searchTerm);
            }
          })
        );
      }
      console.log(filtered);
      setData(filtered);
    } else {
      console.log(data);
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

  const navigateToUnallocatedTeams = () => {
    navigate("/team/unallocated"); // Replace with the actual path
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    loadMoreData();
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
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                  <Button
                    style={{ backgroundColor: "#6451e9", borderColor: "#6451e9" }}
                    type="primary"
                    shape="round"
                    onClick={navigateToUnallocatedTeams}
                  >
                    UNALLOCATED TEAMS
                  </Button>
                </Flex>
              </div>
              <div className="seach" style={{width:'600px'}}>
              <Input
                  value={searchTerm} // Bind input value to state
                  onChange={(e) => setSearchTerm(e.target.value)} // Update state on input change
                  placeholder={team ? "Search Team" : "Search Student"}
                  prefix={<SearchOutlined />}
                  style={{  marginRight: '10px' }}
                  ref={seachRef}
                  size="large"
                />
                <Button
                size="large"
                type="primary"
                onClick={seachList}
                style={{ marginRight: '10px' }}
              >
                Filter
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
              </div>
              <div
                id="scrollableDiv"
                style={{
                  maxHeight: 550,
                  // overflow: "auto",
                  padding: "0 16px",
                  width:"100%",
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
              <InviteModel
                isModalOpen={isModalOpen}
                handleClose={handleClose}
              ></InviteModel>
            </>
          </Container>
        </div>
      </div>
    </main>
  );
}
