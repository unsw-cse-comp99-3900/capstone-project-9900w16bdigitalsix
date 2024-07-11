package controllers

import (
	"net/http"
	"web/forms"
	"web/global"
	"web/models"

	"github.com/gin-gonic/gin"
)

// @Summary Create user story
// @Description Create a new user story for a given team and sprint, User Story Status (1: not started, 2: in progress, 3: completed)
// @Tags Progress
// @Accept json
// @Produce json
// @Param UserStoryReq body forms.UserStoryReq true "UserStoryReq"
// @Success 200 {object} map[string]interface{} "{"userStoryId": 123}"
// @Failure 400 {object} map[string]string "{"error": "invalid request body"}"
// @Router /v1/progress/create/userstory [post]
func CreateUserStory(c *gin.Context) {
	var req forms.UserStoryReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var sprint models.Sprint
	if err := global.DB.Where("team_id = ? AND sprint_num = ?", req.TeamId, req.SprintNum).First(&sprint).Error; err != nil {
		// 如果 sprint 不存在，先创建一个新的 sprint
		sprint = models.Sprint{
			TeamID:    req.TeamId,
			SprintNum: req.SprintNum,
			StartDate: nil, // 设置为空
			EndDate:   nil, // 设置为空
			Grade:     nil,
			Comment:   nil,
		}

		if err := global.DB.Create(&sprint).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create sprint"})
			return
		}
	}

	userStory := models.UserStory{
		TeamID:      req.TeamId,
		SprintNum:   req.SprintNum,
		Description: req.UserStoryDescription,
		Status:      req.UserStoryStatus,
	}

	if err := global.DB.Create(&userStory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user story"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"userStoryId": userStory.ID})
}

// @Summary Edit user story
// @Description Edit an existing user story
// @Tags Progress
// @Accept json
// @Produce json
// @Param teamId body int true "Team ID"
// @Param sprintNum body int true "Sprint Number"
// @Param userStoryId body int true "User Story ID"
// @Param userStoryDescription body string true "User Story Description"
// @Param userStoryStatus body int true "User Story Status (1: not started, 2: in progress, 3: completed)"
// @Success 200 {object} map[string]interface{} "{"message": "User story updated successfully"}"
// @Failure 400 {object} map[string]string "{"error": "invalid request body"}"
// @Failure 404 {object} map[string]string "{"error": "User story not found"}"
// @Router /v1/progress/edit/{userStoryId} [post]
func EditUserStory(c *gin.Context) {
	userStoryId := c.Param("userStoryId")

	var req forms.UserStoryReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var userStory models.UserStory
	if err := global.DB.Where("id = ? AND team_id = ? AND sprint_num = ?", userStoryId, req.TeamId, req.SprintNum).First(&userStory).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User story not found"})
		return
	}

	userStory.Description = req.UserStoryDescription
	userStory.Status = req.UserStoryStatus

	if err := global.DB.Save(&userStory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user story"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User story updated successfully"})
}
