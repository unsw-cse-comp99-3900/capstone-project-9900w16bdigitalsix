package forms

type CreateTeamForm struct {
	UserID uint `json:"user_id" binding:"required"`
}

type JoinGroupForm struct {
	UserID uint `json:"userId"`
	TeamID uint `json:"teamId"`
}

type UpdateTeamProfileForm struct {
	TeamName   string   `json:"teamName"`
	TeamSkills []string `json:"TeamSkills"`
}

type JoinTeamForm struct {
	UserId     uint `json:"userId" binding:"required"`
	TeamIdShow uint `json:"teamIdShow" binding:"required"`
}

type PreferenceRequest struct {
	ProjectID uint   `json:"projectId" binding:"required"`
	Reason    string `json:"reason"`
}

type SearchTeamRequest struct {
	ProjectId  uint     `json:"projectId" binding:"required"`
	SearchList []string `json:"searchList" binding:"required"`
}

type SearchUnallocatedTeamRequest struct {
	SearchList []string `json:"searchList" binding:"required"`
}
