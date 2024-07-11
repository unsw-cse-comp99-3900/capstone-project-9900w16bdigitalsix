package controllers

// import (
// 	"net/http"
// 	"strings"
// 	"web/global"
// 	"web/models"
// 	"web/global/response"

// 	"github.com/gin-gonic/gin"
// )

// // @Summary 搜索团队
// // @Description 通过searchKey在teamIdShow、teamName和teamSkills中进行模糊匹配
// // @Tags Team
// // @Accept json
// // @Produce json
// // @Param searchKey query string true "Search Key"
// // @Success 200 {array} response.Team
// // @Failure 400 {object} map[string]string "{"error": "invalid search key"}"
// // @Router /v1/search/team/detail/{searchKey} [get]
// func SearchTeams(c *gin.Context) {
// 	searchKey := c.Query("searchKey")
// 	if searchKey == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid search key"})
// 		return
// 	}

// 	var teams []models.Team
// 	if err := global.DB.Preload("Members").Preload("Skills").Find(&teams).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch teams"})
// 		return
// 	}

// 	var responseTeams []response.Team
// 	for _, team := range teams {
// 		if matchesSearchKey(team, searchKey) {
// 			var members []response.TeamMember
// 			for _, member := range team.Members {
// 				members = append(members, response.TeamMember{
// 					UserId:     member.ID,
// 					UserEmail:  member.Email,
// 					UserSkills: "", // 需要从其他地方获取用户技能
// 					UserName:   member.Username,
// 					Avatar:     member.AvatarURL,
// 				})
// 			}
// 			var teamSkills []string
// 			for _, skill := range team.Skills {
// 				teamSkills = append(teamSkills, skill.SkillName)
// 			}
// 			responseTeams = append(responseTeams, response.Team{
// 				TeamId:     team.ID,
// 				TeamIdShow: team.TeamIdShow,
// 				TeamName:   team.Name,
// 				TeamMember: members,
// 				TeamSkills: teamSkills,
// 			})
// 		}
// 	}

// 	c.JSON(http.StatusOK, responseTeams)
// }

// func matchesSearchKey(team models.Team, searchKey string) bool {
// 	searchKey = strings.ToLower(searchKey)
// 	if strings.Contains(strings.ToLower(team.Name), searchKey) ||
// 		strings.Contains(strings.ToLower(team.TeamIdShow), searchKey) {
// 		return true
// 	}
// 	for _, skill := range team.Skills {
// 		if strings.Contains(strings.ToLower(skill.SkillName), searchKey) {
// 			return true
// 		}
// 	}
// 	return false
// }
