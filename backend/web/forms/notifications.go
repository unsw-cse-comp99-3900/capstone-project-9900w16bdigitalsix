package forms

type NotificationTo struct {
	Users []uint `json:"users" binding:"required"`
}

type Notification struct {
	Content string         `json:"content" binding:"required"`
	To      NotificationTo `json:"to" binding:"required"`
}

type NotificationToTeam struct {
	TeamID uint `json:"teamId" binding:"required"`
}

type TeamNotification struct {
	Content string             `json:"content" binding:"required"`
	To      NotificationToTeam `json:"to" binding:"required"`
}
