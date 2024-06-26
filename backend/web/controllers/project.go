package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"web/global"
	"web/global/response"
	"web/models"
)

// CreateProject godoc
// @Summary Create a new project
// @Description 创建一个新的项目并上传文件
// @Tags Project
// @Accept multipart/form-data
// @Produce json
// @Param title formData string true "Project Title"
// @Param field formData string true "Project Field"
// @Param description formData string true "Project Description"
// @Param email formData string true "Clinet Email"
// @Param requiredSkills[] formData string false "Required Skills"
// @Param file formData file false "upload file"
// @Success 200 {object} map[string]interface{} "{"msg": "Project created successfully", "projectId": 1, "fileName": "filename.pdf", "filePath": "backend/files/filename.pdf", "createdBy": 1}"
// @Failure 400 {object} map[string]interface{} "{"error": "Invalid email"}"
// @Failure 404 {object} map[string]interface{} "{"error": "Client not found"}"
// @Failure 500 {object} map[string]interface{} "{"error": "Failed to save file"} or {"error": "Failed to create project"} or {"error": "Failed to find or create skill"} or {"error": "Failed to associate skills"}"
// @Router /v1/project/create [post]
func CreateProject(c *gin.Context) {
	var fileName string
	var fileURL string

	// 解析文件
	file, err := c.FormFile("file")
	if err == nil {
		// 创建上传目录
		uploadDir := global.ServerConfig.FilePath
		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, os.ModePerm)
		}

		// 保存文件到本地存储
		fileURL = filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, fileURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		fileName = file.Filename
		host := global.ServerConfig.Host
		port := global.ServerConfig.Port
		fileURL = fmt.Sprintf("http://%s:%d/files/%s", host, port, fileName)

	} else if err != http.ErrMissingFile {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upload file"})
		return
	}

	// 解析其他字段
	title := c.PostForm("title")
	field := c.PostForm("field")
	description := c.PostForm("description")
	email := c.PostForm("email")
	requiredSkills := c.PostFormArray("requiredSkills[]")

	// 检查客户是否存在
	var client models.User
	if err := global.DB.Where("email = ?", email).First(&client).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
		return
	}

	clientID := client.ID

	// 创建项目
	project := models.Project{
		Name:        title,
		Field:       field,
		Description: description,
		Owner:   &clientID, // 存储创建者ID
	}

	// 如果有上传文件，则保存文件名和文件路径
	if fileURL != "" {
		project.Filename = fileName
		project.FileURL = fileURL
	}

	if err := global.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	// 处理所需技能
	var skills []models.Skill
	for _, skillName := range requiredSkills {
		var skill models.Skill
		if err := global.DB.Where("skill_name = ?", skillName).First(&skill).Error; err != nil {
			if gorm.ErrRecordNotFound == err {
				skill = models.Skill{SkillName: skillName}
				global.DB.Create(&skill)
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find or create skill"})
				return
			}
		}
		skills = append(skills, skill)
	}

	// 更新项目的技能关联
	if err := global.DB.Model(&project).Association("Skills").Replace(skills); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate skills"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"msg":       "Project created successfully",
		"projectId": project.ID,
		"fileName":  project.Filename,
		"fileURL":   project.FileURL,
		"createdBy": client.ID,
	})
}

// GetProjectList godoc
// @Summary Get pubilic project list
// @Description is_public 字段 1表示 public， 2 表示未公开, 这里返回的公开的 project 信息
// @Tags Project
// @Produce json
// @Success 200 {array} response.GetProjectListResponse
// @Failure 500 {object} map[string]string "{"error": string}"
// @Router /v1/project/get/public_project/list [get]
func GetProjectList(c *gin.Context) {
	var projects []models.Project

	if err := global.DB.Preload("Skills").Preload("Teams").Where("is_public = ?", 1).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var responseList []response.GetProjectListResponse

	for _, project := range projects {
		var skills []string
		for _, skill := range project.Skills {
			skills = append(skills, skill.SkillName)
		}

		var teams []response.AllocatedTeam
		for _, team := range project.Teams {
			teams = append(teams, response.AllocatedTeam{
				TeamID:   team.ID,
				TeamName: team.Name,
			})
		}

		client := models.User{}
		if err := global.DB.Where("id = ?", project.Owner).First(&client).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		responseList = append(responseList, response.GetProjectListResponse{
			ProjectID:      project.ID,
			Title:          project.Name,
			ClientName:     client.Username,
			ClientEmail:    client.Email,
			UserID:         *project.Owner,
			RequiredSkills: skills,
			Field:          project.Field,
			AllocatedTeam:  teams,
		})
	}

	c.JSON(http.StatusOK, responseList)
}

