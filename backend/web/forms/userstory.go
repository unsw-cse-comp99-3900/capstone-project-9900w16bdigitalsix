package forms

type UserStoryReq struct {
	TeamId               uint   `json:"teamId" binding:"required"`
	SprintNum            int    `json:"sprintNum" binding:"required"`
	UserStoryDescription string `json:"userStoryDescription" binding:"required"`
	UserStoryStatus      int    `json:"userStoryStatus" binding:"required,oneof=1 2 3"`
}

type EditSprintDateReq struct {
	TeamId    uint   `json:"teamId" binding:"required"`
	SprintNum int    `json:"sprintNum" binding:"required"`
	StartDate string `json:"startDate" binding:"required"`
	EndDate   string `json:"endDate" binding:"required"`
}

type EditGradeReq struct {
	TeamId           uint              `json:"teamId" binding:"required"`
	Sprints          []EditSprintGrade `json:"sprints" binding:"required"`
	TeamNotification TeamNotification  `json:"notification"`
}

type EditSprintGrade struct {
	SprintNum int     `json:"sprintNum" binding:"required"`
	Grade     *int    `json:"grade" binding:"required"`
	Comment   *string `json:"comment" binding:"required"`
}
