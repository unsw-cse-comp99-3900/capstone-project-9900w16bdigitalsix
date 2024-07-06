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

// @Summary Get all users List
// @Description 注意 header  Authorization: Bearer <token>, 返回所有用户列表， 注意 users 表格里面有 Role 字段（int）， 1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin
// @Tags Admin
// @Accept  json
// @Produce  json
// @Param Authorization header string true "Bearer <token>"
// @Success 200 {array} response.UserListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch users"}"
// @Failure 403 {object} map[string]string "{"error": "only admin have permission"}"
// @Failure 401 {object} map[string]string "{"error": "Please login"}"
// @Router /v1/admin/get/user/list [get]
func GetAllUsersInfo(c *gin.Context) {
	var users []models.User
	if err := global.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	// 映射到返回的结构体
	var userResponses []response.UserListResponse
	for _, user := range users {
		userResponses = append(userResponses, response.UserListResponse{
			UserID:    user.ID,
			UserName:  user.Username,
			Email:     user.Email,
			Role:      user.Role,
			AvatarURL: user.AvatarURL,
		})
	}

	c.JSON(http.StatusOK, userResponses)
}

// @Summary Get all tutor List
// @Description 注意 header  Authorization: Bearer <token>, 返回所有 Tutor 列表， 注意 users 表格里面有 Role 字段（int）， 1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin
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
	// 映射到返回的结构体
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
// @Description 注意 header  Authorization: Bearer <token>, 返回所有 Coordinator 列表， 注意 users 表格里面有 Role 字段（int）， 1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin
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
	// 映射到返回的结构体
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
// @Description 修改用户的角色信息, 注意header  Authorization: Bearer <token>，如果用户离开队伍且队伍没有其他成员，解散队伍并删除
// @Tags Admin
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer <token>"
// @Param userId body uint true "用户ID"
// @Param Role body int true "用户角色"
// @Success 200 {object} map[string]string "{"message": "User role updated successfully"}"
// @Failure 400 {object} map[string]string "{"error": "Bad request"}"
// @Failure 401 {object} map[string]string "{"error": "Please login first"}"
// @Failure 403 {object} map[string]string "{"error": ""only admin can change user role""}"
// @Failure 404 {object} map[string]string "{"error": "User not found"}"
// @Failure 500 {object} map[string]string "{"error": "Internal server error"}"
// @Router /v1/admin/modify/user/role [post]
func ModifyUserRole(c *gin.Context) {
	var req struct {
		UserID uint `json:"userId" binding:"required"`
		Role   int  `json:"role" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := global.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 如果用户属于某个队伍且新角色不是学生，将用户从队伍中移除
	if user.BelongsToGroup != nil && req.Role != 1 {
		// 保存用户所属队伍的ID
		teamID := user.BelongsToGroup

		// 将用户从队伍中移除
		user.BelongsToGroup = nil
		if err := global.DB.Save(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 检查队伍是否还有其他成员
		var members []models.User
		if err := global.DB.Where("belongs_to_group = ?", teamID).Find(&members).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 如果队伍没有其他成员，解散队伍并删除
		if len(members) == 0 {
			if err := global.DB.Delete(&models.Team{}, teamID).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}

	// 修改用户角色
	user.Role = req.Role
	if err := global.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

// @Summary Update project coordinator
// @Description 修改 project coordinator，注意 header 需要 Authorization: Bearer <token>
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

	// 检查 tutor 是否存在
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

	c.JSON(http.StatusOK, gin.H{"msg": "Project coordinator updated successfully"})
}

// @Summary Update project tutor
// @Description 更新负责这个 project 的 tutor，注意 header 需要 Authorization: Bearer <token>
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

	// 检查 tutor 是否存在
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

	c.JSON(http.StatusOK, gin.H{"msg": "Project tutor updated successfully"})
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
		Role:          coordinator.Role,
		AvatarURL:     coordinator.AvatarURL,
		Email:         coordinator.Email,
	}

	c.JSON(http.StatusOK, response)
}