// @Summary Get project detail by projectID
// @Description 根据项目ID获取项目的详细信息
// @Tags Project
// @Produce json
// @Param projectId path uint true "项目ID"
// @Success 200 {object} response.ProjectDetailResponse
// @Failure 404 {object} map[string]string "{"error": "Project not found"}"
// @Failure 500 {object} map[string]string "{"error": "Internal Server Error"}"
// @Router /v1/project/detail/{projectId} [get]
func GetProjectDetail(c *gin.Context) {
	projectId := c.Param("projectId")

	var project models.Project
	if err := global.DB.Preload("Skills").Preload("Teams").Where("id = ?", projectId).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var skills []string
	for _, skill := range project.Skills {
		skills = append(skills, skill.SkillName)
	}

	var teams []response.AllocatedTeam
	for _, team := range project.Teams {
		teams = append(teams, response.AllocatedTeam{
			TeamID:   team.ID,
			TeamName: team.Name,
		})
	}

	client := models.User{}
	if err := global.DB.Where("id = ?", project.Owner).First(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	projectDetail := response.ProjectDetailResponse{
		ProjectID:      project.ID,
		Title:          project.Name,
		ClientName:     client.Username,
		ClientEmail:    client.Email,
		UserID:         *project.Owner,
		RequiredSkills: skills,
		Field:          project.Field,
		Description:    project.Description,
		SpecLink:       project.FileURL,
		AllocatedTeam:  teams,
	}

	c.JSON(http.StatusOK, projectDetail)
}

// DeleteProject godoc
// @Summary Delete project
// @Description 根据项目ID删除项目
// @Tags Project
// @Produce json
// @Param projectId path int true "Project ID"
// @Success 200 {object} map[string]interface{} "{"success": bool}"
// @Failure 404 {object} map[string]string "{"error": string}"
// @Failure 500 {object} map[string]string "{"error": string}"
// @Router /v1/project/delete/{projectId} [delete]
func DeleteProject(c *gin.Context) {
	projectId := c.Param("projectId")
	var project models.Project

	// 检查项目是否存在
	if err := global.DB.First(&project, projectId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 删除项目
	if err := global.DB.Delete(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// ModifyProjectDetail godoc
// @Summary Modify project detail information
// @Description 通过projectId修改项目详细信息，并更新项目的创建人
// @Tags Project
// @Accept multipart/form-data
// @Produce json
// @Param projectId path int true "Project ID"
// @Param title formData string true "Project Title"
// @Param clientEmail formData string true "Client Email"
// @Param requiredSkills[] formData string false "Required Skills"
// @Param field formData string true "Project Field"
// @Param description formData string true "Project Description"
// @Param spec formData file false "Specification File"
// @Success 200 {object} response.ModifyProjectDetailResponse
// @Failure 400 {object} map[string]string "{"error": "File not provided"}"
// @Failure 404 {object} map[string]string "{"error": "Project not found"}"
// @Failure 500 {object} map[string]string "{"error": Internal Error}"
// @Router /v1/project/modify/{projectId} [post]
func ModifyProjectDetail(c *gin.Context) {
	projectId := c.Param("projectId")
	var fileName, fileURL string
	var project models.Project

	// 检查项目是否存在
	if err := global.DB.First(&project, projectId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 解析表单数据
	title := c.PostForm("title")
	clientEmail := c.PostForm("clientEmail")
	requiredSkills := c.PostFormArray("requiredSkills[]")
	field := c.PostForm("field")
	description := c.PostForm("description")

	// 查找用户
	var user models.User
	if err := global.DB.Where("email = ?", clientEmail).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 获取文件
	file, err := c.FormFile("spec")
	if err == nil { // 上传了文件
		uploadDir := global.ServerConfig.FilePath
		// 保存文件到本地存储
		fileURL = filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, fileURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		fileName = file.Filename
		host := global.ServerConfig.Host
		port := global.ServerConfig.Port
		fileURL = fmt.Sprintf("http://%s:%d/files/%s", host, port, fileName)
	}

	// 更新项目数据
	project.Name = title
	project.Field = field
	project.Description = description
	project.FileURL = fileURL
	project.Owner = &user.ID

	// 更新技能 关联表(project_skills）
	var skills []models.Skill
	if len(requiredSkills) > 0 {
		if err := global.DB.Where("skill_name IN ?", requiredSkills).Find(&skills).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		global.DB.Model(&project).Association("Skills").Replace(skills)
	}

	// 保存项目更新
	if err := global.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.ModifyProjectDetailResponse{
		Message:         "Project detail modified successfully",
		CreatedBy:       user.Username,
		CreatedByUserID: user.ID,
		CreatedByEmail:  user.Email,
	})
}
