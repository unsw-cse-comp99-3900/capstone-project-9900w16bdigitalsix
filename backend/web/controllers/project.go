package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"web/forms"
	"web/global"
	"web/global/response"
	"web/models"
)

// CreateProject godoc
// @Summary Clinet create a new project
// @Description client 创建一个新的项目并上传文件, this api makes sure only client can create the project
// @Tags Project
// @Accept multipart/form-data
// @Produce json
// @Param title formData string true "Project Title"
// @Param field formData string true "Project Field"
// @Param description formData string true "Project Description"
// @Param email formData string true "Clinet Email"
// @Param requiredSkills[] formData array false "Required Skills" items(type=string)
// @Param file formData file false "upload file"
// @Success 200 {object} map[string]interface{} "{"msg": "Project created successfully", "projectId": 1, "fileName": "filename.pdf", "filePath": "backend/files/filename.pdf", "createdBy": 1}"
// @Failure 400 {object} map[string]interface{} "{"error": "Invalid email"}"
// @Failure 404 {object} map[string]interface{} "{"error": "Client not found"}"
// @Failure 500 {object} map[string]interface{} "{"error": "Failed to save file"} or {"error": "Failed to create project"} or {"error": "Failed to find or create skill"} or {"error": "Failed to associate skills"}"
// @Router /v1/project/create [post]
func CreateProject(c *gin.Context) {
	var fileName string
	var fileURL string

	// 解析其他字段
	title := c.PostForm("title")
	field := c.PostForm("field")
	description := c.PostForm("description")
	email := c.PostForm("email")
	requiredSkills := c.PostFormArray("requiredSkills[]")

	// 检查客户是否存在
	var client models.User
	if err := global.DB.Where("email = ?", email).First(&client).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Client not found"})
		return
	}

	// 检查客户的角色是否为客户端
	if client.Role != 3 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only client can create project"})
		return
	}

	// 解析文件
	file, err := c.FormFile("file")
	if err == nil {
		// 创建上传目录
		uploadDir := global.ServerConfig.FilePath
		if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
			os.Mkdir(uploadDir, os.ModePerm)
		}

		// 保存文件到本地存储
		fileURL = filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, fileURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		fileName = file.Filename
		host := global.ServerConfig.Host
		port := global.ServerConfig.Port
		fileURL = fmt.Sprintf("http://%s:%d/files/%s", host, port, fileName)

	} else if err != http.ErrMissingFile {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upload file"})
		return
	}

	clientID := client.ID

	// 创建项目
	project := models.Project{
		Name:        title,
		Field:       field,
		Description: description,
		ClientID:    &clientID, // 存储创建者ID
	}

	// 如果有上传文件，则保存文件名和文件路径
	if fileURL != "" {
		project.Filename = fileName
		project.FileURL = fileURL
	}

	if err := global.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project"})
		return
	}

	// 处理所需技能
	var skills []models.Skill
	for _, skillName := range requiredSkills {
		var skill models.Skill
		if err := global.DB.Where("skill_name = ?", skillName).First(&skill).Error; err != nil {
			if gorm.ErrRecordNotFound == err {
				skill = models.Skill{SkillName: skillName}
				global.DB.Create(&skill)
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find or create skill"})
				return
			}
		}
		skills = append(skills, skill)
	}

	// 更新项目的技能关联
	if err := global.DB.Model(&project).Association("Skills").Replace(skills); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to associate skills"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"msg":       "Project created successfully",
		"projectId": project.ID,
		"fileName":  project.Filename,
		"fileURL":   project.FileURL,
		"createdBy": client.ID,
	})
}

