package response

type TeamMember struct {
	UserID     uint     `json:"userId"`
	UserName   string   `json:"userName"`
	Email      string   `json:"email"`
	AvatarURL  string   `json:"avatarURL"`
	Course     string   `json:"course"`
	UserSkills []string `json:"userSkills"`
}

type CreateTeamResponse struct {
	TeamID     uint         `json:"teamId"`
	TeamIdShow uint         `json:"teamIdShow"`
	TeamName   string       `json:"teamName"`
	Course     string       `json:"course"`
	TeamMember []TeamMember `json:"teamMember"`
}

type JoinGroupResponse struct {
	TeamID     uint         `json:"teamId"`
	TeamName   string       `json:"teamName"`
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string     `json:"teamSkills"`
}

type JoinTeamResponse struct {
	TeamId     uint         `json:"teamId"`
	TeamIdShow uint         `json:"teamIdShow"`
	TeamName   string       `json:"teamName"`
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string     `json:"teamSkills"`
}

type GetTeamProfileResponse struct {
	TeamId     uint         `json:"teamId"`
	TeamIdShow uint         `json:"teamIdShow"`
	TeamName   string       `json:"teamName"`
	Course     string       `json:"course"`
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string     `json:"teamSkills"`
}

type StudentInfoResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatarURL"`
	Course    string `json:"course"`
}

type TeamPreferenceProject struct {
	TeamID        uint   `json:"teamId"`
	ProjectID     uint   `json:"projectId"`
	Reason        string `json:"reason"`
	PreferenceNum int    `json:"preferenceNum"`
}

type PreferenceResponse struct {
	ProjectID    uint   `json:"projectId"`
	ProjectTitle string `json:"projectTitle"`
	Reason       string `json:"reason"`
}

type TeamMember2 struct {
	UserID    uint   `json:"userId"`
	UserName  string `json:"userName"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatarURL"`
}

type SearchTeamResponse struct {
	TeamId     uint          `json:"teamId"`
	TeamIdShow uint          `json:"teamIdShow"`
	TeamName   string        `json:"teamName"`
	Course     string        `json:"course"`
	TeamMember []TeamMember2 `json:"teamMember"`
	TeamSkills []string      `json:"teamSkills"`
}

type ProjectSearchTeamResponse struct {
	TeamId        uint          `json:"teamId"`
	TeamIdShow    uint          `json:"teamIdShow"`
	TeamName      string        `json:"teamName"`
	Course        string        `json:"course"`
	PreferenceNum int           `json:"preferenceNum"`
	TeamMember    []TeamMember2 `json:"teamMember"`
	TeamSkills    []string      `json:"teamSkills"`
}
