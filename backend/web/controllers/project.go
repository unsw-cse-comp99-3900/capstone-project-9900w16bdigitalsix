package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"web/forms"
	"web/global"
	"web/models"
)

func CreateProject(c *gin.Context) {
	var req forms.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 检查客户是否存在
	var client models.User
	if err := global.DB.Where("email = ?", req.ClientEmail).First(&client).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
		return
	}

	// 获取所需技能
	var skills []models.Skill
	if err := global.DB.Where("skill_name IN ?", req.RequiredSkills).Find(&skills).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch required skills"})
		return
	}

	// 创建项目
	project := models.Project{
		Name:        req.Title,
		Field:       req.Field,
		Description: req.Description,
		CreatedBy:   &client.ID,
		Skills:      skills,
	}

	if err := global.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Project created successfully",
		"projectID": project.ID,
	})
}
