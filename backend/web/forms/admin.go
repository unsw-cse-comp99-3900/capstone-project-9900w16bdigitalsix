package forms

type NotificationTo struct {
	Users []uint `json:"users" binding:"required"`
}

type Notification struct {
	Content string         `json:"content" binding:"required"`
	To      NotificationTo `json:"to" binding:"required"`
}

type ChangeProjectCoordinatorRequest struct {
	ProjectID     uint         `json:"projectId" binding:"required"`
	CoordinatorID uint         `json:"coorId" binding:"required"`
	Notification  Notification `json:"notification" binding:"required"`
}

type ChangeProjectTutorRequest struct {
	ProjectID    uint         `json:"projectId" binding:"required"`
	TutorID      uint         `json:"tutorId" binding:"required"`
	Notification Notification `json:"notification" binding:"required"`
}

type ModifyUserRoleRequest struct {
	UserID       uint         `json:"userId" binding:"required"`
	Role         int          `json:"role" binding:"required"`
	Notification Notification `json:"notification" binding:"required"`
}
