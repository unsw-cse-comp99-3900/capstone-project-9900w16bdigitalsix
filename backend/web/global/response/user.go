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
	UserID   uint   `json:"userId"`
	UserName string `json:"userName"`
	Email    string `json:"email"`
	AvatarURL string `json:"avatarURL"`
}

type TeamListResponse struct {
	TeamID   uint   `json:"teamId"`
	TeamName string `json:"teamName"`
}

type UserListResponse struct {
	UserID    uint   `json:"userId"`
	UserName  string `json:"userName"`
	Role      int    `json:"role"`
	AvatarURL string `json:"avatar"`
}