// GetProjectList godoc
// @Summary Get pubilic project list
// @Description is_public 字段 1表示 public， 2 表示未公开, 这里返回的公开的 project 信息
// @Tags Project
// @Produce json
// @Success 200 {array} response.GetProjectListResponse
// @Failure 500 {object} map[string]string "{"error": string}"
// @Router /v1/project/get/public_project/list [get]
func GetProjectList(c *gin.Context) {
	var projects []models.Project
	if err := global.DB.Preload("Teams").Preload("Skills").Where("is_public = ?", 1).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve projects"})
		return
	}

	var projectResponses []response.ProjectDetailResponse
	for _, project := range projects {
		var client models.User
		var tutor models.User
		var coordinator models.User

		global.DB.First(&client, project.ClientID)
		global.DB.First(&tutor, project.TutorID)
		global.DB.First(&coordinator, project.CoordinatorID)

		allocatedTeams := []response.AllocatedTeam{}
		for _, team := range project.Teams {
			allocatedTeams = append(allocatedTeams, response.AllocatedTeam{
				TeamID:   team.ID,
				TeamName: team.Name,
			})
		}

		projectResponse := response.ProjectDetailResponse{
			ProjectID:        project.ID,
			Title:            project.Name,
			ClientName:       client.Username,
			ClientEmail:      client.Email,
			ClientID:         client.ID,
			TutorID:          tutor.ID,
			TutorName:        tutor.Username,
			TutorEmail:       tutor.Email,
			CoordinatorID:    coordinator.ID,
			CoordinatorName:  coordinator.Username,
			CoordinatorEmail: coordinator.Email,
			RequiredSkills:   ExtractSkillNames(project.Skills),
			Field:            project.Field,
			Description:      project.Description,
			SpecLink:         project.FileURL,
			AllocatedTeam:    allocatedTeams,
		}

		projectResponses = append(projectResponses, projectResponse)
	}

	c.JSON(http.StatusOK, projectResponses)
}

