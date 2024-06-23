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
	Bio          string   `json:"bio"`
	Organization string   `json:"organization"`
	AvatarPath   string   `json:"avatarPath"`
	Skills       []string `json:"skills"`
	Field        string   `json:"field"`
}

type StudentListResponse struct {
	UserID   uint   `json:"userId"`
	UserName string `json:"userName"`
	Email    string `json:"email"`
}

type TeamListResponse struct {
	TeamID   uint   `json:"teamId"`
	TeamName string `json:"teamName"`
}
