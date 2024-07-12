package response

type StudentUnassigned struct {
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Email     string `json:"email"`
	TechStack string `json:"tech_stack"`
}

type ProfileResponse struct {
	UserID       uint     `json:"userId"`
	Name         string   `json:"name"`
	Email        string   `json:"email"`
	Role         int      `json:"role"`
	Bio          string   `json:"bio"`
	Organization string   `json:"organization"`
	AvatarURL    string   `json:"avatarURL"`
	Skills       []string `json:"skills"`
	Field        string   `json:"field"`
}

type StudentListResponse struct {
	UserID     uint     `json:"userId"`
	UserName   string   `json:"userName"`
	Email      string   `json:"email"`
	AvatarURL  string   `json:"avatarURL"`
	UserSkills []string `json:"userSkills"`
	Role       int      `json:"role"`
}

type TeamListResponse struct {
	TeamID     uint     `json:"teamId"`
	TeamIdShow uint     `json:"teamIdShow"`
	TeamName   string   `json:"teamName"`
	TeamSkills []string `json:"teamSkills"`
}

type UserListResponse struct {
	UserID    uint   `json:"userId"`
	UserName  string `json:"userName"`
	Email     string `json:"email"`
	Role      int    `json:"role"`
	AvatarURL string `json:"avatar"`
}

type TutorInfoResponse struct {
	TutorID   uint   `json:"tutorId"`
	Name      string `json:"name"`
	Role      int    `json:"role"`
	AvatarURL string `json:"avatarURL"`
	Email     string `json:"email"`
}

type CoorInfoResponse struct {
	CoordinatorID uint   `json:"coorId"`
	Name          string `json:"name"`
	Role          int    `json:"role"`
	AvatarURL     string `json:"avatarURL"`
	Email         string `json:"email"`
}
