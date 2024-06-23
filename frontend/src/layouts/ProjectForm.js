import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const ProjectForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    field: '',
    skills: '',
    description: '',
    file: null
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', formData.name);
    form.append('client', formData.client);
    form.append('field', formData.field);
    form.append('skills', formData.skills);
    form.append('description', formData.description);
    form.append('file', formData.file);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: form,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 201) {
        toast.success('Project created successfully!', {
          position: toast.POSITION.TOP_RIGHT
        });
        setTimeout(() => {
          navigate('/project/myproject');
        }, 2000); // 2秒后跳转到"My Project"页面
      } else {
        toast.error('Failed to create project.', {
          position: toast.POSITION.TOP_RIGHT
        });
      }
    } catch (error) {
      toast.error('An error occurred.', {
        position: toast.POSITION.TOP_RIGHT
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="projectName">Project name</Label>
        <Input type="text" name="name" id="projectName" placeholder="Enter project name" value={formData.name} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for="projectClient">Project client</Label>
        <Input type="text" name="client" id="projectClient" placeholder="Enter project client" value={formData.client} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for="projectField">Field</Label>
        <Input type="text" name="field" id="projectField" placeholder="Enter field" value={formData.field} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for="requiredSkills">Required skills</Label>
        <Input type="text" name="skills" id="requiredSkills" placeholder="Enter required skills" value={formData.skills} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for="description">Description</Label>
        <Input type="textarea" name="description" id="description" placeholder="Enter description" value={formData.description} onChange={handleChange} />
      </FormGroup>
      <FormGroup>
        <Label for="projectSpec">Upload project specification (PDF)</Label>
        <Input type="file" name="file" id="projectSpec" accept="application/pdf" onChange={handleChange} />
      </FormGroup>
      <Button type="submit" color="primary">Save</Button>
    </Form>
  );
};

export default ProjectForm;
