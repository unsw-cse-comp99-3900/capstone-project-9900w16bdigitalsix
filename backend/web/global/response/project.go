package response

type AllocatedTeam struct {
	TeamID   uint   `json:"teamId"`
	TeamName string `json:"teamName"`
}

type GetProjectListResponse struct {
	ProjectID        uint            `json:"projectId"`
	Title            string          `json:"title"`
	ClientID         uint            `json:"clientId"`
	ClientName       string          `json:"clientName"`
	ClientEmail      string          `json:"clientEmail"`
	TutorID          uint            `json:"tutorId"`
	TutorName        string          `json:"tutorName"`
	TutorEmail       string          `json:"tutorEmail"`
	CoordinatorID    uint            `json:"coorId"`
	CoordinatorName  string          `json:"coorName"`
	CoordinatorEmail string          `json:"coorEmail"`
	RequiredSkills   []string        `json:"requiredSkills"`
	Field            string          `json:"field"`
	AllocatedTeam    []AllocatedTeam `json:"allocatedTeam"`
}

type ProjectDetailResponse struct {
	ProjectID        uint            `json:"projectId"`
	Title            string          `json:"title"`
	ClientName       string          `json:"clientName"`
	ClientEmail      string          `json:"clientEmail"`
	ClientID         uint            `json:"clientId"`
	TutorID          uint            `json:"tutorId"`
	TutorName        string          `json:"tutorName"`
	TutorEmail       string          `json:"tutorEmail"`
	CoordinatorID    uint            `json:"coorId"`
	CoordinatorName  string          `json:"coorName"`
	CoordinatorEmail string          `json:"coorEmail"`
	RequiredSkills   []string        `json:"requiredSkills"`
	Field            string          `json:"field"`
	Description      string          `json:"description"`
	SpecLink         string          `json:"specLink"`
	AllocatedTeam    []AllocatedTeam `json:"allocatedTeam"`
}

type ModifyProjectDetailResponse struct {
	Message         string `json:"message"`
	CreatedBy       string `json:"createdBy"`
	CreatedByUserID uint   `json:"createdByUserId"`
	CreatedByEmail  string `json:"createdByEmail"`
}

type ProjectTeamMember struct {
	UserID     uint     `json:"userId"`
	UserName   string   `json:"userName"`
	UserEmail  string   `json:"userEmail"`
	UserSkills []string `json:"userSkills"`
	AvatarURL  string   `json:"avatarURL"`
}

type TeamDetailResponse struct {
	TeamID           uint                `json:"teamId"`
	TeamIdShow       uint                `json:"teamIdShow"`
	TeamName         string              `json:"teamName"`
	TeamMember       []ProjectTeamMember `json:"teamMember"`
	TeamSkills       []string            `json:"teamSkills"`
	PreferenceReason string              `json:"preferenceReason"`
}