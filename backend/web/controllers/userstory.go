package controllers

import (
	"fmt"
	"net/http"
	"time"
	"web/forms"
	"web/global"
	"web/global/response"
	"web/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
		// if sprint is nil, create new sprint
		sprint = models.Sprint{
			TeamID:    req.TeamId,
			SprintNum: req.SprintNum,
			StartDate: nil, 
			EndDate:   nil, 
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
// @Router /v1/progress/delete/{userStoryId} [delete]
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
// @Description Edit the start and end dates of an existing sprint，日期格式 RFC3339
// @Tags Project Progress
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

// @Summary Edit grade
// @Description Edit the grade and comment of an existing sprint
// @Tags Project Progress
// @Accept json
// @Produce json
// @Param grade body forms.EditGradeReq true "Edit Grade"
// @Success 200 {object} map[string]interface{} "{"message": "Grade updated successfully"}"
// @Failure 400 {object} map[string]string "{"error": "invalid request body"}"
// @Failure 404 {object} map[string]string "{"error": "Team not found"}"
// @Failure 500 {object} map[string]string "{"error": "Failed to create sprint"}" or "{"error": "failed to fetch sprint"}"
// @Router /v1/progress/edit/grade [post]
func EditGrade(c *gin.Context) {
	var req forms.EditGradeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	for _, sprint := range req.Sprints {
		var s models.Sprint
		if err := global.DB.Where("team_id = ? AND sprint_num = ?", req.TeamId, sprint.SprintNum).First(&s).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				// create new sprint
				s = models.Sprint{
					TeamID:    req.TeamId,
					SprintNum: sprint.SprintNum,
					Grade:     sprint.Grade,
					Comment:   sprint.Comment,
				}
				if err := global.DB.Create(&s).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create sprint"})
					return
				}
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch sprint"})
				return
			}
		} else {
			s.Grade = sprint.Grade
			s.Comment = sprint.Comment
			if err := global.DB.Save(&s).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update sprint"})
				return
			}
		}
	}

	if req.TeamNotification.Content != "" {
		var team models.Team
		if err := global.DB.Where("id = ?", req.TeamNotification.To.TeamID).Preload("Members").First(&team).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}

		notification := models.Notification{
			Content: req.TeamNotification.Content,
		}

		if err := global.DB.Create(&notification).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create notification"})
			return
		}

		for _, member := range team.Members {
			userNotification := models.UserNotifications{
				UserID:         member.ID,
				NotificationID: notification.ID,
			}
			if err := global.DB.Create(&userNotification).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to notify user"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Grade updated successfully"})
}

// @Summary Get all sprint grades of a team
// @Description Get all sprint grades of a team
// @Tags Project Progress
// @Accept json
// @Produce json
// @Param teamId path int true "Team ID"
// @Success 200 {object} response.GradeResponse
// @Failure 400 {object} map[string]string "{"error": "invalid team ID"}"
// @Failure 404 {object} map[string]string "{"error": "no grades found"}"
// @Router /v1/progress/get/grade/{teamId} [get]
func GetGrades(c *gin.Context) {
	teamId := c.Param("teamId")

	var sprints []models.Sprint
	if err := global.DB.Where("team_id = ?", teamId).Find(&sprints).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no grades found"})
		return
	}

	gradeResponse := response.GradeResponse{
		Sprints: make([]response.SprintGrade, len(sprints)),
	}

	for i, sprint := range sprints {
		gradeResponse.Sprints[i] = response.SprintGrade{
			SprintNum: sprint.SprintNum,
			Grade:     sprint.Grade,
			Comment:   sprint.Comment,
		}
	}

	c.JSON(http.StatusOK, gradeResponse)
}

// @Summary Get project progress detail
// @Description Get project progress detail for specific team
// @Tags Project Progress
// @Accept json
// @Produce json
// @Param teamId path int true "Team ID"
// @Success 200 {object} response.ProgressDetailResponse
// @Failure 400 {object} map[string]string "{"error": "invalid team ID"}"
// @Failure 404 {object} map[string]string "{"error": "no details found"}"
// @Router /v1/progress/get/detail/{teamId} [get]
func GetProgressDetail(c *gin.Context) {
	teamId := c.Param("teamId")

	var team models.Team
	if err := global.DB.Where("id = ?", teamId).Preload("Sprints.UserStories").First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no details found"})
		return
	}

	var project models.Project
	if err := global.DB.Where("id = ?", team.AllocatedProject).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "project not found"})
		return
	}

	clientName, clientEmail, tutorName, tutorEmail, coorName, coorEmail := "", "", "", "", "", ""
	var client, tutor, coordinator models.User

	if project.ClientID != nil {
		if err := global.DB.Where("id = ?", project.ClientID).First(&client).Error; err == nil {
			clientName = client.Username
			clientEmail = client.Email
		}
	}

	if project.TutorID != nil {
		if err := global.DB.Where("id = ?", project.TutorID).First(&tutor).Error; err == nil {
			tutorName = tutor.Username
			tutorEmail = tutor.Email
		}
	}

	if project.CoordinatorID != nil {
		if err := global.DB.Where("id = ?", project.CoordinatorID).First(&coordinator).Error; err == nil {
			coorName = coordinator.Username
			coorEmail = coordinator.Email
		}
	}

	progressDetail := response.ProgressDetailResponse{
		ProjectId:   project.ID,
		Title:       project.Name,
		ClientName:  clientName,
		ClientEmail: clientEmail,
		ClientId:    project.ClientID,
		TutorName:   tutorName,
		TutorEmail:  tutorEmail,
		TutorId:     project.TutorID,
		CoorName:    coorName,
		CoorEmail:   coorEmail,
		CoorId:      project.CoordinatorID,
		TeamName:    team.Name,
		TeamId:      team.ID,
		TeamIdShow:  team.TeamIdShow,
		Sprints:     []response.SprintDetail{},
	}

	for _, sprint := range team.Sprints {
		var startDate, endDate string

		if sprint.StartDate != nil && !sprint.StartDate.IsZero() {
			startDate = sprint.StartDate.Format("2006-01-02")
		}
		if sprint.EndDate != nil && !sprint.EndDate.IsZero() {
			endDate = sprint.EndDate.Format("2006-01-02")
		}

		sprintComment := ""
		if sprint.Comment != nil {
			sprintComment = *sprint.Comment
		}

		sprintDetail := response.SprintDetail{
			SprintNum:     sprint.SprintNum,
			SprintGrade:   sprint.Grade,
			SprintComment: sprintComment,
			StartDate:     startDate,
			EndDate:       endDate,
			UserStoryList: []response.UserStoryDetail{},
		}

		for _, us := range sprint.UserStories {
			sprintDetail.UserStoryList = append(sprintDetail.UserStoryList, response.UserStoryDetail{
				UserStoryId:          us.ID,
				UserStoryDescription: us.Description,
				UserStoryStatus:      us.Status,
			})
		}

		progressDetail.Sprints = append(progressDetail.Sprints, sprintDetail)
	}

	c.JSON(http.StatusOK, progressDetail)
}
