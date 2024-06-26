package controllers

import (
	"net/http"
	"web/global"
	"web/global/response"
	"web/models"

	"github.com/gin-gonic/gin"
)

// @Summary Get all users List
// @Description 注意 header  Authorization: Bearer <token>, 返回所有用户列表， 注意 users 表格里面有 Role 字段（int）， 1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin
// @Tags Admin
// @Accept  json
// @Produce  json
// @Param Authorization header string true "Bearer <token>"
// @Success 200 {array} response.UserListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch users"}"
// @Failure 403 {object} map[string]string "{"error": "only admin can change user role"}"
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

// @Summary Admin modify user role
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