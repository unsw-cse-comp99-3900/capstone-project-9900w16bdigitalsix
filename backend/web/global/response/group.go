package response

type TeamMember struct {
	UserID     uint     `json:"userId"`
	UserName   string   `json:"userName"`
	Email      string   `json:"email"`
	AvatarURL  string   `json:"avatarURL"`
	UserSkills []string `json:"userSkills"`
}

type CreateTeamResponse struct {
	TeamID     uint         `json:"teamId"`
	TeamIdShow uint         `json:"teamIdShow"`
	TeamName   string       `json:"teamName"`
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
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string     `json:"teamSkills"`
}

type StudentInfoResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatarURL"`
}

type TeamPreferenceProject struct {
	TeamID    uint   `gorm:"primaryKey"`
	ProjectID uint   `gorm:"primaryKey"`
	Reason    string `gorm:"type:text"`
}

type PreferenceResponse struct {
	ProjectID    uint   `json:"projectId"`
	ProjectTitle string `json:"projectTitle"`
	Reason       string `json:"reason"`
}

type Team struct {
	TeamId     uint         `json:"teamId"`
	TeamIdShow uint         `json:"teamIdShow"`
	TeamName   string       `json:"teamName"`
	TeamMember []TeamMember `json:"teamMember"`
	TeamSkills []string     `json:"teamSkills"`
}