// @Summary Get project detail by projectID
// @Description 根据项目ID获取项目的详细信息
// @Tags Project
// @Produce json
// @Param projectId path uint true "项目ID"
// @Success 200 {object} response.ProjectDetailResponse
// @Failure 404 {object} map[string]string "{"error": "Project not found"}"
// @Failure 500 {object} map[string]string "{"error": "Internal Server Error"}"
// @Router /v1/project/detail/{projectId} [get]
func GetProjectDetail(c *gin.Context) {
	var project models.Project
	projectId := c.Param("projectId")
	if err := global.DB.Preload("Teams").Preload("Skills").First(&project, projectId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var client models.User
	var tutor models.User
	var coordinator models.User

	global.DB.First(&client, project.ClientID)
	global.DB.First(&tutor, project.TutorID)
	global.DB.First(&coordinator, project.CoordinatorID)

	allocatedTeams := []response.AllocatedTeam{}
	for _, team := range project.Teams {
		allocatedTeams = append(allocatedTeams, response.AllocatedTeam{
			TeamID:   team.ID,
			TeamName: team.Name,
		})
	}

	response := response.ProjectDetailResponse{
		ProjectID:        project.ID,
		Title:            project.Name,
		ClientName:       client.Username,
		ClientEmail:      client.Email,
		ClientID:         client.ID,
		TutorID:          tutor.ID,
		TutorName:        tutor.Username,
		TutorEmail:       tutor.Email,
		CoordinatorID:    coordinator.ID,
		CoordinatorName:  coordinator.Username,
		CoordinatorEmail: coordinator.Email,
		RequiredSkills:   ExtractSkillNames(project.Skills),
		Field:            project.Field,
		Description:      project.Description,
		SpecLink:         project.FileURL,
		AllocatedTeam:    allocatedTeams,
	}

	c.JSON(http.StatusOK, response)
}

// DeleteProject godoc
// @Summary Delete project
// @Description 根据项目ID删除项目
// @Tags Project
// @Produce json
// @Param projectId path int true "Project ID"
// @Success 200 {object} map[string]interface{} "{"success": bool}"
// @Failure 404 {object} map[string]string "{"error": string}"
// @Failure 500 {object} map[string]string "{"error": string}"
// @Router /v1/project/delete/{projectId} [delete]
func DeleteProject(c *gin.Context) {
	projectId := c.Param("projectId")
	var project models.Project

	// 检查项目是否存在
	if err := global.DB.First(&project, projectId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 删除项目
	if err := global.DB.Delete(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// ModifyProjectDetail godoc
// @Summary Modify project detail information
// @Description 通过 projectId 修改项目详细信息，并更新项目的 client, this api makes sure Projects can only be assigned to clients
// @Tags Project
// @Accept multipart/form-data
// @Produce json
// @Param projectId path int true "Project ID"
// @Param title formData string true "Project Title"
// @Param clientEmail formData string true "Client Email"
// @Param requiredSkills formData array false "Required Skills" items(type=string)
// @Param field formData string true "Project Field"
// @Param description formData string true "Project Description"
// @Param spec formData file false "Specification File"
// @Success 200 {object} response.ModifyProjectDetailResponse
// @Failure 400 {object} map[string]string "{"error": "File not provided"}"
// @Failure 403 {object} map[string]string "{"error": "Project can only be assigned to client"}"
// @Failure 404 {object} map[string]string "{"error": "Project not found"}"
// @Failure 500 {object} map[string]string "{"error": Internal Error}"
// @Router /v1/project/modify/{projectId} [post]
func ModifyProjectDetail(c *gin.Context) {
	projectId := c.Param("projectId")
	var fileName, fileURL string
	var project models.Project

	// 检查项目是否存在
	if err := global.DB.First(&project, projectId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 解析表单数据
	title := c.PostForm("title")
	clientEmail := c.PostForm("clientEmail")
	requiredSkills := c.PostFormArray("requiredSkills[]")
	field := c.PostForm("field")
	description := c.PostForm("description")

	// 查找用户
	var user models.User
	if err := global.DB.Where("email = ?", clientEmail).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 检查客户的角色是否为 clinet
	if user.Role != 3 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Project can only be assigned to client"})
		return
	}

	// 获取文件
	file, err := c.FormFile("spec")
	if err == nil { // 上传了文件
		uploadDir := global.ServerConfig.FilePath
		// 保存文件到本地存储
		fileURL = filepath.Join(uploadDir, file.Filename)
		if err := c.SaveUploadedFile(file, fileURL); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		fileName = file.Filename
		host := global.ServerConfig.Host
		port := global.ServerConfig.Port
		fileURL = fmt.Sprintf("http://%s:%d/files/%s", host, port, fileName)
	}

	// 更新项目数据
	project.Name = title
	project.Field = field
	project.Description = description
	project.FileURL = fileURL
	project.ClientID = &user.ID

	// 更新技能 关联表(project_skills）
	var skills []models.Skill
	if len(requiredSkills) > 0 {
		for _, skillName := range requiredSkills {
			var skill models.Skill
			if err := global.DB.Where("skill_name = ?", skillName).First(&skill).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					// 如果技能不存在，则创建新技能
					skill = models.Skill{SkillName: skillName}
					if err := global.DB.Create(&skill).Error; err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create new skill"})
						return
					}
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}
			skills = append(skills, skill)
		}
		global.DB.Model(&project).Association("Skills").Replace(skills)
	}

	// 保存项目更新
	if err := global.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response.ModifyProjectDetailResponse{
		Message:         "Project detail modified successfully",
		CreatedBy:       user.Username,
		CreatedByUserID: user.ID,
		CreatedByEmail:  user.Email,
	})
}

// @Summary Get allocated team details
// @Description 查看一个 project 被 allocated 的所有 team 的信息
// @Tags Project Allocation
// @Produce json
// @Param projectId path int true "Project ID"
// @Success 200 {array} response.TeamDetailResponse
// @Failure 404 {object} map[string]string "{"error": "Project not found"}" or "{"error": "Teams not found"}"
// @Router /v1/project/team/allocated/{projectId} [get]
func GetAllocatedTeamDetail(c *gin.Context) {
	projectId := c.Param("projectId")
	var project models.Project
	if err := global.DB.First(&project, projectId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var teams []models.Team
	if err := global.DB.Where("allocated_project = ?", project.ID).Preload("Members").Preload("Skills").Find(&teams).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teams not found"})
		return
	}

	var responses []response.TeamDetailResponse
	for _, team := range teams {
		var members []response.ProjectTeamMember
		for _, member := range team.Members {
			members = append(members, response.ProjectTeamMember{
				UserID:    member.ID,
				UserName:  member.Username,
				AvatarURL: member.AvatarURL,
			})
		}

		var skills []string
		for _, skill := range team.Skills {
			skills = append(skills, skill.SkillName)
		}

		var preference models.TeamPreferenceProject
		if err := global.DB.Where("team_id = ? AND project_id = ?", team.ID, project.ID).First(&preference).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Preference reason not found"})
			return
		}

		responses = append(responses, response.TeamDetailResponse{
			TeamID:           team.ID,
			TeamIdShow:       team.TeamIdShow,
			TeamName:         team.Name,
			TeamMember:       members,
			TeamSkills:       skills,
			PreferenceReason: preference.Reason,
		})
	}

	c.JSON(http.StatusOK, responses)
}

