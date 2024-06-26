package response

type AllocatedTeam struct {
	TeamID   uint   `json:"teamId"`
	TeamName string `json:"teamName"`
}

type GetProjectListResponse struct {
	ProjectID      uint            `json:"projectId"`
	Title          string          `json:"title"`
	ClientName     string          `json:"clientName"`
	ClientEmail    string          `json:"clientEmail"`
	UserID         uint            `json:"userId"`
	RequiredSkills []string        `json:"requiredSkills"`
	Field          string          `json:"field"`
	AllocatedTeam  []AllocatedTeam `json:"allocatedTeam"`
}

type ProjectDetailResponse struct {
	ProjectID      uint            `json:"projectId"`
	Title          string          `json:"title"`
	ClientName     string          `json:"clientName"`
	ClientEmail    string          `json:"clientEmail"`
	UserID         uint            `json:"userId"`
	RequiredSkills []string        `json:"requiredSkills"`
	Field          string          `json:"field"`
	Description    string          `json:"description"`
	SpecLink       string          `json:"specLink"`
	AllocatedTeam  []AllocatedTeam `json:"allocatedTeam"`
}

type ModifyProjectDetailResponse struct {
	Message         string `json:"message"`
	CreatedBy       string `json:"createdBy"`
	CreatedByUserID uint   `json:"createdByUserId"`
	CreatedByEmail  string `json:"createdByEmail"`
}
