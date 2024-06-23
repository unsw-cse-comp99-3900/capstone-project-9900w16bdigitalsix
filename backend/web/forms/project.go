package forms

type CreateProjectForm struct {
	Title          string   `json:"title"`
	ClientID       string     `json:"clientId"`
	RequiredSkills []string `json:"requiredSkills"`
	Field          string   `json:"field"`
	Description    string   `json:"description"`
	// FilePath       string   `json:"spec"`
}
