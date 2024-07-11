package forms

type UserStoryReq struct {
	TeamId               uint   `json:"teamId" binding:"required"`
	SprintNum            int    `json:"sprintNum" binding:"required"`
	UserStoryDescription string `json:"userStoryDescription" binding:"required"`
	UserStoryStatus      int    `json:"userStoryStatus" binding:"required,oneof=1 2 3"`
}
