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
	Position     string   `json:"position"`
	Skills       []string `json:"skills"`
	Field        string   `json:"field"`
}
