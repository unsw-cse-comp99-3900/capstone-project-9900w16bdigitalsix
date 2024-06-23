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
import { ReactComponent as LogoWhite } from "../assets/images/logos/xtremelogowhite.svg";
import cap from "../assets/images/logos/cap_white.png";
import user1 from "../assets/images/users/user1.jpg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // 跟踪侧边栏是否展开

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };
  const showMobilemenu = () => {
    const sidebar = document.getElementById("sidebarArea");
    sidebar.classList.toggle("showSidebar");
    setSidebarOpen(!sidebar.classList.contains("showSidebar")); // 更新侧边栏状态
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarOpen(false); // 屏幕小于992px时侧边栏自动收起
      } else {
        setSidebarOpen(true); // 屏幕大于等于992px时侧边栏展开
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize(); // 初始调用一次检查屏幕大小

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const headerStyle = {
    position: "fixed",
    top: 0,
    left: sidebarOpen ? "250px" : "0", // 根据侧边栏状态调整left值
    width: sidebarOpen ? "calc(100% - 250px)" : "100%", // 根据侧边栏状态调整宽度
    zIndex: 1000,
    backgroundColor: "#007bff", // 确保背景颜色与Navbar一致
  };

  return (
    <Navbar color="primary" dark expand="md" className="bg-gradient" style={headerStyle}>
      <div className="d-flex align-items-center">
        <NavbarBrand href="/" className="d-lg-none">
          {/* <LogoWhite /> */}
          <img src={cap} alt="small_logo" style={{ width: '30px', height: '30px' }}/>
        </NavbarBrand>
        <Button
          color="primary"
          className=" d-lg-none"
          onClick={() => showMobilemenu()}
        >
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="primary"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
          <NavItem>
            <Link to="/project/allproject" className="nav-link">
              All Project
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/project/myproject" className="nav-link">
              My Project
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/about" className="nav-link">
              About
            </Link>
          </NavItem>
        </Nav>
        <Nav>
          <Link to="/notification" className="nav-link">
            <div className="notification-icon">
              <i className="bi bi-bell-fill"></i>
            </div>
          </Link>
        </Nav>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="transparent">
            <img
              src={user1}
              alt="profile"
              className="rounded-circle"
              width="30"
            ></img>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Info</DropdownItem>
            <DropdownItem
            href="/profile">
              Profile</DropdownItem>
            <DropdownItem divider />
            <DropdownItem
            href="/login">
              Logout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Collapse>
    </Navbar>
  );
};

export default Header;