import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import MessageAlert from '../components/MessageAlert';

export const apiCall = async (method, endpoint, data, isFormData = false) => {
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };

  console.log('Request Headers:', headers);
  console.log('Request Method:', method);
  console.log('Request URL:', `http://127.0.0.1:8080${endpoint}`);
  console.log(data);

  const options = {
    method,
    headers,
    body: isFormData ? data : JSON.stringify(data),
  };

  console.log('Request Options:', options);

  const response = await fetch(`http://127.0.0.1:8080${endpoint}`, options);
  const result = await response.json();
  console.log(result);
  return { status: response.status, data: result };
};

const EditProjectForm = ({ initialValues, id }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialValues);
  const [fileName, setFileName] = useState('');

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState('error');
  const [alertMessage, setAlertMessage] = useState('');
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedEmail = localStorage.getItem('email');
    setRole(parseInt(storedRole, 10));

    if (storedRole === '3') {
      setFormData((prevData) => ({ ...prevData, email: storedEmail }));
    }
  }, []);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setFileName(files[0].name); // 保存原始文件名
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    for (const key in formData) {
      if (key === 'requiredSkills') {
        const skills = formData[key].split(',').map(skill => skill.trim());
        skills.forEach(skill => form.append('requiredSkills[]', skill));
      } else if (key === 'email') {
        form.append('clientEmail', formData[key]);
      } else if (key === 'file') {
        const originalFileName = formData[key].name;
        const newFileName = `${id}_${originalFileName}`;
        form.append('spec', formData[key], newFileName);
      } else {
        form.append(key, formData[key]);
      }
    }

    console.log('FormData entries:');
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    try {
      const result = await apiCall('POST', `/v1/project/modify/${id}`, form, true);
      if (result.status === 200) {
        setAlertMessage('Project updated successfully!');
        setAlertType('success');
        setAlertOpen(true);
        setTimeout(() => {
          navigate('/project/myproject');
        }, 2000);
      } else {
        setAlertMessage(result.data.error || 'Failed to update project');
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
        {(role === 4 || role === 5) && (
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
        )}
        <FormGroup>
          <Label for="requiredSkills">Required skills  (please use ", " to separate each item)</Label>
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

export default EditProjectForm;
