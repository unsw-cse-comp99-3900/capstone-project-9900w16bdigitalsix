package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/agnivade/levenshtein"
	"github.com/gin-gonic/gin"

	"web/forms"
	"web/global"
	"web/global/response"
	"web/models"
)

// @Summary Search unallocated team list by team skills or teamIdShow
// @Description Search unallocated team list based on team skills or teamIdShow
// @Tags Search
// @Accept  json
// @Produce  json
// @Param body body forms.SearchTeamRequest true "Request Body"
// @Success 200 {array} response.SearchTeamResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch teams"}"
// @Router /v1/search/team/list/detail [post]
func SearchUnallocatedTeams(c *gin.Context) {
	var req forms.SearchTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var teams []models.Team

	// search by teamIdShow
	if len(req.SearchList) == 1 {
		if idShow, err := strconv.Atoi(req.SearchList[0]); err == nil {
			if fetchTeamsByIDShow(c, req.ProjectId, uint(idShow), &teams) {
				return
			}
		}
	}

	// search by teamSkills
	if fetchTeamsBySkills(c, req.ProjectId, req.SearchList, &teams) {
		return
	}

	c.JSON(http.StatusOK, formatSearchTeamResponse(teams))
}

func fetchTeamsByIDShow(c *gin.Context, projectId uint, idShow uint, teams *[]models.Team) bool {
	if err := global.DB.Preload("Skills").Preload("Members").
		Joins("JOIN team_preference_projects ON team_preference_projects.team_id = teams.id").
		Where("team_preference_projects.project_id = ? AND teams.allocated_project IS NULL AND teams.team_id_show = ?", projectId, idShow).
		Find(teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return true
	}

	if len(*teams) > 0 {
		c.JSON(http.StatusOK, formatSearchTeamResponse(*teams))
		return true
	}

	return false
}

func fetchTeamsBySkills(c *gin.Context, projectId uint, searchList []string, teams *[]models.Team) bool {
	query := global.DB.Preload("Skills").Preload("Members").
		Joins("JOIN team_preference_projects ON team_preference_projects.team_id = teams.id").
		Where("team_preference_projects.project_id = ? AND teams.allocated_project IS NULL", projectId)

	for _, searchTerm := range searchList {
		searchTerm = strings.ToLower(searchTerm)
		// query = query.Where("EXISTS (SELECT 1 FROM team_skills ts JOIN skills s ON ts.skill_id = s.id WHERE ts.team_id = teams.id AND LOWER(s.skill_name) LIKE ?)", "%"+searchTerm+"%")
		existsQuery := "EXISTS (SELECT 1 FROM team_skills ts JOIN skills s ON ts.skill_id = s.id WHERE ts.team_id = teams.id AND LOWER(s.skill_name) LIKE ?)"
		query = query.Where(existsQuery, "%"+searchTerm+"%")

	}

	if err := query.Find(teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return true
	}

	return false
}

func formatSearchTeamResponse(teams []models.Team) []response.SearchTeamResponse {
	var teamResponses []response.SearchTeamResponse
	for _, team := range teams {
		var teamSkills []string
		for _, skill := range team.Skills {
			teamSkills = append(teamSkills, skill.SkillName)
		}

		var teamMembers []response.TeamMember2
		for _, member := range team.Members {
			teamMembers = append(teamMembers, response.TeamMember2{
				UserID:    member.ID,
				UserName:  member.Username,
				Email:     member.Email,
				AvatarURL: member.AvatarURL,
			})
		}

		teamResponses = append(teamResponses, response.SearchTeamResponse{
			TeamId:     team.ID,
			TeamIdShow: team.TeamIdShow,
			TeamName:   team.Name,
			TeamMember: teamMembers,
			TeamSkills: teamSkills,
		})
	}
	return teamResponses
}

// SearchPublicProjects godoc
// @Summary Search public projects by title or field
// @Description Search for public projects by title or field, fuzzy matching, and support for similarity thresholds
// @Tags Search
// @Accept json
// @Produce json
// @Param filterString path string true "过滤字符串"
// @Success 200 {array} response.GetProjectListResponse
// @Failure 400 {object} map[string]string "{"error": "Invalid filter string"}"
// @Failure 500 {object} map[string]string "{"error": "Internal Server Error"}"
// @Router /v1/search/public/project/{filterString} [get]
func SearchPublicProjects(c *gin.Context) {
	filterString := c.Param("filterString")
	if filterString == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filter string"})
		return
	}

	var projects []models.Project
	if err := global.DB.Preload("Skills").Preload("Teams").Where("is_public = ?", 1).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	var matchingProjects []models.Project
	for _, project := range projects {
		titleSimilarity := similarity(strings.ToLower(project.Name), strings.ToLower(filterString))
		fieldSimilarity := similarity(strings.ToLower(project.Field), strings.ToLower(filterString))

		if titleSimilarity >= 0.5 || fieldSimilarity >= 0.5 {
			matchingProjects = append(matchingProjects, project)
		}
	}

	var projectDetails []response.GetProjectListResponse
	for _, project := range matchingProjects {
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

func similarity(a, b string) float64 {
	distance := levenshtein.ComputeDistance(a, b)
	length := max(len(a), len(b))
	return 1 - float64(distance)/float64(length)
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
