import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  Collapse,
  Nav,
  NavItem,
  NavbarBrand,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
} from "reactstrap";
// import { ReactComponent as LogoWhite } from "../assets/images/logos/xtremelogowhite.svg";
import cap from "../assets/images/logos/cap_white.png";
// import user1 from "../assets/images/users/user1.jpg";
import { apiCall, fileToDataUrl } from '../helper';
import MessageAlert from '../components/MessageAlert';
import { Avatar } from '@mui/material';
import '../assets/scss/bell.css';

const roleMap = {
  1: 'Student',
  2: 'Tutor',
  3: 'Client',
  4: 'Coordinator',
  5: 'Administrator'
};

const roleColorMap = {
  1: { background: '#e0f7fa', color: '#006064' }, // blue Student
  2: { background: '#e1bee7', color: '#6a1b9a' }, // purple Tutor
  3: { background: '#fff9c4', color: '#f57f17' }, // yellow Client
  4: { background: '#ffe0b2', color: '#e65100' }, // orange Coordinator
  5: { background: '#ffcdd2', color: '#b71c1c' }  // red Administrator
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [userId, setUserId] = useState('');
  const [avatar, setAvatar] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [snackbarContent, setSnackbarContent] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  const role = localStorage.getItem('role')?localStorage.getItem('role'):1;
const handleAlertClose = () => {
    setAlertOpen(false);
  };

  const fetchUserData = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await apiCall('GET', `v1/user/profile/${userId}`, null, localStorage.getItem('token'), true);
      if (response) {
        const imagePath = response.avatarURL; 
        if (imagePath) {
          try {
            const imageResponse = await fetch(imagePath);
            if (!imageResponse.ok) {
              throw new Error('Failed to fetch image');
            }
            const imageBlob = await imageResponse.blob();
            const imageFile = new File([imageBlob], "avatar.png", { type: imageBlob.type });
            const imageDataUrl = await fileToDataUrl(imageFile);
            setAvatar(imageDataUrl);
          } catch (imageError) {
            console.error('Failed to fetch image:', imageError);
            setAvatar(null);
          }
        } else {
          setAvatar(null);
        }
      } else {
        setSnackbarContent('Failed to fetch user data 222');
        setAlertType('error');
        setAlertOpen(true);
      }

      const notifications = await apiCall('GET', `v1/notification/get/all/${userId}`);
      if(notifications){
        setNotificationCount(notifications.length);
      }
      else{
        setNotificationCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setSnackbarContent('Failed to fetch user data 1111');
      setAlertType('error');
      setAlertOpen(true);
    }
  };
  
  useEffect(() => {
    fetchUserData();
  }, []);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };
  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  const handleLogout = () => {
    localStorage.clear(); // clear localStorage
    window.location.href = '/login';
  };

  return (
    <Navbar color="primary" dark expand="md" className="bg-gradient">
      <div className="d-flex align-items-center">
        <NavbarBrand href="/" className="d-lg-none">
          {/* <LogoWhite /> */}
          <img src={cap} alt="small_logo" style={{ width: '30px', height: '30px' }}/>
        </NavbarBrand>
        <Button
          color="primary"
          className="d-lg-none"
          onClick={() => showMobilemenu()}
        >
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2 d-lg-none">
        <Button
          color="primary"
          size="sm"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen} className="justify-content-between">
        <Nav navbar>
          <NavItem>
            <Link to="/project/allproject" className="nav-link">
              All Project
            </Link>
          </NavItem>
          <NavItem>
            <Link
              to={parseInt(role) === 5 ? "/project/admin" : "/project/myproject"}
              className="nav-link"
            >
              My Project
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/about" className="nav-link">
              About
            </Link>
          </NavItem>
        </Nav>
        <Nav className="ml-auto d-flex align-items-center">
          <Link to="/notification" className="nav-link">
            <div className="notification">
              {notificationCount > 0 && (
                <div className="notification-count">{notificationCount}</div>
              )}
              <div className="bell-container">
                <div className="bell"></div>
              </div>
            </div>
          </Link>
        </Nav>
        <span className="list-item-meta-role" style={{ backgroundColor: roleColorMap[role].background, color: roleColorMap[role].color }}>
          {roleMap[role]}
        </span>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="transparent">
            <Avatar
                src={avatar}
                alt="Profile"
                sx={{ width: 30, height: 30 }}
            />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Info</DropdownItem>
            <DropdownItem
            href="/profile">
              Profile</DropdownItem>
            <DropdownItem divider />
            <DropdownItem
              href="/login"
              onClick={handleLogout}
            >
              Logout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Collapse>
      <MessageAlert
        open={alertOpen}
        alertType={alertType}
        handleClose={handleAlertClose}
        snackbarContent={snackbarContent}
      />
    </Navbar>
  );
};

export default Header;