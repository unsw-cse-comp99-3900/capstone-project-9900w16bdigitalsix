import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Container, Row, Col, Card, CardBody, CardTitle, FormGroup, Label, Input } from 'reactstrap';

const fetchApiData = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8080/v1/project/statistics/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return null;
  }
};

const VirtualDataReport = () => {
  const [data, setData] = useState(null);
  const [selectedField, setSelectedField] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const apiData = await fetchApiData();
      if (apiData) {
        setData(apiData);
        if (apiData.fields.length > 0) {
          setSelectedField(apiData.fields[0].field);
        }
      }
    };

    fetchData();
  }, []);

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const totalUsersData = {
    labels: ['Students', 'Clients', 'Tutors', 'Coordinators'],
    datasets: [
      {
        data: [data.totalStudents, data.totalClients, data.totalTutors, data.totalCoordinators],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
      },
    ],
  };

  const fieldTeamsData = {
    labels: data.fields.map(field => field.field),
    datasets: [
      {
        data: data.fields.map(field => field.teams),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const selectedFieldProjects = data.projects.filter(project => project.field === selectedField);
  const fieldProjectsData = {
    labels: selectedFieldProjects.map(project => project.title),
    datasets: [
      {
        label: 'Teams',
        data: selectedFieldProjects.map(project => project.teams),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  };

  const topKProjects = data.projects.sort((a, b) => b.teams - a.teams).slice(0, 5);
  const topKProjectsData = {
    labels: topKProjects.map(project => project.title),
    datasets: [
      {
        label: 'Projects',
        data: topKProjects.map(project => project.teams),
        backgroundColor: topKProjects.map(project => 'rgba(75, 192, 192, 0.6)'),
      },
    ],
  };

  const pieOptions = {
    responsive: true,
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

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  const noLegendBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <Container fluid>
      <Row>
        <Col lg="6" className="mb-4">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Total Users Distribution</CardTitle>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Pie data={totalUsersData} options={pieOptions} plugins={[ChartDataLabels]} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg="6" className="mb-4">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Teams per Field</CardTitle>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar data={fieldTeamsData} options={noLegendBarOptions} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg="6" className="mb-4">
          <Card>
            <CardBody>
              <FormGroup>
                <Label for="fieldSelect">Select Field</Label>
                <Input type="select" id="fieldSelect" value={selectedField} onChange={handleFieldChange}>
                  {data.fields.map(field => (
                    <option key={field.field} value={field.field}>{field.field}</option>
                  ))}
                </Input>
              </FormGroup>
              <CardTitle tag="h5">{selectedField} Projects</CardTitle>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar data={fieldProjectsData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg="6" className="mb-4">
          <Card>
            <CardBody>
              <CardTitle tag="h5">Top 5 Popular Projects</CardTitle>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Bar data={topKProjectsData} options={barOptions} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VirtualDataReport;
