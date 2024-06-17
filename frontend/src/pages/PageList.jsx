import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

const PageList = () => {
  const [token, setToken] = React.useState(null);
  return (
    <>
      <Routes>
          <Route path="/register" element={<Register token={token} setToken={setToken} />} />
          <Route path="/login" element={<Login token={token} setToken={setToken}/>} />
      </Routes>
      <br />
    </>
  );
}

export default PageList;
