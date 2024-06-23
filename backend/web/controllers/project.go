package controllers

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"web/global"
	"web/global/response"
	"web/models"
)

// CreateProject 创建项目
// @Summary 创建项目
// @Description 创建一个新的项目并上传文件
// @Tags Project
// @Accept multipart/form-data
// @Produce json
// @Param title formData string true "项目标题"
// @Param field formData string true "项目领域"
// @Param description formData string true "项目描述"
// @Param email formData string true "客户邮箱"
// @Param requiredSkills[] formData string false "所需技能"
// @Param file formData file false "上传的文件"
// @Success 200 {object} map[string]interface{} "{"msg": "Project created successfully", "proId": 1, "fileName": "filename.pdf", "filePath": "backend/files/filename.pdf"}"
// @Failure 400 {object} map[string]interface{} "{"error": "Invalid email"}"
// @Failure 404 {object} map[string]interface{} "{"error": "Client not found"}"
// @Failure 500 {object} map[string]interface{} "{"error": "Failed to save file"} or {"error": "Failed to create project"} or {"error": "Failed to find or create skill"} or {"error": "Failed to associate skills"}"
// @Router /v1/project/create [post]
func CreateProject(c *gin.Context) {
	var fileName string
	var filePath string

	// 解析文件
	file, err := c.FormFile("file")
	if err == nil {
		// 创建上传目录
		uploadDir := "../files"
		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, os.ModePerm)
		}

		// 保存文件到本地存储
		filePath = filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
		fileName = file.Filename
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
		CreatedBy:   &clientID, // 存储创建者ID
	}

	// 如果有上传文件，则保存文件名和文件路径
	if fileName != "" && filePath != "" {
		project.Filename = fileName
		project.Filepath = "backend/files/" + fileName
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
		"msg":      "Project created successfully",
		"proId":    project.ID,
		"fileName": project.Filename,
		"filePath": project.Filepath,
	})
}

// GetProjectList godoc
// @Summary 获取公开项目列表
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
		if err := global.DB.Where("id = ?", project.CreatedBy).First(&client).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		responseList = append(responseList, response.GetProjectListResponse{
			ProjectID:      project.ID,
			Title:          project.Name,
			ClientName:     client.Username,
			ClientEmail:    client.Email,
			UserID:         *project.CreatedBy,
			RequiredSkills: skills,
			Field:          project.Field,
			AllocatedTeam:  teams,
		})
	}

	c.JSON(http.StatusOK, responseList)
}


// @Summary 根据 projectId 获取项目 detail
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
	if err := global.DB.Where("id = ?", project.CreatedBy).First(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	projectDetail := response.ProjectDetailResponse{
		ProjectID:      project.ID,
		Title:          project.Name,
		ClientName:     client.Username,
		ClientEmail:    client.Email,
		UserID:         *project.CreatedBy,
		RequiredSkills: skills,
		Field:          project.Field,
		Description:    project.Description,
		SpecLink:       project.Filepath, 
		AllocatedTeam:  teams,
	}

	c.JSON(http.StatusOK, projectDetail)
}
