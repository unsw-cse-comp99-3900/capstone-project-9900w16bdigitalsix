package forms

type ProjectAllocationRequest struct {
	ProjectID    uint             `json:"projectId" binding:"required"`
	TeamID       uint             `json:"teamId" binding:"required"`
	Notification TeamNotification `json:"notification" binding:"required"`
}