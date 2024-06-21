// CustomCard.js
import React from 'react';
import { Card, CardBody, CardTitle, CardText } from 'reactstrap';

const CustomCard = ({ title, client, clientTitle, skills, field, imgSrc }) => {
  return (
    <Card className="mb-4">
      <div style={{ height: '150px', backgroundColor: '#D8BFD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h5>{title}</h5>
      </div>
      <CardBody>
        <div className="d-flex align-items-center mb-3">
          <div style={{ width: '40px', height: '40px', backgroundColor: '#D8BFD8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
            <span style={{ color: 'white', fontSize: '20px' }}>{client[0]}</span>
          </div>
          <div>
            <CardTitle tag="h5">{client}</CardTitle>
            <CardText>{clientTitle}</CardText>
          </div>
        </div>
        <CardText>{skills}</CardText>
        <CardText>{field}</CardText>
        <div className="d-flex justify-content-between">
          <i className="bi bi-file-earmark"></i>
          <i className="bi bi-pencil"></i>
          <i className="bi bi-person"></i>
          <i className="bi bi-trash"></i>
        </div>
      </CardBody>
    </Card>
  );
};

export default CustomCard;
