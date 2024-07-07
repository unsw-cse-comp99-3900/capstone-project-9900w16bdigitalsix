package response

import "time"

type NotificationResponse struct {
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}
