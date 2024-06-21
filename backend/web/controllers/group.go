package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"web/forms"
	"web/global"
	"web/global/response"
	"web/models"
)

// CreateTeam godoc
// @Summary Create a new team
// @Description 创建一个新的团队
// @Tags Team
// @Accept json
// @Produce json
// @Param createTeamForm body forms.CreateTeamForm true "Create Team form"
// @Success 200 {object} response.CreateTeamResponse
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 400 {object} map[string]string "{"error":"User already belongs to a team, cannot create team"}"
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to create team"}"
// @Router /v1/team/create [post]
func CreateTeam(c *gin.Context) {
	var req forms.CreateTeamForm
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := global.DB.Where("id = ?", req.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 检查用户是否已经属于一个团队
	if user.BelongsToGroup != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already belongs to a team, cannot create team"})
		return
	}

	// 创建团队名称
	teamName := fmt.Sprintf("team_%d", time.Now().UnixNano())

	// 创建团队
	team := models.Team{
		Name:    teamName,
		Members: []models.User{user}, // 将创建者加入团队
	}

	if err := global.DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team"})
		return
	}

	// 构建响应数据
	response := response.CreateTeamResponse{
		TeamID:   team.ID,
		TeamName: team.Name,
		TeamMember: []response.TeamMember{
			{UserID: user.ID, UserName: user.Username},
		},
		// TeamSkills: []string{},
	}

	c.JSON(http.StatusOK, response)
}

// UpdateTeamProfile godoc
// @Summary Update Team Profile
// @Description 更新团队的资料和技能
// @Tags Team
// @Accept json
// @Produce json
// @Param teamId path string true "Team ID"
// @Param updateTeamProfileForm body forms.UpdateTeamProfileForm true "Update Team Profile form"
// @Success 200 {object} map[string]string "{"msg":"Updated team profile successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 404 {object} map[string]string "{"error":"Team not found"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to find or create skill"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to add skills to team"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to update team profile"}"
// @Router /v1/team/update/profile/{teamId} [put]
func UpdateTeamProfile(c *gin.Context) {
	var req forms.UpdateTeamProfileForm
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var team models.Team
	if err := global.DB.Preload("Skills").First(&team, c.Param("teamId")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	team.Name = req.TeamName

	// 查找或创建技能
	if len(req.TeamSkills) > 0 {
		var skills []models.Skill
		for _, skillName := range req.TeamSkills {
			var skill models.Skill
			if err := global.DB.Where("skill_name = ?", skillName).FirstOrCreate(&skill, models.Skill{SkillName: skillName}).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find or create skill"})
				return
			}
			skills = append(skills, skill)
		}

		// 将技能添加到团队
		if err := global.DB.Model(&team).Association("Skills").Replace(skills); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add skills to team"})
			return
		}
	}

	if err := global.DB.Model(&team).Updates(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team profile"})
		fmt.Println("error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "Updated team profile successfuully"})
}


// JoinTeam godoc
// @Summary Join a team
// @Description 用户加入团队
// @Tags Team
// @Accept json
// @Produce json
// @Param joinTeamForm body forms.JoinTeamForm true "Join Team form"
// @Success 200 {object} response.JoinTeamResponse
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Failure 404 {object} map[string]string "{"error":"Team not found"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to update user"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to update team"}"
// @Router /v1/team/join [put]
func JoinTeam(c *gin.Context) {
	var req forms.JoinTeamForm
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := global.DB.First(&user, req.UserId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var team models.Team
	if err := global.DB.Preload("Members").Preload("Skills").First(&team, req.TeamId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	user.BelongsToGroup = &req.TeamId

	if err := global.DB.Model(&user).Updates(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	team.Members = append(team.Members, user)
	if err := global.DB.Model(&team).Updates(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team"})
		return
	}

	var teamMembers []response.TeamMember
	for _, member := range team.Members {
		teamMembers = append(teamMembers, response.TeamMember{
			UserID:   member.ID,
			UserName: member.Username,
		})
	}

	var teamSkills []string
	for _, skill := range team.Skills {
		teamSkills = append(teamSkills, skill.SkillName)
	}

	response := response.JoinTeamResponse{
		TeamId:     team.ID,
		TeamName:   team.Name,
		TeamMember: teamMembers,
		TeamSkills: teamSkills,
	}

	c.JSON(http.StatusOK, response)
}


// GetTeamProfile godoc
// @Summary Get Team Profile
// @Description 获取用户所属团队的信息
// @Tags Team
// @Accept json
// @Produce json
// @Param userId path string true "User ID"
// @Success 200 {object} response.GetTeamProfileResponse
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Failure 404 {object} map[string]string "{"error":"User does not belong to any team"}"
// @Failure 404 {object} map[string]string "{"error":"Team not found"}"
// @Router /v1/team/profile/{userId} [get]
func GetTeamProfile(c *gin.Context) {
	userId := c.Param("userId")

	var user models.User
	if err := global.DB.Preload("Teams").Preload("Teams.Skills").Preload("Teams.Members").First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.BelongsToGroup == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User does not belong to any team"})
		return
	}

	var team models.Team
	if err := global.DB.Preload("Skills").Preload("Members").First(&team, *user.BelongsToGroup).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	var teamMembers []response.TeamMember
	for _, member := range team.Members {
		teamMembers = append(teamMembers, response.TeamMember{
			UserID:   member.ID,
			UserName: member.Username,
		})
	}

	var teamSkills []string
	for _, skill := range team.Skills {
		teamSkills = append(teamSkills, skill.SkillName)
	}

	response := response.GetTeamProfileResponse{
		TeamId:     team.ID,
		TeamName:   team.Name,
		TeamMember: teamMembers,
		TeamSkills: teamSkills,
	}

	c.JSON(http.StatusOK, response)
	
}

// LeaveTeam godoc
// @Summary Leave a team
// @Description 用户离开团队
// @Tags Team
// @Accept json
// @Produce json
// @Param leaveTeamForm body forms.LeaveTeamForm true "Leave Team form"
// @Success 200 {object} map[string]string "{"msg":"User has left the team successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 400 {object} map[string]string "{"error":"User does not belong to any team"}"
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to update user"}"
// @Router /v1/team/leave [delete]
func LeaveTeam(c *gin.Context) {
	var req forms.LeaveTeamForm
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := global.DB.First(&user, req.UserId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.BelongsToGroup == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User does not belong to any team"})
		return
	}

	user.BelongsToGroup = nil
	if err := global.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "User has left the team successfully"})
}



func InviteToTeam(c *gin.Context) {
	var input struct {
		UserID uint `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var group models.Team
	if err := global.DB.Where("id = ?", c.Param("id")).First(&group).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}

	var user models.User
	if err := global.DB.Where("id = ?", input.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.BelongsToGroup = &group.ID
	global.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"msg": "invite student to group successfully",
	})
}