// @Summary Get  unallocated teams that prefer a project
// @Description Get the detail of unallocated teams that prefer a given project ID
// @Tags Project Preference
// @Produce json
// @Param projectId path int true "Project ID"
// @Success 200 {array} response.TeamDetailResponse
// @Failure 404 {object} map[string]string "{"error": "Project not found"}" or "{"error": "Teams not found"}" or ""No unallocated teams found""
// @Router /v1/project/preferencedBy/team/{projectId} [get]
func GetPreferencedByTeamsDetail(c *gin.Context) {
	projectId := c.Param("projectId")
	var project models.Project
	if err := global.DB.First(&project, projectId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	var preferences []models.TeamPreferenceProject
	if err := global.DB.Where("project_id = ?", project.ID).Find(&preferences).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Preferences not found"})
		return
	}

	var teamResponse []response.TeamDetailResponse
	for _, pref := range preferences {
		var team models.Team
		if err := global.DB.Preload("Members").Preload("Skills").First(&team, pref.TeamID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}

		// 检查团队是否没有被分配项目
		if team.AllocatedProject == nil {
			var members []response.ProjectTeamMember
			for _, member := range team.Members {
				members = append(members, response.ProjectTeamMember{
					UserID:    member.ID,
					UserName:  member.Username,
					AvatarURL: member.AvatarURL,
				})
			}

			var skills []string
			for _, skill := range team.Skills {
				skills = append(skills, skill.SkillName)
			}

			teamResponse = append(teamResponse, response.TeamDetailResponse{
				TeamID:           team.ID,
				TeamIdShow:       team.TeamIdShow,
				TeamName:         team.Name,
				TeamMember:       members,
				TeamSkills:       skills,
				PreferenceReason: pref.Reason,
			})
		}
	}

	if len(teamResponse) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No unallocated teams found"})
		return
	}

	c.JSON(http.StatusOK, teamResponse)
}

