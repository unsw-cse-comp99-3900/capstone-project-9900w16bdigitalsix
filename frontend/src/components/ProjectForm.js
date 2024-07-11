// ProjectForm.js
import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import MessageAlert from '../components/MessageAlert';

const apiCall = async (method, endpoint, body, isFormData = false) => {
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  const response = await fetch(`http://127.0.0.1:8080${endpoint}`, {
    method,
    headers: {
      'Accept': 'application/json',
      ...headers,
    },
    body: isFormData ? body : JSON.stringify(body),
  });
  const data = await response.json();
  return data;
};

const ProjectForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    field: '',
    description: '',
    email: '',
    requiredSkills: '',
    file: null,
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('error');
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    
    if (!formData.title) {
      setAlertMessage('Project title is required.');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }
    if (!formData.field) {
      setAlertMessage('Field is required.');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }
    if (!formData.description) {
      setAlertMessage('Description is required.');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }
    if (!formData.email) {
      setAlertMessage('Email is required.');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }
    if (!formData.requiredSkills) {
      setAlertMessage('Required skills are required.');
      setAlertType('error');
      setAlertOpen(true);
      return;
    }

    const form = new FormData();
    form.append('title', formData.title);
    form.append('field', formData.field);
    form.append('description', formData.description);
    form.append('email', formData.email);
    form.append('requiredSkills[]', formData.requiredSkills.split(',').map(skill => skill.trim()));
    if (formData.file) {
      const blob = new Blob([formData.file], { type: 'application/pdf' });
      form.append('spec', blob, formData.file.name);
    }

    try {
      const result = await apiCall('POST', '/v1/project/create', form, true);
      if (result.msg === 'Project created successfully') {
        setAlertMessage(result.msg);
        setAlertType('success');
        setAlertOpen(true);
        setTimeout(() => {
          navigate('/project/myproject');
        }, 2000);
      } else {
        setAlertMessage(result.error);
        setAlertType('error');
        setAlertOpen(true);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setAlertMessage(error.message);
      setAlertType('error');
      setAlertOpen(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="title">Project title</Label>
          <Input
            type="text"
            name="title"
            id="title"
            placeholder="Enter project title"
            value={formData.title}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="field">Field</Label>
          <Input
            type="text"
            name="field"
            id="field"
            placeholder="Enter field"
            value={formData.field}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="description">Description</Label>
          <Input
            type="textarea"
            name="description"
            id="description"
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Enter client email"
            value={formData.email}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="requiredSkills">Required skills (please use ", " to separate each item)</Label>
          <Input
            type="text"
            name="requiredSkills"
            id="requiredSkills"
            placeholder="Enter required skills"
            value={formData.requiredSkills}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="file">Upload project specification (PDF)</Label>
          <Input
            type="file"
            name="file"
            id="file"
            accept="application/pdf"
            onChange={handleChange}
          />
        </FormGroup>
        <Button type="submit" color="primary">Save</Button>
      </Form>
      <MessageAlert
        open={alertOpen}
        alertType={alertType}
        handleClose={handleCloseAlert}
        snackbarContent={alertMessage}
      />
    </div>
  );
};

export default ProjectForm;