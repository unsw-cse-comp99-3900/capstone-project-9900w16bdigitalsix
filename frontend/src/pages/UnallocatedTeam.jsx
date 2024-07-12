import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
// import { apiCall } from '../../helper';
export default function Notification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  let [data, setData] = useState([]);
  const seachRef = useRef();
  const mountedRef = useRef(false);
  const loadMoreData = async () => {
    if (loading) return;
    setLoading(true);
    const url = 'v1/team/get/list';
    const params = {
      name: 1,
    };
    if (seachRef.current.input.value)
      params.name = seachRef.current.input.value;
    // const response = await apiCall(
    //   'GET',
    //   team ? url : studentUrl,
    //   null,
    //   null,
    //   null,
    //   params
    // );
    // console.log('....list....', response);
    // if (response.error) {
    //   setData([]);
    //   setLoading(false);
    // } else {
    //   const res = response;
    //   console.log(res);
    //   setData([...res]);
    //   setLoading(false);
    // }
    axios
      .get('http://110.141.48.210:3000/mock/13/v1/team/profile/:userId', {
        params,
      })
      .then((response) => {
        const res = response.data;
        console.log(res);
        setData([...res]);
        setLoading(false);
      })
      .catch((error) => {
        setData([]);
        setLoading(false);
        console.error('Error fetching data:', error);
      });
  };
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      console.log('...token..');
      // if (!localStorage.getItem('token')) {
      //   navigate('/login');
      //   return;
      // }
      loadMoreData();
    }
  }, [mountedRef]);
  const seachList = () => {
    // const searchTerm = seachRef.current.input.value.toLowerCase();
    // console.log(searchTerm);
    // if (searchTerm) {
    //   let filtered;
    //   if (team) {
    //     filtered = data.filter((item) =>
    //       [item.userName, String(item.userId)].some((field) =>
    //         field.toLowerCase().includes(searchTerm)
    //       )
    //     );
    //   } else {
    //     filtered = data.filter((item) =>
    //       [
    //         item.userName,
    //         item.email,
    //         String(item.userId),
    //         item.userSkills,
    //       ].some(
    //         (field) => {
    //           if (field) {
    //             return field.toLowerCase().includes(searchTerm);
    //           }
    //         }
    //       )
    //     )
    //   }
    //   setData(filtered);
    // } else {
    //   loadMoreData();
    // }
  };
  return (
    <>
      <div className="seach">
        <Input
          ref={seachRef}
          size="large"
          placeholder="Seach Team"
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
          renderItem={(item) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={'https://randomuser.me/api/portraits/women/28.jpg'}
                  />
                }
                title={<a>{item.userName}</a>}
                description={item.email}
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
}
