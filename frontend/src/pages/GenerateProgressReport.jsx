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
  let globalUserStoryIndex = 1;
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
  // data initialliate for sprint data(into two groups) to chart
  const [sprintData, setSprintData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Completed User Stories',
        data: [], 
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Incomplete User Stories',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  });
  // initiate data for pie chart
  const [pieData, setPieData] = useState({
    labels: ['Completed User Stories', 'Remaining User Stories'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      },
    ],
  });
  const [sprintDetailsData, setSprintDetailsData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sprint Scores',
        data: [],
        borderColor: 'rgba(153, 102, 255, 0.6)',
        fill: false,
      },
      {
        label: 'Average Score',
        data: [],
        borderColor: 'rgba(255, 159, 64, 0.6)',
        borderDash: [10, 5],
        fill: false,
      },
    ],
  });

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
      console.log("sprint data:", data.sprints);
      updateChartData(data.sprints);
      updatePieChartData(data.sprints);
      updateLineChartData(data.sprints);
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
  const totalProjectDays = calculateTotalProjectDays();

  useEffect(() => {
    getProjectDetail();
    getProgresstDetail();
    const timer = setTimeout(() => setShowCharts(true), 1000);
    return () => clearTimeout(timer);
  }, []);


  // functions to load data to charts
  const updateChartData = (sprints) => {
    const labels = sprints.map(sprint => `Sprint ${sprint.sprintNum}`);
    const completedData = sprints.map(sprint => sprint.userStoryList.filter(story => story.userStoryStatus === 3).length);
    const incompleteData = sprints.map(sprint => sprint.userStoryList.filter(story => story.userStoryStatus !== 3).length);
  
    setSprintData({
      labels,
      datasets: [
        {
          label: 'Completed User Stories',
          data: completedData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Incomplete User Stories',
          data: incompleteData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ]
    });
  };
  const updatePieChartData = (sprints) => {
    let completedCount = 0;
    let remainingCount = 0;
  
    sprints.forEach(sprint => {
      sprint.userStoryList.forEach(story => {
        if (story.userStoryStatus === 3) {
          completedCount += 1;
        } else {
          remainingCount += 1;
        }
      });
    });
    setPieData({
      labels: ['Completed User Stories', 'Remaining User Stories'],
      datasets: [
        {
          data: [completedCount, remainingCount],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        },
      ],
    });
  };
  const updateLineChartData = (sprints) => {
    const labels = sprints.map(sprint => `Sprint ${sprint.sprintNum}`);
    const sprintScores = sprints.map(sprint => sprint.sprintGrade);
    const averageScore = sprintScores.reduce((sum, current) => sum + current, 0) / sprints.length;
  
    setSprintDetailsData({
      labels,
      datasets: [
        {
          label: 'Sprint Scores',
          data: sprintScores,
          borderColor: 'rgba(153, 102, 255, 0.6)',
          fill: false,
        },
        {
          label: 'Average Score',
          data: Array(sprints.length).fill(averageScore),
          borderColor: 'rgba(255, 159, 64, 0.6)',
          borderDash: [10, 5],
          fill: false,
        },
      ],
    });
  };
  

  // New options to display percentage inside bars
  const options = {
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: 'white',
        formatter: (value, context) => {
          if (value === 0) return null;
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

  // Data for charts
  const timepieData = {
    labels: sprints.map(sprint => `Sprint ${sprint.sprintNum}`),
    datasets: [{
      label: 'Days per Sprint',
      data: sprints.map(sprint => sprint.startDate && sprint.endDate ? getTotalDays(sprint.startDate, sprint.endDate) : 0),
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(52, 152, 219, 0.6)',
        'rgba(26, 188, 156, 0.6)',
        'rgba(231, 76, 60, 0.6)',
        'rgba(243, 156, 18, 0.6)'
      ],
      }],
  };

  const timebarData = {
    labels: sprints.map(sprint => `Sprint ${sprint.sprintNum}`),
    datasets: [{
      label: 'Duration in Days',
      data: sprints.map(sprint => sprint.startDate && sprint.endDate ? getTotalDays(sprint.startDate, sprint.endDate) : 0),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  const timeBarOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Days'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Sprints'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `Duration: ${tooltipItem.raw} days`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
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
              <Col lg="12" className="mb-4">
                <Card>
                <Row>
                  <Col lg="6">
                    <CardBody>
                      <CardTitle tag="h5"><strong>Project Progress Chart</strong></CardTitle>
                      {showCharts && (
                        <>
                          <div className="chart-container mb-4"  style={{ padding: '30px 0 0 0' }}>
                            <Bar data={sprintData} options={options} plugins={[ChartDataLabels]} />                  
                          </div>
                          <h6 style={{ textAlign: 'center', padding: '0 0 20px 0' }}>Fig 1. User Story Completion Tracking Chart</h6>
                          <div className="chart-container mb-4"  style={{ padding: '10px 0 0 0' }}>
                            <Pie data={pieData} options={pieOptions} plugins={[ChartDataLabels]} />
                          </div>
                          <h6 style={{ textAlign: 'center', padding: '0 0 20px 0'}}>Fig 2. User Story Progress Overview</h6>   
                          <div className="chart-container mb-4"  style={{ padding: '10px 0 0 0' }}>
                            <Line data={sprintDetailsData} options={sprintOptions} />
                          </div>
                          <h6 style={{ textAlign: 'center', padding: '0 0 10px 0'}}>Fig 3. Comparison of Sprint Scores to Average</h6>
                        </>
                      )}
                    </CardBody>
                  </Col>
                  
                  <Col lg="6">
                    <CardBody>
                    <CardTitle tag="h5"><strong>Time Tracking Chart</strong></CardTitle>
                    <div className="chart-container mb-4" style={{ padding: '30px 0 0 0' }}>
                    <Bar data={timebarData} options={timeBarOptions} />
                    </div>
                    <h6 style={{ textAlign: 'center', padding: '0 0 30px 0'}}>Fig 4. Duration of Sprints Over Time</h6>
                    <div className="chart-container mb-4">
                      <Pie data={timepieData} options={pieOptions} plugins={[ChartDataLabels]} />
                    </div>
                    <h6 style={{ textAlign: 'center', padding: '0 0 10px 0'}}>Fig 5. Sprint Time Contributions to Total Project Duration</h6>
                    </CardBody>
                  </Col>
                  </Row>
                </Card>
              </Col>

            </Row>
            <Row>
              <Col lg="12" className="mb-4">
                <Card>
                  <CardBody>
                    <CardText>
                      <Row>
                        <Col md="6">
                        <CardTitle tag="h5"><strong>Project Overview</strong></CardTitle>
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
                          <CardTitle tag="h5"><strong>Sprint Details and User Stories:</strong></CardTitle>
                          <ul>
                            {sprints.map((sprint, index) => (
                              <li key={index} style = {{textAlign: 'justify'}}>
                                Sprint {sprint.sprintNum}: {sprint.startDate && sprint.endDate ? `${sprint.startDate} / ${sprint.endDate}` : '(Date to be determined)'},
                                <ul>
                                  {sprint.userStoryList.map((story) => (
                                    <li key={story.userStoryId} style={{ marginBottom: '6px' }}>
                                      User Story {globalUserStoryIndex++}: {story.userStoryDescription}<br />
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
                        <CardTitle tag="h5"><strong>Time Tracking</strong></CardTitle>
                          <ul>
                            {sprints.map((sprint, index) => {
                              const days = sprint.startDate && sprint.endDate ? getTotalDays(sprint.startDate, sprint.endDate) : 0;
                              const percentage = totalProjectDays ? ((days / totalProjectDays) * 100).toFixed(2) : 0;
                              return (
                                <li key={index}>
                                  Sprint {sprint.sprintNum}: {days ? `${days} days` : '(Date to be determined)'},
                                  Overtime - {percentage}%
                                </li>
                              );
                            })}
                          </ul>
                        </Col>
                        <Col md="6">
                          <CardTitle tag="h5"><strong>Performance Metrics</strong></CardTitle>
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
