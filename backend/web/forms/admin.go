package forms

type ChangeProjectCoordinatorRequest struct {
	ProjectID     uint `json:"projectId" binding:"required"`
	CoordinatorID uint `json:"coordinatorId" binding:"required"`
}

type ChangeProjectTutorRequest struct {
	ProjectID     uint `json:"projectId" binding:"required"`
	TutorID uint `json:"tutorId" binding:"required"`
}

