import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
// import { apiCall } from './api'; // 确保路径正确
export const apiCall = async (method, endpoint, data, isFormData = false) => {
  const headers = {};

  // if (isFormData) {
  //   headers['Content-Type'] = 'multipart/form-data';
  // }

  console.log('Request Headers:', headers);
  console.log('Request Method:', method);
  console.log('Request URL:', `http://127.0.0.1:8080${endpoint}`);
  console.log(data)
  const options = {
    method,
    headers,
    body: isFormData ? data : JSON.stringify(data),
  };

  console.log('Request Options:', options);

  const response = await fetch(`http://127.0.0.1:8080${endpoint}`, options);
  const result = await response.json();
  console.log(result)
  return result;

};

const createFormData = () => {
  const formDataa = new FormData();
  
  formDataa.append('title', 'wqeq1');
  formDataa.append('clientEmail', 'haowang32123@gmail.com');
  
  // 添加技能数组
  const skills = ['python', 'java'];
  skills.forEach(skill => formDataa.append('requiredSkills[]', skill));
  
  formDataa.append('field', 'field2');
  formDataa.append('description', 'descripti3on');
  
  // 创建一个虚拟文件
  const blob = new Blob(['dummy content'], { type: 'application/pdf' });
  formDataa.append('spec', blob, 'dummy.pdf');

  return formDataa;
};

const EditProjectForm = ({ initialValues, id }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    for (const key in formData) {
      // console.log(key, formData[key])
      if (key === 'requiredSkills') {
        const skills = formData[key].split(',').map(skill => skill.trim());
        skills.forEach(skill => form.append('requiredSkills[]', skill));
      } else if (key === 'email') {
        form.append('clientEmail', form[key]);
      } else if (key === 'file') {
        const blob = new Blob([formData[key]], { type: 'application/pdf' });
        form.append('spec', blob, 'renewed.pdf');
      } else {
        form.append(key, formData[key]);
      }
    }

    // console.log('FormData:', ...form); // 用于调试，查看FormData内容
    
    
    const formb = createFormData();
    console.log('FormData entries:');
      for (let [key, value] of formb.entries()) {
        console.log(key, value);
      }
    
    console.log('FormData entries:');
      for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    try {
      const result = await apiCall('POST', `/v1/project/modify/${id}`, formb, true);
      if (result.msg === 'Project updated successfully') {
        toast.success('Project updated successfully!', {
          position: 'top-right',
        });
        setTimeout(() => {
          navigate('/project/myproject');
        }, 2000);
      } else {
        toast.error(`Failed to update project: ${result.error}`, {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('An error occurred.', {
        position: 'top-right',
      });
    }
  };

  return (
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
        <Label for="requiredSkills">Required skills</Label>
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
  );
};

export default EditProjectForm;
