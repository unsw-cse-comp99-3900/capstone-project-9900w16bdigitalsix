package response

type GradeResponse struct {
	Sprints []SprintGrade `json:"sprints"`
}

type SprintGrade struct {
	SprintNum int     `json:"sprintNum"`
	Grade     *int    `json:"grade"`
	Comment   *string `json:"comment"`
}

type ProgressDetailResponse struct {
	ProjectId   uint           `json:"projectId"`
	Title       string         `json:"title"`
	ClientName  string         `json:"clientName"`
	ClientEmail string         `json:"clientEmail"`
	ClientId    *uint          `json:"clientId"`
	TutorName   string         `json:"tutorName"`
	TutorEmail  string         `json:"tutorEmail"`
	TutorId     *uint          `json:"tutorId"`
	CoorName    string         `json:"coorName"`
	CoorEmail   string         `json:"coorEmail"`
	CoorId      *uint          `json:"coorId"`
	TeamName    string         `json:"teamName"`
	TeamId      uint           `json:"teamId"`
	TeamIdShow  uint           `json:"teamIdShow"`
	Sprints     []SprintDetail `json:"sprints"`
}

type SprintDetail struct {
	SprintNum     int               `json:"sprintNum"`
	SprintGrade   *int              `json:"sprintGrade"`
	StartDate     string            `json:"startDate"`
	EndDate       string            `json:"endDate"`
	UserStoryList []UserStoryDetail `json:"userStoryList"`
}

type UserStoryDetail struct {
	UserStoryId          uint   `json:"userStoryId"`
	UserStoryDescription string `json:"userStoryDescription"`
	UserStoryStatus      int    `json:"userStoryStatus"`
}
