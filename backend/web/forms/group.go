package forms


type CreateTeamForm struct {
	UserID uint `json:"user_id" binding:"required"`
}

type JoinGroupForm struct {
	UserID uint `json:"userId"`
	TeamID uint `json:"teamId"`
}

type UpdateTeamProfileForm struct {
	TeamName   string `json:"teamName"`
	TeamSkills []string  `json:"TeamSkills"` 
}

type JoinTeamForm struct {
	UserId uint `json:"userId" binding:"required"`
	TeamId uint `json:"teamId" binding:"required"`
}

type LeaveTeamForm struct {
	UserId uint `json:"userId" binding:"required"`
}