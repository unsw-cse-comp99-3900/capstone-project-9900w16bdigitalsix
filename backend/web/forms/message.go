package forms

type CreateChannelForm struct {
	ChannelType int   `json:"channelType" binding:"required"`
	UserIds     []int `json:"userId" binding:"required"`
}

type UpdateChannelNameForm struct {
	ChannelID   int    `json:"channelId" binding:"required"`
	ChannelName string `json:"ChannelName" binding:"required"`
}

type InviteToChannelForm struct {
	ChannelID int   `json:"channelId" binding:"required"`
	UserIds   []int `json:"userId" binding:"required"`
}

type LeaveChannelForm struct {
	ChannelID int `json:"channelId" binding:"required"`
	UserID    int `json:"userId" binding:"required"`
}

type CardContent struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Notification2 struct {
	Content string `json:"content" binding:"required"`
	To      []uint `json:"to" binding:"required"`
}

type SendMessageForm struct {
	ChannelID      int           `json:"channelId" binding:"required"`
	SenderID       int           `json:"SenderId" binding:"required"`
	MessageType    int           `json:"messageType" binding:"required"`
	Notification   Notification2 `json:"notification" binding:"required"`
	MessageContent interface{}   `json:"messageContent" binding:"required"`
}
