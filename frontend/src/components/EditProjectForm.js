import React, { useState, useEffect } from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import MessageAlert from "../components/MessageAlert";

// define the apicall function
export const apiCall = async (method, endpoint, data, isFormData = false) => {
  const headers = isFormData ? {} : { "Content-Type": "application/json" };

  const options = {
    method,
    headers,
    body: isFormData ? data : JSON.stringify(data),
  };

  const response = await fetch(`http://127.0.0.1:8080${endpoint}`, options);
  const result = await response.json();
  return { status: response.status, data: result };
};

const EditProjectForm = ({ initialValues, id }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialValues);
  const [fileName, setFileName] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [alertMessage, setAlertMessage] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");
    setRole(parseInt(storedRole, 10));

    if (storedRole === "3") {
      setFormData((prevData) => ({ ...prevData, email: storedEmail }));
    }
  }, []);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  // check the validation for project input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "title") {
      const wordCount = value.trim().split(/\s+/).length;
      if (wordCount > 20) {
        setAlertMessage("Project title cannot exceed 20 words.");
        setAlertType("error");
        setAlertOpen(true);
        return;
      }
    }

    if (name === "maxTeams") {
      if (value !== "" && (isNaN(value) || parseInt(value, 10) <= 0)) {
        setAlertMessage("Maximum teams must be a positive integer.");
        setAlertType("error");
        setAlertOpen(true);
        return;
      }
    }

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setFileName(files[0].name);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const titleWordCount = formData.title.trim().split(/\s+/).length;
    if (titleWordCount > 20) {
      setAlertMessage("Project title cannot exceed 20 words.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!formData.title) {
      setAlertMessage("Project title is required.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!formData.field) {
      setAlertMessage("Field is required.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!formData.description) {
      setAlertMessage("Description is required.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!formData.email) {
      setAlertMessage("Email is required.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!formData.requiredSkills) {
      setAlertMessage("Required skills are required.");
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    if (!formData.maxTeams || parseInt(formData.maxTeams, 10) <= 0) {
      setAlertMessage(
        "Maximum teams is required and must be a positive integer."
      );
      setAlertType("error");
      setAlertOpen(true);
      return;
    }
    // create the formdata
    const form = new FormData();
    for (const key in formData) {
      if (key === "requiredSkills") {
        const skills = formData[key].split(",").map((skill) => skill.trim());
        skills.forEach((skill) => form.append("requiredSkills[]", skill));
      } else if (key === "email") {
        form.append("clientEmail", formData[key]);
      } else if (key === "file") {
        if (formData[key]) {
          const originalFileName = formData[key].name;
          const newFileName = `${id}_${originalFileName}`;
          form.append("spec", formData[key], newFileName);
        }
      } else {
        form.append(key, formData[key]);
      }
    }
    // request from backend
    try {
      const result = await apiCall(
        "POST",
        `/v1/project/modify/${id}`,
        form,
        true
      );
      if (result.status === 200) {
        setAlertMessage("Project updated successfully!");
        setAlertType("success");
        setAlertOpen(true);
        setTimeout(() => {
          navigate("/project/myproject");
        }, 2000);
      } else {
        setAlertMessage(result.data.error || "Failed to update project");
        setAlertType("error");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setAlertMessage(error.message);
      setAlertType("error");
      setAlertOpen(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
  };

  const fields = [
    "Artificial Intelligence",
    "Data Science",
    "Cyber Security",
    "Software Engineering",
    "Network Engineering",
    "Human-Computer Interaction",
    "Cloud Computing",
    "Information Systems",
    "Machine Learning",
    "Blockchain",
    "Other",
  ];

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="title">Project title (20 words maximum)</Label>
          <Input
            type="text"
            name="title"
            id="title"
            placeholder="Enter project title"
            value={formData.title}
            onChange={handleChange}
          />
        </FormGroup>
        {/* field selection */}
        <FormGroup>
          <Label for="field">Field</Label>
          <Input
            type="select"
            name="field"
            id="field"
            value={formData.field}
            onChange={handleChange}
          >
            <option value="">Select field</option>
            {fields.map((field, index) => (
              <option key={index} value={field}>
                {field}
              </option>
            ))}
          </Input>
        </FormGroup>
        {/* project description */}
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
        {/* check the user, coordinator can designate the client */}
        {/* client can only create his own project */}
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
        {/* get project's required skills */}
        <FormGroup>
          <Label for="requiredSkills">
            Required skills (please use ", " to separate each item)
          </Label>
          <Input
            type="text"
            name="requiredSkills"
            id="requiredSkills"
            placeholder="Enter required skills"
            value={formData.requiredSkills}
            onChange={handleChange}
          />
        </FormGroup>
        {/* get defined maximum teams number */}
        <FormGroup>
          <Label for="maxTeams">Maximum Teams</Label>
          <Input
            type="text"
            name="maxTeams"
            id="maxTeams"
            placeholder="Enter maximum number of teams"
            value={formData.maxTeams}
            onChange={handleChange}
          />
        </FormGroup>
        {/* upload project spectification */}
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
        {fileName && <p>Selected file: {fileName}</p>} {/* 显示选中的文件名 */}
        <Button type="submit" color="primary">
          Save
        </Button>
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
