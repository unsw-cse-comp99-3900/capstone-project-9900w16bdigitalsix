package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"web/forms"
	"web/global"
	"web/global/response"
	"web/models"
)

// @Summary Search preference project unallocated team list
// @Description Search unallocated team list based on project preference
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
