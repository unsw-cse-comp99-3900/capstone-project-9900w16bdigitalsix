import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from '../layouts/FullLayout';
import Team from './Team'

const PageList = () => {
  const [token, setToken] = React.useState(null);
  return (
    <>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path="/register" element={<Register token={token} setToken={setToken} />} />
        <Route path="/login" element={<Login token={token} setToken={setToken} />} />
        <Route path="/team" element={<Team token={token} setToken={setToken}/>} />
      </Routes>
      <br />
    </>
  );
}

export default PageList;