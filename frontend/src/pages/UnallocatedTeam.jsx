import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import { Button, List, Input, Avatar, Flex } from 'antd';
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import '../assets/scss/FullLayout.css'; // Make sure to import this file
import { width } from '@mui/system';
import { apiCall } from '../helper'; // Make sure to import this file
import { Chip, Box } from '@mui/material';
import Typography from "@mui/material/Typography";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// show the unallocated team list for the staff
const FullLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);
  const [team, setTeam] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State to manage input value
  const [course, setCourse] = useState("");

  const loadMoreData = async (url = 'v1/team/get/unallocated/list') => {
    if (loading) return;
    setLoading(true);
    // const url = 'v1/team/get/unallocated/list';
    const response = await apiCall('GET', url, null, null, null);
    if (!response || response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = response;
      setData([...res]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      loadMoreData();
    }
  }, [mountedRef]);

  // load filtered list from backend
  const seachList = async () => {
    const searchTerm = seachRef.current.input.value.toLowerCase();
    if (searchTerm) {
      const url = 'v1/search/team/unallocated/list/detail'; 
      const requestBody = {
        searchList: searchTerm.split(' ')
      };
      if (loading) return;
      setLoading(true);
      const response = await apiCall('POST', url, requestBody);
      if (!response || response.error) {
        setData([]);
        setLoading(false);
      } else {
        const res = response;
        setData([...res]);
        setLoading(false);
      }

    } else {
      loadMoreData();
    }
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    loadMoreData();
  };
  
  const goback = () => {
    navigate(-1);
  };

  const getCouseChangeData = async (course) => {
    let fetcUrl = "";
    if (team) {
      fetcUrl = `v1/team/get/unallocated/list/${course}`;
      if (!course) {
        fetcUrl = `v1/team/get/unallocated/list`;
      }
    } else {
      fetcUrl = `v1/team/get/unallocated/list/${course}`;
      if (!course) {
        fetcUrl = `v1/team/get/unallocated/list`;
      }
    }
    const res = await apiCall("GET", fetcUrl);
    if (res) {
      setData(res);
    } else {
      setData([]);
    }
  }
  

  const changeSelectData = async (value)=>{
    setCourse(value)
    setSearchTerm("")
    await getCouseChangeData(value)
  }

  

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
          <Container className="p-4 wrapper" fluid style={{display:'flex',justifyContent:'center'}}>
            <>
            <div>
            <div className="seach" style={{width:'600px',flexDirection: 'column'}}>
            <div style={{width:'100%',marginBottom:'10px',color:"rgba(0,0,0,0.6)"}}> 
            <Typography
                      variant="h4"
                      gutterBottom
                      fontWeight={"bold"}
                      textAlign="left"
                    >
                      Unallocated Team List
                      {/* {team ? "TEAM LIST" : "STUDENT LIST"} */}
                    </Typography>
              </div>
            <div style={{width:'100%',marginBottom:'10px', display: 'flex',alignItems:"center"}}> 
                <FormControl fullWidth style={{ flexDirection: 'column', alignItems: 'top',width:'1675px'}}>
                  <InputLabel id="course-label">Course</InputLabel>
                  <Select
                    labelId="course-label"
                    id="course"
                    value={course}
                    label="Course"
                    onChange={e => changeSelectData(e.target.value)}
                  >
                    <MenuItem value="">Back</MenuItem>
                    <MenuItem value="COMP9900">COMP9900</MenuItem>
                    <MenuItem value="COMP3900">COMP3900</MenuItem>
                  </Select>
                </FormControl>
                <div className="titleBtn">
                <Flex gap="small" wrap>
                 
                  <Button
                    style={{ backgroundColor: "#6451e9", borderColor: "#6451e9" }}
                    type="primary"
                    shape="round"
                    onClick={goback}
                  >
                   BACK
                  </Button>
                </Flex>
              </div>
            </div>
            <div style={{display:'flex',alignItems: 'center',width:'600px'}}>

            <Input
                  value={searchTerm} // Bind input value to state
                  onChange={(e) => setSearchTerm(e.target.value)} // Update state on input change
                  placeholder="Search Unallocated Team"
                  prefix={<SearchOutlined />}
                  style={{ width: '100%', marginRight: '10px' }}
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
               
             
              </div>
              <div
                id="scrollableDiv"
                style={{
                  maxHeight: 550,
                  // overflow: "auto",
                  padding: "0 16px",
                  width:"600px",
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
                              <div>Course: {item.course}</div>
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
         

            </div>
         
             
            </>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
