package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"web/forms"
	"web/global"
	"web/global/response"
	"web/models"
)

// @Summary Get all tutor List
// @Description  header  Authorization: Bearer <token>, get all Tutor list
// @Tags Admin
// @Accept  json
// @Produce  json
// @Param Authorization header string true "Bearer <token>"
// @Success 200 {array} response.UserListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch tutors"}"
// @Failure 403 {object} map[string]string "{"error": "only admin have permission to access"}"
// @Failure 401 {object} map[string]string "{"error": "Please login"}"
// @Router /v1/admin/get/tutor/list [get]
func GetAllTutorInfo(c *gin.Context) {
	var tutors []models.User
	if err := global.DB.Where("role = ?", 2).Find(&tutors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tutors"})
		return
	}

	var tutorResponses []response.UserListResponse
	for _, tutor := range tutors {
		tutorResponses = append(tutorResponses, response.UserListResponse{
			UserID:    tutor.ID,
			UserName:  tutor.Username,
			Email:     tutor.Email,
			Role:      tutor.Role,
			AvatarURL: tutor.AvatarURL,
		})
	}

	c.JSON(http.StatusOK, tutorResponses)
}

// @Summary Get all coordinator List
// @Description note header  Authorization: Bearer <token>, return all Coordinator list
// @Tags Admin
// @Accept  json
// @Produce  json
// @Param Authorization header string true "Bearer <token>"
// @Success 200 {array} response.UserListResponse
// @Failure 500 {object} map[string]string "{"error": "internal server error, Failed to fetch tutors"}"
// @Failure 403 {object} map[string]string "{"error": "only admin have permission to access"}"
// @Failure 401 {object} map[string]string "{"error": "Please login"}"
// @Router /v1/admin/get/coordinator/list [get]
func GetAllCoordinatorInfo(c *gin.Context) {
	var tutors []models.User
	if err := global.DB.Where("role = ?", 4).Find(&tutors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch coordinator"})
		return
	}

	var tutorResponses []response.UserListResponse
	for _, tutor := range tutors {
		tutorResponses = append(tutorResponses, response.UserListResponse{
			UserID:    tutor.ID,
			UserName:  tutor.Username,
			Email:     tutor.Email,
			Role:      tutor.Role,
			AvatarURL: tutor.AvatarURL,
		})
	}

	c.JSON(http.StatusOK, tutorResponses)
}

// @Summary Modify user role
// @Description change user role, header  Authorization: Bearer <token>，if user leave the team, and team doesn't have member, delete the team
// @Tags Admin
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer <token>"
// @Param data body forms.ModifyUserRoleRequest true "User ID, Role, and Notification"
// @Success 200 {object} map[string]string "{"message": "User role updated successfully"}"
// @Failure 400 {object} map[string]string "{"error": "Bad request"}"
// @Failure 401 {object} map[string]string "{"error": "Please login first"}"
// @Failure 403 {object} map[string]string "{"error": ""only admin can change user role""}"
// @Failure 404 {object} map[string]string "{"error": "User not found"}"
// @Failure 500 {object} map[string]string "{"error": "Internal server error"}"
// @Router /v1/admin/modify/user/role [post]
func ModifyUserRole(c *gin.Context) {
	var req forms.ModifyUserRoleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := global.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Role == 5 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot modify admin role"})
		return
	}

	// if user belongsss to a team, and the role change to other role, deletet the user fronm the team
	if user.BelongsToGroup != nil && req.Role != 1 {

		teamID := user.BelongsToGroup

		user.BelongsToGroup = nil
		if err := global.DB.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// check if team has other student
		var members []models.User
		if err := global.DB.Where("belongs_to_group = ?", teamID).Find(&members).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// if team has no member, delete the team
		if len(members) == 0 {
			if err := global.DB.Delete(&models.Team{}, teamID).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}

	user.Role = req.Role
	if err := global.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := handleNotification(req.Notification.Content, req.Notification.To.Users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role and notification updated successfully"})
}

// @Summary Update project coordinator
// @Description change project coordinator， header need Authorization: Bearer <token>
// @Tags Admin
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer <token>"
// @Param ChangeProjectCoordinatorRequest body forms.ChangeProjectCoordinatorRequest true "修改 coordinator 请求参数"
// @Success 200 {object} map[string]string "{"msg": "Project Coordinator updated successfully"}"
// @Failure 404 {object} map[string]string "{"error": "Coordinator not found"}"
// @Failure 500 {object} map[string]string "{"error": "Failed to update coordinator"}"
// @Failure 403 {object} map[string]string "{"error": "Only admin have permission"}"
// @Failure 401 {object} map[string]string "{"error": "Please login"}"
// @Router /v1/admin/change/project/coordinator [post]
func ChangeProjectCoordinator(c *gin.Context) {
	var req forms.ChangeProjectCoordinatorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check that the tutor exists
	var tutor models.User
	if err := global.DB.Where("id = ? AND role = ?", req.CoordinatorID, 4).First(&tutor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Coordinator not found"})
		return
	}

	var project models.Project
	if err := global.DB.First(&project, req.ProjectID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Project not found"})
		return
	}

	project.CoordinatorID = &req.CoordinatorID
	if err := global.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update coordinator"})
		return
	}

	if err := handleNotification(req.Notification.Content, req.Notification.To.Users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "Project coordinator updated and notification sent successfully"})
}

