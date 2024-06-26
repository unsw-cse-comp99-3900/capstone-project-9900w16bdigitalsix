import { Button, Nav, NavItem } from "reactstrap";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  {
    title: "Project",
    href: "/project",//need to be implented
    icon: "bi bi-clipboard2-data",
  },
  {
    title: "Notification",
    href: "/notification",//need to be implented
    icon: "bi bi-bell",
  },
  {
    title: "Team",
    href: "/team",//need to be implented
    icon: "bi bi-people",
  },
  {
    title: "Message",
    href: "/message",//need to be implented
    icon: "bi bi-chat-square-dots",
  },
  {
    title: "Profile",
    href: "/profile",//need to be implented
    icon: "bi bi-person-circle",
  },
  {
    title: "Role",
    href: "/admin/role-manage",//need to be implented
    icon: "bi bi-person-check",
  },
];

const Sidebar = () => {
  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };
  let location = useLocation();

  const handleLogout = () => {
    localStorage.clear(); // clear localStorage
    window.location.href = '/login';
  };

  const currentPath = location.pathname.split('/')[1];
  const sidebarStyle = {
    position: "fixed",
    top: "56px", 
    bottom: 0,
    width: "250px",
    // height: "calc(100vh - 56px)", 
    overflowY: "auto", 
  };

  return (
    <div className="p-3" style={sidebarStyle}>
      <div className="d-flex align-items-center">
        <Logo />
        <span className="ms-auto d-lg-none">
          <Button
            close
            size="sm"
            className="ms-auto d-lg-none"
            onClick={() => showMobilemenu()}
          >
            {/* &times; */}
          </Button>
        </span>
      </div>
      <div className="pt-4 mt-2">
        <Nav vertical className="sidebarNav">
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              <Link
                to={navi.href}
                className={
                  currentPath === navi.href.split('/')[1]
                    ? "text-primary nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
              >
                <i className={navi.icon}></i>
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </Link>
            </NavItem>
          ))}
          <Button
            color="danger"
            tag="a"
            target="_blank"
            className="mt-3"
            href="/login"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;