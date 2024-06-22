package controllers

import (
	"fmt"
	"math/rand"
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
// @Description 创建 team, 并且创建人加入了 team, 后端随机生成 teamName, 存入了数据库
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
	if err := global.DB.Preload("Skills").Where("id = ?", req.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 检查用户是否已经属于一个团队
	if user.BelongsToGroup != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already belongs to a team, cannot create team"})
		return
	}

	// 获取一个随机数生成器
	src := rand.NewSource(time.Now().UnixNano())
	r := rand.New(src)

	// 生成1到4位数的随机数
	randomNum := GenerateRandomNumber(r)

	// 创建团队名称
	teamName := fmt.Sprintf("team_%d", randomNum)

	// 创建团队
	team := models.Team{
		Name:    teamName,
		Members: []models.User{user}, // 将创建者加入团队
	}

	if err := global.DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team"})
		return
	}

	// 获取用户的技能
	userSkills := make([]string, len(user.Skills))
	for i, skill := range user.Skills {
		userSkills[i] = skill.SkillName
	}

	// 构建响应数据
	response := response.CreateTeamResponse{
		TeamID:   team.ID,
		TeamName: team.Name,
		TeamMember: []response.TeamMember{
			{
				UserID:     user.ID,
				UserName:   user.Username,
				Email:      user.Email,
				UserSkills: userSkills,
			},
		},
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
// @Failure 409 {object} map[string]string "{"error": "User already belongs to a team"}"
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
	if err := global.DB.Preload("Skills").First(&user, req.UserId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 检查用户是否已经属于一个团队
	if user.BelongsToGroup != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already belongs to a team"})
		return
	}

	var team models.Team
	if err := global.DB.Preload("Members.Skills").Preload("Skills").First(&team, req.TeamId).Error; err != nil {
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
		var memberSkills []string
		for _, skill := range member.Skills {
			memberSkills = append(memberSkills, skill.SkillName)
		}
		teamMembers = append(teamMembers, response.TeamMember{
			UserID:     member.ID,
			UserName:   member.Username,
			Email:      member.Email,
			UserSkills: memberSkills,
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
	if err := global.DB.Preload("Skills").First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.BelongsToGroup == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User does not belong to any team"})
		return
	}

	var team models.Team
	if err := global.DB.Preload("Skills").Preload("Members.Skills").First(&team, *user.BelongsToGroup).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	var teamMembers []response.TeamMember
	for _, member := range team.Members {
		var userSkills []string
		for _, skill := range member.Skills {
			userSkills = append(userSkills, skill.SkillName)
		}

		teamMembers = append(teamMembers, response.TeamMember{
			UserID:     member.ID,
			UserName:   member.Username,
			Email:      member.Email,
			UserSkills: userSkills,
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
// @Param   userId  path   string  true  "User ID"
// @Success 200 {object} map[string]string "{"msg":"User has left the team successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 400 {object} map[string]string "{"error":"User does not belong to any team"}"
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to update user"}"
// @Router /v1/team/leave/{userId} [delete]
func LeaveTeam(c *gin.Context) {
	userId := c.Param("userId")

	var user models.User
	if err := global.DB.First(&user, userId).Error; err != nil {
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

// GetStudentInfo godoc
// @Summary Get student list information by team name
// @Description Get student list information by team name
// @Tags Team
// @Accept  json
// @Produce  json
// @Param teamName path string true "Team Name"
// @Success 200 {array} response.StudentInfoResponse
// @Failure 404 {object} map[string]string "{"error": "Team not found"}"
// @Router /v1/team/get/student-info/{teamName} [get]
func GetStudentInfo(ctx *gin.Context) {
	teamName := ctx.Param("teamName")
	var team models.Team
	if err := global.DB.Preload("Members").Where("name = ?", teamName).First(&team).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	var studentInfos []response.StudentInfoResponse
	for _, member := range team.Members {
		studentInfos = append(studentInfos, response.StudentInfoResponse{
			ID:    member.ID,
			Name:  member.Username,
			Email: member.Email,
		})
	}

	ctx.JSON(http.StatusOK, studentInfos)
}

// @Summary Get Team List
// @Description Get all teams
// @Tags Team
// @Accept  json
// @Produce  json
// @Success 200 {array} response.TeamListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch teams"}"
// @Router /v1/team/get/list [get]
func GetAllTeams(c *gin.Context) {
	var teams []models.Team
	if err := global.DB.Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return
	}

	// 映射到返回的结构体
	var teamResponses []response.TeamListResponse
	for _, team := range teams {
		teamResponses = append(teamResponses, response.TeamListResponse{
			TeamID:   team.ID,
			TeamName: team.Name,
		})
	}

	c.JSON(http.StatusOK, teamResponses)
}

// @Summary Invite User to Team
// @Description Invite a student to join a team
// @Tags Team
// @Accept  json
// @Produce  json
// @Param   userId  path   string  true  "User ID"
// @Param   teamId  path   string  true  "Team ID"
// @Success 200 {object} map[string]string "{"message": "User invited to team successfully"}"
// @Failure 400 {object} map[string]string "{"error": "User already belongs to a team"}"
// @Failure 404 {object} map[string]string "{"error": "User not found"} or gin.H{"error": "Team not found"}"
// @Failure 500 {object} map[string]string "{"error": "Failed to invite user to team"}"
// @Router /v1/team/invite/{userId}/{teamId} [get]
func InviteUserToTeam(c *gin.Context) {
	userId := c.Param("userId")
	teamId := c.Param("teamId")

	var user models.User
	if err := global.DB.Where("id = ?", userId).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var team models.Team
	if err := global.DB.Where("id = ?", teamId).First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// 检查用户是否已经属于一个团队
	if user.BelongsToGroup != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already belongs to a team"})
		return
	}

	// 更新用户的 BelongsToGroup 字段
	user.BelongsToGroup = &team.ID
	if err := global.DB.Model(&user).Updates(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to invite user to team"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User invited to team successfully"})
}
