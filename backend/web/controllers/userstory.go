package controllers

import (
	"net/http"
	"time"
	"web/forms"
	"web/global"
	"web/models"

	"github.com/gin-gonic/gin"
)

// @Summary Create user story
// @Description Create a new user story for a given team and sprint, User Story Status (1: not started, 2: in progress, 3: completed)
// @Tags Project Progress
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
// @Description Edit an existing user story, User Story Status (1: not started, 2: in progress, 3: completed)
// @Tags Project Progress
// @Accept json
// @Produce json
// @Param UserStoryReq body forms.UserStoryReq true "UserStoryReq"
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

// @Summary Delete user story
// @Description Delete an existing user story
// @Tags Project Progress
// @Accept json
// @Produce json
// @Param userStoryId path int true "User Story ID"
// @Success 200 {object} map[string]interface{} "{"message": "User story deleted successfully"}"
// @Failure 404 {object} map[string]string "{"error": "User story not found"}"
// @Router /v1/progress/delete/userStory/{userStoryId} [delete]
func DeleteUserStory(c *gin.Context) {
	userStoryId := c.Param("userStoryId")

	var userStory models.UserStory
	if err := global.DB.Where("id = ?", userStoryId).First(&userStory).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User story not found"})
		return
	}

	if err := global.DB.Delete(&userStory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete user story"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User story deleted successfully"})
}

// @Summary Edit sprint start and end dates
// @Description Edit the start and end dates of an existing sprint，日期格式 YYYY-MM-DD
// @Tags Progress
// @Accept json
// @Produce json
// @Param sprint body forms.EditSprintDateReq true "Sprint Date"
// @Success 200 {object} map[string]interface{} "{"message": "Sprint dates updated successfully"}"
// @Failure 400 {object} map[string]string "{"error": "invalid request body"}"
// @Failure 404 {object} map[string]string "{"error": "Sprint not found"}"
// @Router /v1/progress/edit/sprint/date [post]
func EditSprintDate(c *gin.Context) {
	var req forms.EditSprintDateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var sprint models.Sprint
	if err := global.DB.Where("team_id = ? AND sprint_num = ?", req.TeamId, req.SprintNum).First(&sprint).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sprint not found"})
		return
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start date format"})
		return
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end date format"})
		return
	}

	sprint.StartDate = &startDate
	sprint.EndDate = &endDate

	if err := global.DB.Save(&sprint).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update sprint dates"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sprint dates updated successfully"})
}