// @Summary Update project tutor
// @Description update project 的 tutor， header need Authorization: Bearer <token>
// @Tags Admin
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer <token>"
// @Param ChangeProjectTutorRequest body forms.ChangeProjectTutorRequest true "修改 coordinator 请求参数"
// @Success 200 {object} map[string]string "{"msg": "Project tutor updated successfully"}"
// @Failure 500 {object} map[string]string "{"error": "Failed to update tutor"}"
// @Failure 403 {object} map[string]string "{"error": "Only admin have permission"}"
// @Failure 401 {object} map[string]string "{"error": "Please login"}"
// @Failure 404 {object} map[string]string "{"error": "Tutor not found"}"
// @Router /v1/admin/change/project/tutor [post]
func ChangeProjectTutor(c *gin.Context) {
	var req forms.ChangeProjectTutorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check that the tutor exists
	var tutor models.User
	if err := global.DB.Where("id = ? AND role = ?", req.TutorID, 2).First(&tutor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tutor not found"})
		return
	}

	var project models.Project
	if err := global.DB.First(&project, req.ProjectID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Project not found"})
		return
	}

	project.TutorID = &req.TutorID
	if err := global.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tutor"})
		return
	}

	if err := handleNotification(req.Notification.Content, req.Notification.To.Users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "Project tutor updated and notification sent successfully"})
}

// @Summary Get tutor information by project ID
// @Description Get tutor information by project ID
// @Tags Admin
// @Produce json
// @Param projectId path int true "Project ID"
// @Param Authorization header string true "Bearer token"
// @Success 200 {object} response.TutorInfoResponse
// @Failure 400 {object} map[string]string "{"error": Invalid projectId}"
// @Failure 404 {object} map[string]string "{"error": "Project not found"}" or "{"error": "Tutor not found"}"
// @Router /v1/admin/get/tutor/{projectId} [get]
func GetTutorInfoByProjectID(c *gin.Context) {
	projectIdStr := c.Param("projectId")
	projectId, err := strconv.Atoi(projectIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid projectId"})
		return
	}

	var project models.Project
	if err := global.DB.First(&project, projectId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var tutor models.User
	if err := global.DB.First(&tutor, project.TutorID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tutor not found"})
		return
	}

	response := response.TutorInfoResponse{
		TutorID:   tutor.ID,
		Name:      tutor.Username,
		Role:      tutor.Role,
		AvatarURL: tutor.AvatarURL,
		Email:     tutor.Email,
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Get coordinator information by project ID
// @Description Get coordinator information by project ID
// @Tags Admin
// @Produce json
// @Param projectId path int true "Project ID"
// @Param Authorization header string true "Bearer token"
// @Success 200 {object} response.CoorInfoResponse
// @Failure 400 {object} map[string]string "{"error": Invalid projectId}"
// @Failure 404 {object} map[string]string "{"error": "Project not found"}" or "{"error": "Coordinator not found"}"
// @Router /v1/admin/get/coordinator/{projectId} [get]
func GetCoorInfoByProjectID(c *gin.Context) {
	projectIdStr := c.Param("projectId")
	projectId, err := strconv.Atoi(projectIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid projectId"})
		return
	}

	var project models.Project
	if err := global.DB.First(&project, projectId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var coordinator models.User
	if err := global.DB.First(&coordinator, project.CoordinatorID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Coordinator not found"})
		return
	}

	response := response.CoorInfoResponse{
		CoordinatorID: coordinator.ID,
		Name:          coordinator.Username,
		Role:          coordinator.Role,
		AvatarURL:     coordinator.AvatarURL,
		Email:         coordinator.Email,
	}

	c.JSON(http.StatusOK, response)
}
