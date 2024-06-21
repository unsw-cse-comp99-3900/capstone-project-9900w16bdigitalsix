package forms

type CreateProjectRequest struct {
	Title          string   `json:"title"`
	ClientEmail    string   `json:"clientEmail"`
	RequiredSkills []string `json:"requiredSkills"`
	Field          string   `json:"field"`
	Description    string   `json:"description"`
}
