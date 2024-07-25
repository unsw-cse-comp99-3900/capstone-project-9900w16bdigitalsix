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
