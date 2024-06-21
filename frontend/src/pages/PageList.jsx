import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ProjectList from '../layouts/ProjectList';
import CreateProject from '../layouts/CreateProject';
import Dashboard from '../layouts/FullLayout';

const PageList = () => {
  const [token, setToken] = React.useState(null);
  return (
    <>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path='/project/myproject' element={<ProjectList token={token} setToken={setToken}/>}/>
        <Route path='project/create' element={<CreateProject token={token} setToken={setToken}/>}/>
        <Route path="/register" element={<Register token={token} setToken={setToken} />} />
        <Route path="/login" element={<Login token={token} setToken={setToken}/>} />
      </Routes>
      <br />
    </>
  );
}

export default PageList;