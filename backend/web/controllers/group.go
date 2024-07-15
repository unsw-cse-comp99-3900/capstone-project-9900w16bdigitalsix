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

	// 生成6位数的teamIdShow
	teamIdShow := GenerateRandomInt()
	// 创建团队
	team := models.Team{
		Name:       teamName,
		TeamIdShow: teamIdShow,
		Members:    []models.User{user}, // 将创建者加入团队
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
		TeamID:     team.ID,
		TeamName:   team.Name,
		TeamIdShow: teamIdShow,
		TeamMember: []response.TeamMember{
			{
				UserID:     user.ID,
				UserName:   user.Username,
				Email:      user.Email,
				AvatarURL:  user.AvatarURL,
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

	if err := global.DB.Model(&team).Association("Skills").Clear(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear existing skills"})
		return
	}

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
	if err := global.DB.Preload("Members.Skills").Preload("Skills").Where("team_id_show = ?", req.TeamIdShow).First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	user.BelongsToGroup = &team.ID

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
			AvatarURL:  member.AvatarURL,
			UserSkills: memberSkills,
		})
	}

	var teamSkills []string
	for _, skill := range team.Skills {
		teamSkills = append(teamSkills, skill.SkillName)
	}

	response := response.JoinTeamResponse{
		TeamId:     team.ID,
		TeamIdShow: req.TeamIdShow,
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
			AvatarURL:  member.AvatarURL,
			UserSkills: userSkills,
		})
	}

	var teamSkills []string
	for _, skill := range team.Skills {
		teamSkills = append(teamSkills, skill.SkillName)
	}

	response := response.GetTeamProfileResponse{
		TeamId:     team.ID,
		TeamIdShow: team.TeamIdShow,
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

	// 获取用户所属团队的ID
	teamID := *user.BelongsToGroup

	// 将用户从团队中移除
	user.BelongsToGroup = nil
	if err := global.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// 检查团队是否还有其他成员
	var memberCount int64
	global.DB.Model(&models.User{}).Where("belongs_to_group = ?", teamID).Count(&memberCount)
	if memberCount == 0 {
		// 如果没有其他成员，则删除团队
		if err := global.DB.Delete(&models.Team{}, teamID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team"})
			return
		}
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
			ID:        member.ID,
			Name:      member.Username,
			Email:     member.Email,
			AvatarURL: member.AvatarURL,
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
	if err := global.DB.Preload("Skills").Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return
	}

	// 映射到返回的结构体
	var teamResponses []response.TeamListResponse
	for _, team := range teams {
		var teamSkills []string
		for _, skill := range team.Skills {
			teamSkills = append(teamSkills, skill.SkillName)
		}

		teamResponses = append(teamResponses, response.TeamListResponse{
			TeamID:     team.ID,
			TeamIdShow: team.TeamIdShow,
			TeamName:   team.Name,
			TeamSkills: teamSkills,
		})
	}

	c.JSON(http.StatusOK, teamResponses)
}

// @Summary Get Unallocated Team List
// @Description Get all unallocated teams
// @Tags Team
// @Accept  json
// @Produce  json
// @Success 200 {array} response.TeamListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch teams"}"
// @Router /v1/team/get/unallocated/list [get]
func GetUnallocatedTeams(c *gin.Context) {
	var teams []models.Team
	// 只获取未分配项目的团队
	if err := global.DB.Preload("Skills").Where("allocated_project IS NULL").Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return
	}

	var teamResponses []response.TeamListResponse
	for _, team := range teams {
		var teamSkills []string
		for _, skill := range team.Skills {
			teamSkills = append(teamSkills, skill.SkillName)
		}

		teamResponses = append(teamResponses, response.TeamListResponse{
			TeamID:     team.ID,
			TeamIdShow: team.TeamIdShow,
			TeamName:   team.Name,
			TeamSkills: teamSkills,
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

// @Summary Update team preferences
// @Description Update the team preference project for a given user
// @Tags Project Preference
// @Accept json
// @Produce json
// @Param userId path int true "User ID"
// @Param preferences body []forms.PreferenceRequest true "Preferences"
// @Success 200 {string} string "Successfully updated team preferences"
// @Failure 400 {object} map[string]string "{"error": "body error"}"
// @Failure 404 {object} map[string]string "{"error": "User not found"}" or "{"error": "User does not belong to any team"}"
// @Failure 409 {object} map[string]string "{"error": "Team already allocated a project, cannot update preferences"}"
// @Failure 500 {object} map[string]string "{"error": "Failed to retrieve team"}"
// @Router /v1/team/preference/project/{userId} [put]
func UpdateTeamPreferences(c *gin.Context) {
	userId := c.Param("userId")
	var user models.User
	if err := global.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.BelongsToGroup == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User does not belong to any team"})
		return
	}

	teamID := *user.BelongsToGroup

	var team models.Team
    if err := global.DB.First(&team, teamID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve team"})
        return
    }

    if team.AllocatedProject != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Team already allocated a project, cannot update preferences"})
        return
    }

	// 删除 team_preference_projects 表中关于这个团队的所有记录
	if err := global.DB.Where("team_id = ?", teamID).Delete(&models.TeamPreferenceProject{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete existing preferences"})
		return
	}

	var preferences []forms.PreferenceRequest
	if err := c.ShouldBindJSON(&preferences); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for _, pref := range preferences {
		var existingPref response.TeamPreferenceProject
		if err := global.DB.Where("team_id = ? AND project_id = ?", teamID, pref.ProjectID).First(&existingPref).Error; err != nil {
			// Create new preference
			newPref := response.TeamPreferenceProject{
				TeamID:    teamID,
				ProjectID: pref.ProjectID,
				Reason:    pref.Reason,
			}
			global.DB.Create(&newPref)
		} else {
			// Update existing preference
			existingPref.Reason = pref.Reason
			global.DB.Save(&existingPref)
		}
	}

	c.JSON(http.StatusOK, "Successfully updated team preferences")
}


// @Summary Get team preferences
// @Description Get the team preferences for a given user
// @Tags Project Preference
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {array} response.PreferenceResponse
// @Failure 404 {object} map[string]string "{"error": "User not found"}" or {"error": "User does not belong to any team"}
// @Router /v1/team/get/preferences/{userId} [get]
func GetTeamPreferences(c *gin.Context) {
	userId := c.Param("userId")
	var user models.User
	if err := global.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.BelongsToGroup == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User does not belong to any team"})
		return
	}

	var preferences []models.TeamPreferenceProject
	if err := global.DB.Where("team_id = ?", *user.BelongsToGroup).Find(&preferences).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Preferences not found"})
		return
	}

	var responses []response.PreferenceResponse
	for _, pref := range preferences {
		var project models.Project
		if err := global.DB.First(&project, pref.ProjectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		var response response.PreferenceResponse
		response.ProjectID = pref.ProjectID
		response.ProjectTitle = project.Name
		response.Reason = pref.Reason
		responses = append(responses, response)
	}

	c.JSON(http.StatusOK, responses)
}

