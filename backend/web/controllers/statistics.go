package controllers

import (
	"net/http"
	"sort"
	"web/global"
	"web/global/response"
	"web/models"

	"github.com/gin-gonic/gin"
)

// GetStatistics godoc
// @Summary Get statistics of projects and teams
// @Description Get total number of students, clients, tutors, coordinators, and top 5 popular project and top 5 popular project field
// @Tags Statistics
// @Accept  json
// @Produce  json
// @Success 200 {object} response.StatisticsResponse
// @Router /v1/project/statistics [get]
func GetStatistics(c *gin.Context) {
	var totalStudents, totalClients, totalTutors, totalCoordinators int64
	var projects []models.Project
	var fieldsStatistics []response.FieldStatistic
	var topProjects []response.ProjectStatistic

	// Counting total number of each role
	global.DB.Model(&models.User{}).Where("role = ?", 1).Count(&totalStudents)
	global.DB.Model(&models.User{}).Where("role = ?", 3).Count(&totalClients)
	global.DB.Model(&models.User{}).Where("role = ?", 2).Count(&totalTutors)
	global.DB.Model(&models.User{}).Where("role = ?", 4).Count(&totalCoordinators)

	// Getting project statistics per field
	global.DB.Preload("Teams").Find(&projects)
	fieldMap := make(map[string]*response.FieldStatistic)
	for _, project := range projects {
		if _, exists := fieldMap[project.Field]; !exists {
			fieldMap[project.Field] = &response.FieldStatistic{Field: project.Field}
		}
		fieldMap[project.Field].Projects++
		fieldMap[project.Field].Teams += len(project.Teams)
	}
	for _, fieldStat := range fieldMap {
		fieldsStatistics = append(fieldsStatistics, *fieldStat)
	}

	// Sorting fields by number of teams and getting top 5
	sort.Slice(fieldsStatistics, func(i, j int) bool {
		return fieldsStatistics[i].Teams > fieldsStatistics[j].Teams
	})
	if len(fieldsStatistics) > 5 {
		fieldsStatistics = fieldsStatistics[:5]
	}

	// Getting top 5 projects with most teams
	projectTeamCounts := make(map[uint]int)
	for _, project := range projects {
		projectTeamCounts[project.ID] = len(project.Teams)
	}
	type projectTeamCount struct {
		Project models.Project
		Teams   int
	}
	var projectTeamCountsSlice []projectTeamCount
	for projectID, teamCount := range projectTeamCounts {
		var project models.Project
		global.DB.First(&project, projectID)
		projectTeamCountsSlice = append(projectTeamCountsSlice, projectTeamCount{
			Project: project,
			Teams:   teamCount,
		})
	}
	sort.Slice(projectTeamCountsSlice, func(i, j int) bool {
		return projectTeamCountsSlice[i].Teams > projectTeamCountsSlice[j].Teams
	})
	if len(projectTeamCountsSlice) > 5 {
		projectTeamCountsSlice = projectTeamCountsSlice[:5]
	}
	for _, ptc := range projectTeamCountsSlice {
		topProjects = append(topProjects, response.ProjectStatistic{
			ProjectID: ptc.Project.ID,
			Title:     ptc.Project.Name,
			Field:     ptc.Project.Field,
			Teams:     ptc.Teams,
		})
	}

	statistics := response.StatisticsResponse{
		TotalStudents:     totalStudents,
		TotalClients:      totalClients,
		TotalTutors:       totalTutors,
		TotalCoordinators: totalCoordinators,
		Fields:            fieldsStatistics,
		Projects:          topProjects,
	}

	c.JSON(http.StatusOK, statistics)
}
