// ProjectForm.js
import React from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';

const ProjectForm = () => {
  return (
    <Form>
      <FormGroup>
        <Label for="projectName">Project name</Label>
        <Input type="text" name="name" id="projectName" placeholder="Enter project name" />
      </FormGroup>
      <FormGroup>
        <Label for="projectClient">Project client</Label>
        <Input type="text" name="client" id="projectClient" placeholder="Enter project client" />
      </FormGroup>
      <FormGroup>
        <Label for="projectField">Field</Label>
        <Input type="text" name="field" id="projectField" placeholder="Enter field" />
      </FormGroup>
      <FormGroup>
        <Label for="requiredSkills">Required skills</Label>
        <Input type="text" name="skills" id="requiredSkills" placeholder="Enter required skills" />
      </FormGroup>
      <FormGroup>
        <Label for="description">Description</Label>
        <Input type="textarea" name="description" id="description" placeholder="Enter description" />
      </FormGroup>
      <FormGroup>
        <Label for="projectSpec">Upload project specification (PDF)</Label>
        <Input type="file" name="file" id="projectSpec" accept="application/pdf" />
      </FormGroup>
      <Button color="primary">Save</Button>
    </Form>
  );
};

export default ProjectForm;
