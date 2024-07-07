package response

import "time"

type NotificationResponse struct {
	Content   string    `json:"content"`
	UpdatedAt time.Time `json:"updatedAt"`
}
