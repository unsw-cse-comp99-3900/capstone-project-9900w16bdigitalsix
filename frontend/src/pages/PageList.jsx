import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "../layouts/FullLayout";
import Team from "./Team";
import Verify from "./VerifyLinkSent";
import ResetPwdLinkSent from "./ResetPwdLinkSent";
import ForgetPwd from "./ForgetPwd";
import ResetPwd from "./ResetPwd";
import VerifyEmail from "./VerifyEmail.jsx";

const PageList = () => {
  const [token, setToken] = React.useState(null);
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/register"
          element={<Register token={token} setToken={setToken} />}
        />
        <Route
          path="/login"
          element={<Login token={token} setToken={setToken} />}
        />
        <Route
          path="/verify-email-link-sent"
          element={<Verify token={token} setToken={setToken} />}
        />
        <Route path="/verify-email-check" element={<VerifyEmail />} />
        <Route
          path="/reset-pwd-link-sent"
          element={<ResetPwdLinkSent token={token} setToken={setToken} />}
        />
        <Route path="/forget-pwd" element={<ForgetPwd />} />
        <Route path="/reset-pwd" element={<ResetPwd />} />
        <Route
          path="/team"
          element={<Team token={token} setToken={setToken} />}
        />
      </Routes>
      <br />
    </>
  );
};

export default PageList;
