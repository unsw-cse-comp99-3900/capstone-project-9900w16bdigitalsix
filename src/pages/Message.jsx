import React from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBTypography,
  MDBInputGroup,
} from "mdb-react-ui-kit";

import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container } from "reactstrap";
import '../assets/scss/FullLayout.css';//make sure import this

const Message = () => {
  return (
    <main>
      <div className="pageWrapper d-lg-flex">
        {/********Sidebar**********/}
        <aside className="sidebarArea shadow" id="sidebarArea">
          <Sidebar />
        </aside>
        {/********Content Area**********/}
        <div className="contentArea">
          <div className="d-lg-none headerMd">
            {/********Header**********/}
            <Header />
          </div>
          <div className="d-none d-lg-block headerLg">
            {/********Header**********/}
            <Header />
          </div>
          {/********Middle Content**********/}
          <Container className="p-4 wrapper" fluid>
            {/* add code here */}
            <MDBContainer fluid className="py-5" style={{ backgroundColor: "#CDC4F9" }}>
                <MDBRow>
                    <MDBCol md="12">
                    <MDBCard id="chat3" style={{ borderRadius: "15px" }}>
                        <MDBCardBody>
                        <MDBRow>
                            <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
                            <div className="p-3">
                                <MDBInputGroup className="rounded mb-3">
                                <input
                                    className="form-control rounded"
                                    placeholder="Search"
                                    type="search"
                                />
                                <span
                                    className="input-group-text border-0"
                                    id="search-addon"
                                >
                                    <MDBIcon fas icon="search" />
                                </span>
                                </MDBInputGroup>

                                <div
                                style={{ position: "relative", height: "400px", overflowY: "auto" }}
                                >
                                <MDBTypography listUnStyled className="mb-0">
                                    <li className="p-2 border-bottom">
                                    <a
                                        href="#!"
                                        className="d-flex justify-content-between"
                                    >
                                        <div className="d-flex flex-row">
                                        <div>
                                            <img
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                                            alt="avatar"
                                            className="d-flex align-self-center me-3"
                                            width="60"
                                            />
                                            <span className="badge bg-success badge-dot"></span>
                                        </div>
                                        <div className="pt-1">
                                            <p className="fw-bold mb-0">Marie Horwitz</p>
                                            <p className="small text-muted">
                                            Hello, Are you there?
                                            </p>
                                        </div>
                                        </div>
                                        <div className="pt-1">
                                        <p className="small text-muted mb-1">Just now</p>
                                        <span className="badge bg-danger rounded-pill float-end">
                                            3
                                        </span>
                                        </div>
                                    </a>
                                    </li>
                                    {/* Repeat similar structure for other list items */}
                                </MDBTypography>
                                </div>
                            </div>
                            </MDBCol>
                            <MDBCol md="6" lg="7" xl="8">
                            <div
                                style={{ position: "relative", height: "400px", overflowY: "auto" }}
                                className="pt-3 pe-3"
                            >
                                <div className="d-flex flex-row justify-content-start">
                                <img
                                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                    alt="avatar 1"
                                    style={{ width: "45px", height: "100%" }}
                                />
                                <div>
                                    <p
                                    className="small p-2 ms-3 mb-1 rounded-3"
                                    style={{ backgroundColor: "#f5f6f7" }}
                                    >
                                    Lorem ipsum dolor sit amet, consectetur adipiscing
                                    elit, sed do eiusmod tempor incididunt ut labore et
                                    dolore magna aliqua.
                                    </p>
                                    <p className="small ms-3 mb-3 rounded-3 text-muted float-end">
                                    12:00 PM | Aug 13
                                    </p>
                                </div>
                                </div>
                                {/* Repeat similar structure for other messages */}
                            </div>
                            <div className="text-muted d-flex justify-content-start align-items-center pe-3 pt-3 mt-2">
                                <img
                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                                alt="avatar 3"
                                style={{ width: "40px", height: "100%" }}
                                />
                                <input
                                type="text"
                                className="form-control form-control-lg"
                                id="exampleFormControlInput2"
                                placeholder="Type message"
                                />
                                <a className="ms-1 text-muted" href="#!">
                                <MDBIcon fas icon="paperclip" />
                                </a>
                                <a className="ms-3 text-muted" href="#!">
                                <MDBIcon fas icon="smile" />
                                </a>
                                <a className="ms-3" href="#!">
                                <MDBIcon fas icon="paper-plane" />
                                </a>
                            </div>
                            </MDBCol>
                        </MDBRow>
                        </MDBCardBody>
                    </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default Message;
