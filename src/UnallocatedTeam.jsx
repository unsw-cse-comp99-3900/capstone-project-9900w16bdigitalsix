import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { SearchOutlined } from '@ant-design/icons';
import { Button, List, Input, Avatar } from 'antd';
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import '../assets/scss/FullLayout.css'; // Make sure to import this file
import { width } from '@mui/system';
import { apiCall } from '../helper'; // Make sure to import this file


const FullLayout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);

  const loadMoreData = async (url = 'v1/team/get/unallocated/list') => {
    if (loading) return;
    setLoading(true);
    // const url = 'v1/team/get/unallocated/list';
    const response = await apiCall('GET', url, null, null, null);
    console.log('....list....', response);
    if (!response || response.error) {
      setData([]);
      setLoading(false);
    } else {
      const res = response;
      console.log("res", res);
      setData([...res]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log('...token..');
      loadMoreData();
    }
  }, [mountedRef]);

  const seachList = async () => {
    const searchTerm = seachRef.current.input.value.toLowerCase();
    console.log(searchTerm);
    if (searchTerm) {
      const url = 'v1/search/team/unallocated/list/detail'; 
      const requestBody = {
        searchList: searchTerm.split(' ')
      };
      if (loading) return;
      setLoading(true);
      const response = await apiCall('POST', url, requestBody);
      console.log('....list....', response);
      if (!response || response.error) {
        setData([]);
        setLoading(false);
      } else {
        const res = response;
        console.log("res", res);
        setData([...res]);
        setLoading(false);
      }
      // fetch(url, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(requestBody),
      // })
      // .then(data => {
      //   console.log(data);
      // })
      // .catch(error => {
      //   console.error('Error:', error);
      // });
    } else {
      console.log(888);
      loadMoreData();
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
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            {/* Component content start */}
            <>
            <div className="seach" style={{width: '100%', display: 'flex', justifyContent: 'flex-start'}}>
              <div style={{width: '88%'}}>
              <Input
                ref={seachRef}
                size="large"
                placeholder="Seach Team"
                prefix={<SearchOutlined />}
              />
              </div>
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
                width: '88%',
                border: '1px solid rgba(140, 140, 140, 0.35)',
                background: '#fff',
              }}
            >
              <List
                loading={loading}
                dataSource={data}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={<a>{item.teamName}</a>}
                      description={
                        <>
                          <div className="skills-container" style={{marginLeft: '0'}}>
                            {Array.isArray(item.teamSkills) && item.teamSkills.map(skill => (
                              <span key={skill} className="skill-badge">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
            </>
            {/* End of component content */}
          </Container>
        </div>
      </div>
    </main>
  );
};

export default FullLayout;
