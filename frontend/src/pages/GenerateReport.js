import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import Header from "../layouts/Header";
import { Container, Card, CardBody, CardTitle, CardText, Row, Col } from "reactstrap";
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import '../assets/scss/FullLayout.css'; // Make sure to import this
import '../assets/scss/reportStyle.css';
import capstoneIcon from '../assets/images/logos/cap.png';

const GenerateReport = () => {
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCharts(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sample data
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

  const reportInfo = {
    projectName: "Manhattan Project",
    reportDate: "1954-8-27",
    client: "Government of United State of America",
    tutor: "Major General Leslie Groves",
    coordinator: "J. Robert Oppenheimer",
    teamMembers: "Enrico Fermi, Richard Feynman, Niels Bohr, James Chadwick, Ernest Lawrence, Hans Bethe",
    field: "Nuclear Physics",
    description: "The project aimed to develop the first nuclear weapons during World War II.",
    skills: "Physics, Chemistry, Mathematics, Engineering, Security Protocols"
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
                          <CardText><strong>Field:</strong> {reportInfo.field}</CardText>
                          <CardText><strong>Description:</strong> {reportInfo.description}</CardText>
                          <CardText><strong>Required Skills:</strong> {reportInfo.skills}</CardText>
                        </Col>
                        <Col md="6">
                          <CardTitle tag="h5">Sprint Details and User Stories:</CardTitle>
                          <ul>
                            <li>Sprint 1: Start Date - End Date, Score: 20, User Stories: todo, inprogress, done</li>
                            <li>Sprint 2: Start Date - End Date, Score: 15, User Stories: todo, inprogress, done</li>
                            <li>Sprint 3: Start Date - End Date, Score: 25, User Stories: todo, inprogress, done</li>
                            <li>Sprint 4: Start Date - End Date, Score: 10, User Stories: todo, inprogress, done</li>
                          </ul>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                        <CardTitle tag="h5">Time Tracking</CardTitle>
                        <strong>Actual vs Planned Hours:</strong>
                      <ul>
                        <li>Sprint 1: Completion Time - xx%, Overtime - xx%</li>
                        <li>Sprint 2: Completion Time - xx%, Overtime - xx%</li>
                        <li>Sprint 3: Completion Time - xx%, Overtime - xx%</li>
                        <li>Sprint 4: Completion Time - xx%, Overtime - xx%</li>
                      </ul>
                        </Col>
                        <Col md="6">
                          
                          <strong>Performance Metrics: Sprint Scores:</strong>
                          <ul>
                            <li>Sprint 1: Score - 20</li>
                            <li>Sprint 2: Score - 15</li>
                            <li>Sprint 3: Score - 25</li>
                            <li>Sprint 4: Score - 10</li>
                          </ul>
                          <strong>Sprint Comments:</strong>
                          <ul>
                            <li>Sprint 1: Excellent progress.</li>
                            <li>Sprint 2: Needs improvement.</li>
                            <li>Sprint 3: Outstanding work.</li>
                            <li>Sprint 4: Below expectations.</li>
                          </ul>
                          <strong>Average Sprint Score:</strong> 17.5
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

export default GenerateReport;
