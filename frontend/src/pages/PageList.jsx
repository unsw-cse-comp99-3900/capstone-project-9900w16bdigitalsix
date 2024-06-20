import React from 'react';
import { Routes, Route } from 'react-router-dom';
// auth
import Login from './Login';
import Register from './Register';
import Verify from './VerifyLinkSent';
import ResetPwdLinkSent from './ResetPwdLinkSent';
import ForgetPwd from './ForgetPwd';

import Dashboard from '../layouts/FullLayout';

const PageList = () => {
  const [token, setToken] = React.useState(null);
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register token={token} setToken={setToken} />} />
        <Route path="/login" element={<Login token={token} setToken={setToken}/>} />
        <Route path="/verify-email-link-sent" element={<Verify token={token} setToken={setToken}/>} />
        <Route path="/reset-pwd-link-sent" element={<ResetPwdLinkSent token={token} setToken={setToken}/>} />
        <Route path="/forget-pwd" element={<ForgetPwd />} />
      </Routes>
      <br />
    </>
  );
}

export default PageList;