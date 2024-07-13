import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container, Card, CardBody, CardTitle, CardText, Row, Col } from "reactstrap";
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useNavigate, useParams } from 'react-router-dom';

import '../assets/scss/FullLayout.css'; // Make sure to import this
import '../assets/scss/reportStyle.css';
import { apiCall } from "../helper";

const GenerateProgressReport = () => {
  const [showCharts, setShowCharts] = useState(false);
  // get localstorage
  const token = localStorage.getItem('token');
  //get userId, teamId from router
  const { projectId, teamId } = useParams();
  // project basic informations
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [tutorName, setTutorName] = useState("");
  const [tutorEmail, setTutorEmail] = useState("");
  const [coorName, setCoorName] = useState("");
  const [coorEmail, setCoorEmail] = useState("");
  const [field, setField] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [description, setDiscription] = useState("");
  const [specLink, setSpecLink] = useState("");
  const [sprints, setSprints] = useState([]);

  // this function is used to fetch a specific project detail
  const getProjectDetail = async () => {
    try {
      const res = await apiCall("GET", `v1/project/detail/${projectId}`);
      console.log(res);
      if (res === null) {
        return;
      }
      if (res.error) {
        return;
      } else {
        setTitle(res.title);
        setClientName(res.clientName);
        setClientEmail(res.clientEmail);
        setTutorName(res.tutorName);
        setTutorEmail(res.tutorEmail);
        setCoorName(res.coorName);
        setCoorEmail(res.coorEmail);
        setField(res.field);
        setRequiredSkills(res.requiredSkills);
        setDiscription(res.description);
        setSpecLink(res.specLink);
      }
    } catch (error) {
      return;
    }
  };

  const getProgresstDetail = async () => {
    try {
      const data = await apiCall('GET', `v1/progress/get/detail/${teamId}`);
      setSprints(data.sprints);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // form for userstory status
  const userstoryStatus = (status) => {
    switch (status) {
      case 1: return "Todo";
      case 2: return "In Progress";
      case 3: return "Done";
    }
  };

  // caculate average sprint score
  const calculateAverageScore = () => {
    const totalScore = sprints.reduce((total, current) => total + current.sprintGrade, 0);
    return sprints.length ? (totalScore / sprints.length).toFixed(2) : 0;
  };

  // caculate total days
  const getTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end - start) / (1000 * 60 * 60 * 24);
  };

  // caculate total days of all sprints
  const calculateTotalProjectDays = () => {
    return sprints.reduce((total, sprint) => {
      if (sprint.startDate && sprint.endDate) {
        return total + getTotalDays(sprint.startDate, sprint.endDate);
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    getProjectDetail();
    getProgresstDetail();
    const timer = setTimeout(() => setShowCharts(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sample datas
  const sprintData = {
    labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
    datasets: [
      {
        label: 'Completed User Stories',
        data: [8, 9, 9, 5],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Incomplete User Stories',
        data: [2, 3, 1, 4],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // New options to display percentage inside bars
  const options = {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: 'white',
        formatter: (value, context) => {
          const total = context.chart.data.datasets
            .map(dataset => dataset.data[context.dataIndex])
            .reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return `${value} (${percentage}%)`;
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of User Stories',
        },
      },
    },
  };
  const sprintDetailsData = {
    labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
    datasets: [
      {
        label: 'Sprint Scores',
        data: [20, 15, 25, 10],
        borderColor: 'rgba(153, 102, 255, 0.6)',
        fill: false,
      },
      {
        label: 'Average Score',
        data: [17.5, 17.5, 17.5, 17.5],
        borderColor: 'rgba(255, 159, 64, 0.6)',
        borderDash: [10, 5],
        fill: false,
      },
    ],
  };
  
  // Updated options to include average line
  const sprintOptions = {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: 'black',
        formatter: (value, context) => {
          return value;
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Sprints',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Scores',
        },
      },
    },
  };

  // Sample data for pie chart
const pieData = {
  labels: ['Completed', 'Remaining'],
  datasets: [
    {
      data: [70, 30],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
    },
  ],
};

// Options to display percentage inside pie chart
const pieOptions = {
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: true,
      color: 'white',
      formatter: (value, context) => {
        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(2);
        return percentage + '%';
      },
    },
  },
};

  // Sample data for time tracking
  const timeTrackingData = {
    labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
    datasets: [
      {
        label: 'Planned Hours',
        data: [100, 120, 110, 130],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
      {
        label: 'Actual Hours',
        data: [90, 130, 115, 125],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
      },
    ],
  };

  // Options for the time tracking chart
  const timeTrackingOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Sprints',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Hours',
        },
      },
    },
    plugins: {
      datalabels: {
        display: true,
        color: 'black',
        formatter: (value) => {
          return value + 'h';
        },
      },
    },
  };

  // Sample data for time tracking pie chart
  const timePieData = {
    labels: ['Completed on Time', 'Overtime'],
    datasets: [
      {
        data: [75, 25], // example values
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      },
    ],
  };

  // Options to display percentage inside pie chart
  const timePieOptions = {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: 'white',
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return percentage + '%';
        },
      },
    },
  };


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
            <Row>
              <Col lg="6" className="mb-4">
                <Card>
                  <CardBody>
                    <CardTitle tag="h5">Project Progress Chart</CardTitle>
                    {showCharts && (
                      <>
                        <div className="chart-container mb-4">
                          <Bar data={sprintData} options={options} plugins={[ChartDataLabels]} />
                        </div>
                        <div className="chart-container mb-4">
                          <Pie data={pieData} options={pieOptions} plugins={[ChartDataLabels]} />
                        </div>

                        <div className="chart-container mb-4">
                          <Line data={sprintDetailsData} options={sprintOptions} />
                        </div>
                        

                      </>
                    )}
                  </CardBody>
                </Card>
              </Col>

              <Col lg="6" className="mb-4">
                <Card>
                  <CardBody>
                  <CardTitle tag="h5">Time Tracking Chart</CardTitle>
                  <div className="chart-container mb-4">
                    <Line data={timeTrackingData} options={timeTrackingOptions} plugins={[ChartDataLabels]} />
                  </div>
                  <div className="chart-container mb-4">
                    <Pie data={timePieData} options={timePieOptions} plugins={[ChartDataLabels]} />
                  </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col lg="12" className="mb-4">
                <Card>
                  <CardBody>
                    <CardTitle tag="h5"><strong>Project Details</strong></CardTitle>
                    <CardText>
                      <Row>
                        <Col md="6">
                        <CardTitle tag="h5">Project Overview</CardTitle>
                        <CardText style = {{textAlign: 'justify'}}>
                          <strong>Project Name:</strong> {title}<br />
                          <strong>Field:</strong> {field}<br />
                          <strong>Description:</strong> {description}<br />
                          <strong>Required Skills:</strong> {requiredSkills.join(', ')}<br />
                          Client: {clientName} - <span class="light-text">{clientEmail}</span><br />
                          Tutor: {tutorName} - <span class="light-text">{tutorEmail}</span><br />
                          Coordinator: {coorName} - <span class="light-text">{coorEmail}</span><br />
                          <a href={specLink} target="_blank" rel="noopener noreferrer">Click here to view project specification document</a>
                        </CardText>
                        </Col>
                        <Col md="6">
                          <CardTitle tag="h5">Sprint Details and User Stories:</CardTitle>
                          <ul>
                            {sprints.map((sprint, index) => (
                              <li key={index} style = {{textAlign: 'justify'}}>
                                Sprint {sprint.sprintNum}: {sprint.startDate && sprint.endDate ? `${sprint.startDate} - ${sprint.endDate}` : '(Date to be determined)'},
                                <ul>
                                  {sprint.userStoryList.map((story) => (
                                    <li key={story.userStoryId}>
                                      User Story {story.userStoryId}: {story.userStoryDescription}<br />
                                      Status: {userstoryStatus(story.userStoryStatus)}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                        <CardTitle tag="h5">Time Tracking</CardTitle>
                        <ul>
                          {sprints.map((sprint, index) => (
                            <li key={index}>
                              Sprint {sprint.sprintNum}: {sprint.startDate && sprint.endDate ? `${sprint.startDate} - ${sprint.endDate}` : '(Date to be determined)'},
                            </li>
                          ))}
                        </ul>
                      <ul>
                        <li>Sprint 1: Completion Time - xx%, Overtime - xx%</li>
                        <li>Sprint 2: Completion Time - xx%, Overtime - xx%</li>
                        <li>Sprint 3: Completion Time - xx%, Overtime - xx%</li>
                        <li>Sprint 4: Completion Time - xx%, Overtime - xx%</li>
                      </ul>
                        </Col>
                        <Col md="6">
                          <CardTitle tag="h5">Performance Metrics</CardTitle>
                          <strong>Sprint Scores:</strong>
                          <ul>
                            {sprints.map((sprint, index) => (
                              <li key={index}>
                                Sprint {sprint.sprintNum}: Score - {sprint.sprintGrade}
                              </li>
                            ))}
                          </ul>
                          <strong>Sprint Comments:</strong>
                          <ul>
                            {sprints.map((sprint, index) => (
                              <li key={index}>
                                Sprint {sprint.sprintNum}: {sprint.sprintComment}
                              </li>
                            ))}
                          </ul>
                          <strong>Average Sprint Score:</strong> {calculateAverageScore()}
                        </Col>
                      </Row>
                    </CardText>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </main>
  );
};

export default GenerateProgressReport;
