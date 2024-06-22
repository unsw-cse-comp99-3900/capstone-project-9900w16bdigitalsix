// CustomCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';


const CustomCard = ({id, title, client, clientTitle, skills, field }) => {
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
          <Link to={`/project/edit/`}>
            {/* <Button color="primary"> */}
              <i className="bi bi-pencil"></i>
            {/* </Button> */}
          </Link>

          <i className="bi bi-person"></i>
          <i className="bi bi-trash"></i>
        </div>
      </CardBody>
    </Card>
  );
};

export default CustomCard;
