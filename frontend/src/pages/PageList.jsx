import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../layouts/FullLayout";

// auth
import Login from "./Login";
import Register from "./Register";
import Verify from "./VerifyLinkSent";
import ResetPwdLinkSent from "./ResetPwdLinkSent";
import ForgetPwd from "./ForgetPwd";
import ResetPwd from "./ResetPwd";
import VerifyEmail from "./VerifyEmail";
import Profile from "./Profile";

// team
import TeamRouter from "./TeamRouter";
import Team from "./Team";
import TeamTutor from "./TeamTutor";
import StudentTeamPreference from "./StudentTeamPreference";

// project
import ProjectList from "./ProjectList";
import CreateProject from "./CreateProject";
import EditProject from "./EditProject";
import ProjectProgress from "./ProjectProgress";
import ProjectDetails from "./ProjectDetails";
import AllProject from "./AllProject"

//admin
import RoleManage from "./RoleManage";
import ProjectAdmin from "./ProjectAdmin";
import ProjectAdminAssign from "./ProjectAdminAssign";

// notification
import Notification from "./Notification";

// test
import TestProjectDetail from "./TestProjectDetail";

// report
import GenerateProgressReport from "./GenerateProgressReport";

const PageList = () => {
  const [token, setToken] = React.useState(null);
  const [role, setRole] = React.useState(null);
  
  const userId = localStorage.getItem("userId");
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* auth */}
        <Route
          path="/register"
          element={<Register token={token} setToken={setToken} />}
        />
        <Route
          path="/login"
          element={
            <Login
              token={token}
              setToken={setToken}
              role={role}
              setRole={setRole}
            />
          }
        />
        <Route
          path="/verify-email-link-sent"
          element={<Verify token={token} setToken={setToken} />}
        />
        <Route path="/verify-email-check" element={<VerifyEmail />} />
        <Route path="/forget-pwd" element={<ForgetPwd />} />
        <Route
          path="/reset-pwd-link-sent"
          element={<ResetPwdLinkSent token={token} setToken={setToken} />}
        />
        <Route path="/reset-pwd" element={<ResetPwd />} />
        <Route path="/profile" element={<Profile />} />

        {/* team */}
        <Route
          path="/team"
          element={<TeamRouter token={token} setToken={setToken} />}
        />
        <Route
          path="/team/student"
          element={<Team token={token} setToken={setToken} />}
        />
        <Route
          path="/team/tutor"
          element={<TeamTutor token={token} setToken={setToken} />}
        />
        <Route
          path="/team/unallocated"
          element={<StudentTeamPreference token={token} setToken={setToken} />}
        />

        {/* project */}
        <Route
          path="/project/myproject"
          element={<ProjectList token={token} setToken={setToken} />}
        />
        <Route
          path="project/create"
          element={<CreateProject token={token} setToken={setToken} />}
        />
        <Route
          path="/project/edit/:id"
          element={<EditProject token={token} setToken={setToken} />}
        />
        <Route
          path="/project/progress/:projectId/:teamId"
          element={<ProjectProgress token={token} setToken={setToken} />}
        />
        <Route
          path="/project/admin"
          element={<ProjectAdmin token={token} setToken={setToken} />}
        />
        <Route
          path="/project/admin/:projectId"
          element={<ProjectAdminAssign token={token} setToken={setToken} />}
        />
        <Route
          path="/project/details/:projectId"
          element={<ProjectDetails token={token} setToken={setToken} />}
        />
        <Route path="/project/allproject" element={<AllProject token={token} setToken={setToken}/>}/>
        <Route
          path="/project/preference"
          element={<StudentTeamPreference token={token} setToken={setToken} />}
        />

        {/* admin */}
        <Route
          path="/admin/role-manage"
          element={<RoleManage token={token} setToken={setToken} />}
        />

        {/* notification */}
        <Route
          path="/notification"
          element={<Notification token={token} setToken={setToken} />}
        />

        {/* test */}
        <Route
          path="/testProjectDetail"
          element={<TestProjectDetail token={token} setToken={setToken} />}
        />

        {/* generate report */}
        <Route
          path="/project/report/:projectId/:teamId"
          element={<GenerateProgressReport token={token} setToken={setToken} />}
        />
      </Routes>
      <br />
    </>
  );
};

export default PageList;
