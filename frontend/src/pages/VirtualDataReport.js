import React, { useState, useEffect, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Container, Row, Col, Card, CardBody, CardTitle, FormGroup, Label, Input, Button } from 'reactstrap';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// field color map
const fieldColors = {
  "Artificial Intelligence": 'rgba(75, 192, 192, 0.6)',
  "Data Science": 'rgba(255, 99, 132, 0.6)',
  "Cyber Security": 'rgba(153, 102, 255, 0.6)',
  "Software Engineering": 'rgba(255, 159, 64, 0.6)',
  "Network Engineering": 'rgba(54, 162, 235, 0.6)',
  "Human-Computer Interaction": 'rgba(255, 206, 86, 0.6)',
  "Cloud Computing": 'rgba(75, 192, 192, 0.6)',
  "Information Systems": 'rgba(153, 102, 255, 0.6)',
  "Machine Learning": 'rgba(255, 99, 132, 0.6)',
  "Blockchain": 'rgba(54, 162, 235, 0.6)',
  "Other": 'rgba(255, 159, 64, 0.6)',
  "dasd": 'rgba(75, 75, 192, 0.6)',
  "wedqasda": 'rgba(192, 75, 192, 0.6)',
  "AIII": 'rgba(75, 192, 75, 0.6)',
  "MLAI": 'rgba(192, 192, 75, 0.6)'
};

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
  const reportRef = useRef(null);

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

  const handlePrintPdf = async () => {
    const input = reportRef.current;
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    // get time
    const currentDate = new Date();
    const dateString = currentDate.toLocaleString();

    pdf.setFontSize(18);
    pdf.text("Project Statistics", 20, 30);
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${dateString}`, 20, 50);

    let offset = 70; // offset
    
    // get all chart elements
    const charts = input.querySelectorAll('.chart-container');
    for (let i = 0; i < charts.length; i += 2) {
      const firstChartCanvas = await html2canvas(charts[i], { scale: 2 });
      const firstImgData = firstChartCanvas.toDataURL('image/png');
      const secondChartCanvas = charts[i + 1] ? await html2canvas(charts[i + 1], { scale: 2 }) : null;
      const secondImgData = secondChartCanvas ? secondChartCanvas.toDataURL('image/png') : null;

      const imgWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const imgHeight = firstChartCanvas.height * imgWidth / firstChartCanvas.width;
      const margin = 20;

      // Adjust the height to fit two charts in one page
      const adjustedHeight = (pageHeight - margin * 3 - offset) / 2;
      const adjustedWidth = firstChartCanvas.width * adjustedHeight / firstChartCanvas.height;

      // Draw the first chart
      pdf.addImage(firstImgData, 'PNG', margin, offset + margin, adjustedWidth, adjustedHeight);

      // Draw the second chart if it exists
      if (secondImgData) {
        pdf.addImage(secondImgData, 'PNG', margin, offset + adjustedHeight + margin * 2, adjustedWidth, adjustedHeight);
      }

      // Add a new page if there are more charts to be added
      if (i + 2 < charts.length) {
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.text("Project Statistics", 20, 30);
        pdf.setFontSize(12);
        pdf.text(`Generated on: ${dateString}`, 20, 50);
        offset = 70; // reset offset
      }
    }

    pdf.save('report.pdf');
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
        label: 'Fields',
        data: topKProjects.map(project => project.teams),
        backgroundColor: topKProjects.map(project => fieldColors[project.field]),
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
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            const uniqueFields = [...new Set(topKProjects.map(project => project.field))];
            return uniqueFields.map((field, i) => ({
              text: field,
              fillStyle: fieldColors[field],
              strokeStyle: fieldColors[field],
              index: i
            }));
          }
        }
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
      <Button onClick={handlePrintPdf} className="mb-4">Print PDF</Button>
      <div ref={reportRef}>
        <Row>
          <Col lg="6" className="mb-4 chart-container">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Total Users Distribution</CardTitle>
                <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                  <Pie data={totalUsersData} options={pieOptions} plugins={[ChartDataLabels]} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" className="mb-4 chart-container">
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
          <Col lg="6" className="mb-4 chart-container">
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
          <Col lg="6" className="mb-4 chart-container">
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
      </div>
    </Container>
  );
};

export default VirtualDataReport;
