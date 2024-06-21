package response

type TeamMember struct {
	UserID   uint   `json:"userId"`
	UserName string `json:"userName"`
}

type CreateTeamResponse struct {
	TeamID     uint         `json:"teamId"`
	TeamName   string       `json:"teamName"`
	TeamMember []TeamMember `json:"teamMember"`
	// TeamSkills []string     `json:"teamSkills"`
}

type JoinGroupResponse struct {
	TeamID     uint        `json:"teamId"`
	TeamName   string      `json:"teamName"`
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string    `json:"teamSkills"`
}

type JoinTeamResponse struct {
	TeamId     uint         `json:"teamId"`
	TeamName   string       `json:"teamName"`
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string     `json:"teamSkills"`
}

type GetTeamProfileResponse struct {
	TeamId     uint         `json:"teamId"`
	TeamName   string       `json:"teamName"`
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string     `json:"teamSkills"`
}