// @Summary Get project preferred by team detail
// @Description Get the details of a team that prefer a project
// @Tags Project Preference
// @Produce json
// @Param projectId path int true "Project ID"
// @Param teamId path int true "Team ID"
// @Success 200 {object} response.TeamDetailResponse
// @Failure 404 {object} map[string]string "{"error": "Project not found"}" or "{"error": "Team not found"}"
// @Router /v1/project/{projectId}/preferencedBy/{teamId}/detail [get]
func GetProjectPreferencedByTeamDetail(c *gin.Context) {
	projectId := c.Param("projectId")
	teamId := c.Param("teamId")

	var preference models.TeamPreferenceProject
	if err := global.DB.Where("project_id = ? AND team_id = ?", projectId, teamId).First(&preference).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Preference not found"})
		return
	}

	// var team models.Team
	// if err := global.DB.Preload("Members").Preload("Skills").First(&team, teamId).Error; err != nil {
	// 	c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
	// 	return
	// }

	var team models.Team
	if err := global.DB.Preload("Members.Skills").Preload("Skills").First(&team, teamId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	var members []response.ProjectTeamMember
	for _, member := range team.Members {
		var userSkills []string
		for _, skill := range member.Skills {
			userSkills = append(userSkills, skill.SkillName)
		}

		members = append(members, response.ProjectTeamMember{
			UserID:     member.ID,
			UserName:   member.Username,
			AvatarURL:  member.AvatarURL,
			UserEmail:  member.Email,
			UserSkills: userSkills,
		})
	}

	var skills []string
	for _, skill := range team.Skills {
		skills = append(skills, skill.SkillName)
	}

	response := response.TeamDetailResponse{
		TeamID:           team.ID,
		TeamIdShow:       team.TeamIdShow,
		TeamName:         team.Name,
		TeamMember:       members,
		TeamSkills:       skills,
		PreferenceReason: preference.Reason,
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Agree to allocate a Project to a Team
// @Description Allocate a project to a team and send notification to team members
// @Tags Project Allocation
// @Accept json
// @Produce json
// @Param projectId body int true "Project ID"
// @Param teamId body int true "Team ID"
// @Param notification body forms.TeamNotification true "Notification Content and To"
// @Success 200 {object} map[string]string "message: Project allocated and notification sent successfully"
// @Failure 400 {object} map[string]string "error: Error message"
// @Failure 404 {object} map[string]string "error: Team not found"
// @Failure 500 {object} map[string]string "error: Internal server error"
// @Router /v1/team/project/allocation [put]
func ProjectAllocation(c *gin.Context) {
	var req forms.ProjectAllocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 更新团队的 AllocatedProject 字段
	var team models.Team
	if err := global.DB.Preload("Members").First(&team, req.TeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}
	team.AllocatedProject = &req.ProjectID
	if err := global.DB.Save(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team"})
		return
	}

	// 收集用户ID
	userIds := make([]uint, len(team.Members))
	for i, member := range team.Members {
		userIds[i] = member.ID
	}

	// 处理通知
	if err := handleNotification(req.Notification.Content, userIds); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project allocated and notification sent successfully"})
}

// @Summary Reject a team allocation
// @Description 检查团队是否已经被分配了项目，如果已经分配了项目，则取消分配并发送通知
// @Tags Project Allocation
// @Accept json
// @Produce json
// @Param projectId body int true "Project ID"
// @Param teamId body int true "Team ID"
// @Param notification body forms.TeamNotification true "Notification Content and To"
// @Success 200 {object} map[string]string "message: Allocation canceled and notification sent successfully"
// @Failure 400 {object} map[string]string "error: Error message"
// @Failure 404 {object} map[string]string "error: Team not found or not allocated"
// @Failure 500 {object} map[string]string "error: Internal server error"
// @Router /v1/team/project/reject [put]
func RejectProjectAllocation(c *gin.Context) {
	var req forms.ProjectAllocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var team models.Team
	if err := global.DB.Preload("Members").First(&team, req.TeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// 检查团队是否已经被分配了项目
	if team.AllocatedProject == nil || *team.AllocatedProject != req.ProjectID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not allocated to this project"})
		return
	}

	// 取消分配，将 allocatedProject 字段清空
	team.AllocatedProject = nil
	if err := global.DB.Save(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team"})
		return
	}

	// 收集用户ID
	userIds := make([]uint, len(team.Members))
	for i, member := range team.Members {
		userIds[i] = member.ID
	}

	// 处理通知
	if err := handleNotification(req.Notification.Content, userIds); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Allocation canceled and notification sent successfully"})
}

// GetProjectsByRole godoc
// @Summary get public project list by user role
// @Description Get a list of the corresponding public projects based on the userID and role. If the user is a student (role == 1), the projects assigned by the team the user belongs to are returned; if the user is a client (role == 3) or a coordinator (role == 4), all the public projects for which they are each responsible are returned.
// @Tags Project
// @Accept json
// @Produce json
// @Param userId path int true "用户ID"
// @Success 200 {array} response.GetProjectListResponse
// @Failure 400 {object} map[string]string "{"error": "Invalid userId"}""
// @Failure 404 {object} map[string]string "{"error": "User not found", "error": "Team not found", "error": "Project not found"}"
// @Failure 403 {object} map[string]string "{"error": "User does not have the required role"}"
// @Failure 500 {object} map[string]string "{"error": "Internal Server Error"}"
// @Router /v1/project/get/list/byRole/{userId} [get]
func GetProjectsByRole(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId"})
		return
	}

	var user models.User
	if err := global.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var projects []models.Project

	switch user.Role {
	case 1:
		var team models.Team
		if err := global.DB.First(&team, user.BelongsToGroup).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		if team.AllocatedProject != nil {
			var project models.Project
			if err := global.DB.Preload("Skills").Preload("Teams").Where("id = ? AND is_public = ?", *team.AllocatedProject, 1).First(&project).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
				return
			}
			projects = append(projects, project)
		}
	case 3:
		if err := global.DB.Preload("Skills").Preload("Teams").Where("client_id = ? AND is_public = ?", userId, 1).Find(&projects).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	case 4:
		if err := global.DB.Preload("Skills").Preload("Teams").Where("coordinator_id = ? AND is_public = ?", userId, 1).Find(&projects).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	default:
		c.JSON(http.StatusForbidden, gin.H{"error": "User does not have the required role"})
		return
	}

	var projectDetails []response.GetProjectListResponse
	for _, project := range projects {
		var client models.User
		var tutor models.User
		var coordinator models.User
		global.DB.First(&client, project.ClientID)
		global.DB.First(&tutor, project.TutorID)
		global.DB.First(&coordinator, project.CoordinatorID)

		var requiredSkills []string
		for _, skill := range project.Skills {
			requiredSkills = append(requiredSkills, skill.SkillName)
		}

		var allocatedTeams []response.AllocatedTeam
		for _, team := range project.Teams {
			allocatedTeams = append(allocatedTeams, response.AllocatedTeam{
				TeamID:   team.ID,
				TeamName: team.Name,
			})
		}

		projectDetails = append(projectDetails, response.GetProjectListResponse{
			ProjectID:        project.ID,
			Title:            project.Name,
			ClientID:         client.ID,
			ClientName:       client.Username,
			ClientEmail:      client.Email,
			TutorID:          tutor.ID,
			TutorName:        tutor.Username,
			TutorEmail:       tutor.Email,
			CoordinatorID:    coordinator.ID,
			CoordinatorName:  coordinator.Username,
			CoordinatorEmail: coordinator.Email,
			RequiredSkills:   requiredSkills,
			Field:            project.Field,
			AllocatedTeam:    allocatedTeams,
		})
	}

	c.JSON(http.StatusOK, projectDetails)
}
