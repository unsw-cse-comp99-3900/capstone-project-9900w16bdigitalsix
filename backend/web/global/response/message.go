package response

type UserDetail struct {
	UserId     int      `json:"userId"`
	UserName   string   `json:"userName"`
	UserEmail  string   `json:"userEmail"`
	UserCourse string   `json:"userCourse"`
	AvatarURL  string   `json:"avatarURL"`
	Email      string   `json:"email"`
	Role       int      `json:"role"`
	UserSkills []string `json:"userSkills"`
}

type ChannelUsersResponse struct {
	Users []UserDetail `json:"users"`
}

type MessageContent struct {
    Content string `json:"content,omitempty"`
    Name    string `json:"name,omitempty"`
    Email   string `json:"email,omitempty"`
}

type MessageDetail struct {
    MessageTime    string         `json:"messageTime"`
    MessageContent MessageContent `json:"messageContent"`
    MessageType    int            `json:"messageType"`
    SenderName     string         `json:"senderName"`
}

type ChannelMessagesResponse struct {
    Messages []MessageDetail `json:"messages"`
}

type ChannelDetail struct {
    ChannelID   uint   `json:"channelId"`
    ChannelName string `json:"channelName"`
    Type        int    `json:"type"`
}

type AllChannelsResponse struct {
    Channels []ChannelDetail `json:"channels"`
}
