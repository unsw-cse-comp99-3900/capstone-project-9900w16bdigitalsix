import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Container, Row, Col, Card, CardBody, CardTitle, FormGroup, Label, Input } from 'reactstrap';

const VirtualDataReport = () => {
  const data = {
    totalStudents: 150,
    totalClients: 30,
    totalTutors: 20,
    totalCoordinators: 10,
    fields: [
      { name: "Artificial Intelligence", projects: 8, teams: 20 },
      { name: "Data Science", projects: 6, teams: 15 },
      { name: "Cyber Security", projects: 4, teams: 10 },
      { name: "Software Engineering", projects: 5, teams: 12 },
      { name: "Network Engineering", projects: 3, teams: 8 },
      { name: "Human-Computer Interaction", projects: 7, teams: 18 },
      { name: "Cloud Computing", projects: 4, teams: 11 },
      { name: "Information Systems", projects: 6, teams: 14 },
      { name: "Machine Learning", projects: 5, teams: 13 },
      { name: "Blockchain", projects: 2, teams: 6 },
      { name: "Other", projects: 1, teams: 4 },
    ],
    projects: [
      { name: "Project A", field: "Artificial Intelligence", teams: 5 },
      { name: "Project B", field: "Artificial Intelligence", teams: 3 },
      { name: "Project C", field: "Artificial Intelligence", teams: 2 },
      { name: "Project D", field: "Artificial Intelligence", teams: 4 },
      { name: "Project E", field: "Artificial Intelligence", teams: 6 },
      { name: "Project F", field: "Data Science", teams: 7 },
      { name: "Project G", field: "Data Science", teams: 5 },
      { name: "Project H", field: "Data Science", teams: 4 },
      { name: "Project I", field: "Data Science", teams: 3 },
      { name: "Project J", field: "Cyber Security", teams: 3 },
      { name: "Project K", field: "Cyber Security", teams: 4 },
      { name: "Project L", field: "Cyber Security", teams: 3 },
      { name: "Project M", field: "Software Engineering", teams: 4 },
      { name: "Project N", field: "Software Engineering", teams: 5 },
      { name: "Project O", field: "Software Engineering", teams: 3 },
      { name: "Project P", field: "Network Engineering", teams: 3 },
      { name: "Project Q", field: "Network Engineering", teams: 2 },
      { name: "Project R", field: "Network Engineering", teams: 3 },
      { name: "Project S", field: "Human-Computer Interaction", teams: 6 },
      { name: "Project T", field: "Human-Computer Interaction", teams: 4 },
      { name: "Project U", field: "Human-Computer Interaction", teams: 5 },
      { name: "Project V", field: "Cloud Computing", teams: 4 },
      { name: "Project W", field: "Cloud Computing", teams: 3 },
      { name: "Project X", field: "Cloud Computing", teams: 4 },
      { name: "Project Y", field: "Information Systems", teams: 5 },
      { name: "Project Z", field: "Information Systems", teams: 4 },
      { name: "Project AA", field: "Information Systems", teams: 5 },
      { name: "Project BB", field: "Machine Learning", teams: 3 },
      { name: "Project CC", field: "Machine Learning", teams: 4 },
      { name: "Project DD", field: "Machine Learning", teams: 3 },
      { name: "Project EE", field: "Blockchain", teams: 2 },
      { name: "Project FF", field: "Blockchain", teams: 4 },
      { name: "Project GG", field: "Other", teams: 1 },
      { name: "Project HH", field: "Other", teams: 3 },
      // 其他项目的数据
    ],
  };

  const fieldColors = {
    "Artificial Intelligence": "rgba(75, 192, 192, 0.6)",
    "Data Science": "rgba(255, 99, 132, 0.6)",
    "Cyber Security": "rgba(153, 102, 255, 0.6)",
    "Software Engineering": "rgba(255, 159, 64, 0.6)",
    "Network Engineering": "rgba(54, 162, 235, 0.6)",
    "Human-Computer Interaction": "rgba(255, 206, 86, 0.6)",
    "Cloud Computing": "rgba(75, 192, 192, 0.6)",
    "Information Systems": "rgba(255, 99, 132, 0.6)",
    "Machine Learning": "rgba(153, 102, 255, 0.6)",
    "Blockchain": "rgba(255, 159, 64, 0.6)",
    "Other": "rgba(54, 162, 235, 0.6)",
  };

  const [selectedField, setSelectedField] = useState("Artificial Intelligence");

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

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
    labels: data.fields.map(field => field.name),
    datasets: [
      {
        data: data.fields.map(field => field.teams),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const selectedFieldProjects = data.projects.filter(project => project.field === selectedField);
  const fieldProjectsData = {
    labels: selectedFieldProjects.map(project => project.name),
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
    labels: topKProjects.map(project => project.name),
    datasets: [
      {
        label: 'Projects',
        data: topKProjects.map(project => project.teams),
        backgroundColor: topKProjects.map(project => fieldColors[project.field] || 'rgba(75, 192, 192, 0.6)'),
      },
    ],
  };

  const uniqueFields = [...new Set(topKProjects.map(project => project.field))];
  const legendLabels = uniqueFields.map(field => ({
    text: field,
    fillStyle: fieldColors[field],
  }));

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
        max: 10, // 固定纵坐标最大值为10
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          generateLabels: (chart) => {
            return legendLabels;
          },
        },
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
                    <option key={field.name} value={field.name}>{field.name}</option>
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
