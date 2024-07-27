package controllers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"web/forms"
	"web/global"
	"web/global/response"
	"web/models"
)

// @Summary create channel
// @Description private channle or group channel
// @Tags Message
// @Accept json
// @Produce json
// @Param CreateChannelForm body forms.CreateChannelForm true "create channel form"
// @Success 200 {object} map[string]string "{"channelID": "string", "msg":"create channel successfully"}" or "{"channelID": "string", "msg": "private chat channel already exists"}"
// @Failure 400 {object} map[string]string "{"error": "bad request"}"
// @Failure 409 {object} map[string]string "{"error": "private chat channel already exists"}""
// @Failure 500 {object} map[string]string "{"error": "Internal server error"}"
// @Router /v1/message/create/channel [post]
func CreateChannel(c *gin.Context) {
	var form forms.CreateChannelForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := global.DB

	// Check if channelType is private chat and if so, ensure it does not already exist
	if form.ChannelType == 1 && len(form.UserIds) == 2 {
		var existingChannel models.Channel
		err := db.Joins("JOIN channel_users cu1 ON cu1.channel_id = channels.id").
			Joins("JOIN channel_users cu2 ON cu2.channel_id = channels.id").
			Where("cu1.user_id = ? AND cu2.user_id = ? AND channels.type = ?", form.UserIds[0], form.UserIds[1], form.ChannelType).
			First(&existingChannel).Error
		if err == nil {
			c.JSON(http.StatusOK, gin.H{"channelID": existingChannel.ID, "msg": "private chat channel already exists"})
			return
		}
		if err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	// Create new channel
	var users []models.User
	for _, userID := range form.UserIds {
		users = append(users, models.User{Model: gorm.Model{ID: uint(userID)}})
	}

	channel := &models.Channel{
		Type:  form.ChannelType,
		Users: users,
	}

	if err := db.Create(&channel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"channelID": channel.ID,
		"msg":       "Create channel successfully",
	})
}

// UpdateChannelName Update channel name
// @Summary update channel name
// @Description update the name of a specified channel
// @Tags Message
// @Accept json
// @Produce json
// @Param UpdateChannelNameForm body forms.UpdateChannelNameForm true "update channel name form"
// @Success 200 {object} map[string]string "{"msg": "update channel name successfully"}"
// @Failure 400 {object} map[string]string "{"error": "bad request"}"
// @Failure 404 {object} map[string]string "{"error": "channel not found"}"
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/message/update/channelName [post]
func UpdateChannelName(c *gin.Context) {
	var form forms.UpdateChannelNameForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := global.DB
	var channel models.Channel

	if err := db.First(&channel, form.ChannelID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "channel not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	channel.Name = form.ChannelName

	if err := db.Save(&channel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "Update channel name successfully"})
}

// InviteToChannel Invite people to channel
// @Summary invite people to channel
// @Description invite users to an existing channel
// @Tags Message
// @Accept json
// @Produce json
// @Param InviteToChannelForm body forms.InviteToChannelForm true "invite to channel form"
// @Success 200 {object} map[string]string "{"msg":"invited to channel successfully"}"
// @Failure 400 {object} map[string]string "{"error": "bad request"}"
// @Failure 404 {object} map[string]string "{"error": "channel not found"}"
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/message/invite/to/channel [post]
func InviteToChannel(c *gin.Context) {
	var form forms.InviteToChannelForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := global.DB
	var channel models.Channel

	if err := db.First(&channel, form.ChannelID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "channel not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	var users []models.User
	for _, userID := range form.UserIds {
		users = append(users, models.User{Model: gorm.Model{ID: uint(userID)}})
	}

	if err := db.Model(&channel).Association("Users").Append(users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "invited to channel successfully"})
}

// LeaveChannel Leave channel
// @Summary leave channel
// @Description remove user from a channel
// @Tags Message
// @Accept json
// @Produce json
// @Param LeaveChannelForm body forms.LeaveChannelForm true "leave channel form"
// @Success 200 {object} map[string]string "{"msg":"left channel successfully"}"
// @Failure 400 {object} map[string]string "{"error": "bad request"}"
// @Failure 404 {object} map[string]string "{"error": "channel or user not found"}"
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/message/leave/channel [delete]
func LeaveChannel(c *gin.Context) {
	var form forms.LeaveChannelForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := global.DB
	var channel models.Channel
	var user models.User

	if err := db.First(&channel, form.ChannelID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "channel not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if err := db.First(&user, form.UserID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if err := db.Model(&channel).Association("Users").Delete(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	userCount := db.Model(&channel).Association("Users").Count()
	if userCount == 0 {
		if err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Where("channel_id = ?", channel.ID).Delete(&models.Message{}).Error; err != nil {
				return err
			}
			if err := tx.Delete(&channel).Error; err != nil {
				return err
			}
			return nil
		}); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"msg": "left channel successfully"})
}

// GetChannelUsersDetail Get specific channel users detail
// @Summary get specific channel users detail
// @Description get details of all users in a specified channel
// @Tags Message
// @Accept json
// @Produce json
// @Param channelId path int true "Channel ID"
// @Success 200 {object} response.ChannelUsersResponse
// @Failure 400 {object} map[string]string "{"error": "bad request"}"
// @Failure 404 {object} map[string]string "{"error": "channel not found"}"
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/message/{channelId}/users/detail [get]
func GetChannelUsersDetail(c *gin.Context) {
	channelIdStr := c.Param("channelId")
	channelId, err := strconv.Atoi(channelIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid channel ID"})
		return

	}

	db := global.DB
	var channel models.Channel

	if err := db.Preload("Users.Skills").First(&channel, channelId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "channel not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	var userDetails []response.UserDetail
	for _, user := range channel.Users {
		userSkills := make([]string, len(user.Skills))
		for i, skill := range user.Skills {
			userSkills[i] = skill.SkillName
		}
		userDetails = append(userDetails, response.UserDetail{
			UserId:     int(user.ID),
			UserName:   user.Username,
			UserEmail:  user.Email,
			UserCourse: user.Course,
			AvatarURL:  user.AvatarURL,
			Email:      user.Email,
			Role:       user.Role,
			UserSkills: userSkills,
		})
	}

	c.JSON(http.StatusOK, response.ChannelUsersResponse{Users: userDetails})
}

// SendMessage Send message in channel
// @Summary send message in channel
// @Description send a message in a specified channel if messageType == 2,  messageContent is the format of {"name": "string", "email": "string"}
// @Tags Message
// @Accept json
// @Produce json
// @Param SendMessageForm body forms.SendMessageForm true "send message form"
// @Success 200 {object} map[string]string "{"msg":"message sent successfully"}"
// @Failure 400 {object} map[string]string "{"error": "bad request"}"
// @Failure 404 {object} map[string]string "{"error": "channel not found"}"
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/message/send [post]
func SendMessage(c *gin.Context) {
	var form forms.SendMessageForm
	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := global.DB
	var channel models.Channel

	if err := db.First(&channel, form.ChannelID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "channel not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	var content string
	if form.MessageType == 1 {
		content = form.MessageContent.(string)
	} else if form.MessageType == 2 {
		cardContent := form.MessageContent.(map[string]interface{})
		cardContentBytes, err := json.Marshal(cardContent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		content = string(cardContentBytes)
	}

	message := models.Message{
		ChannelID: uint(form.ChannelID),
		SenderID:  uint(form.SenderID),
		Type:      form.MessageType,
		Content:   content,
	}

	if err := db.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "message sent successfully"})
}

// GetChannelMessages Get messages of a specific channel
// @Summary get messages of a specific channel
// @Description get details of all messages in a specified channel
// @Tags Message
// @Accept json
// @Produce json
// @Param channelId path int true "Channel ID"
// @Success 200 {object} response.ChannelMessagesResponse
// @Failure 400 {object} map[string]string "{"error": "bad request"}"
// @Failure 404 {object} map[string]string "{"error": "channel not found"}"
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/message/channel/{channelId}/messages [get]
func GetChannelMessages(c *gin.Context) {
	channelIdStr := c.Param("channelId")
	channelId, err := strconv.Atoi(channelIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid channel ID"})
		return
	}

	db := global.DB
	var messages []models.Message

	if err := db.Where("channel_id = ?", channelId).Preload("Sender").Find(&messages).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "channel not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	var messageDetails []response.MessageDetail
	for _, message := range messages {
		var content response.MessageContent
		if message.Type == 1 {
			content.Content = message.Content
		} else if message.Type == 2 {
			var cardContent map[string]string
			if err := json.Unmarshal([]byte(message.Content), &cardContent); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			content.Name = cardContent["name"]
			content.Email = cardContent["email"]
		}

		messageDetails = append(messageDetails, response.MessageDetail{
			MessageTime:    message.CreatedAt.Format(time.RFC3339),
			MessageContent: content,
			MessageType:    message.Type,
			SenderName:     message.Sender.Username,
			AvatarUrl:      message.Sender.AvatarURL,
		})
	}

	c.JSON(http.StatusOK, response.ChannelMessagesResponse{Messages: messageDetails})
}

// GetAllChannels Get all channels for a specific user
// @Summary get all channels for a specific user
// @Description get details of all channels for a specific user
// @Tags Message
// @Accept json
// @Produce json
// @Param userId path int true "User ID"
// @Success 200 {object} response.AllChannelsResponse
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/message/get/all/channels/{userId} [get]
func GetAllChannels(c *gin.Context) {
	userId := c.Param("userId")

	db := global.DB
	var channels []models.Channel

	// Join channels with channel_users to filter by userId
	if err := db.Joins("JOIN channel_users ON channels.id = channel_users.channel_id").
		Where("channel_users.user_id = ?", userId).
		Find(&channels).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var channelDetails []response.ChannelDetail
	for _, channel := range channels {
		channelDetails = append(channelDetails, response.ChannelDetail{
			ChannelID:   channel.ID,
			ChannelName: channel.Name,
			Type:        channel.Type,
		})
	}

	c.JSON(http.StatusOK, response.AllChannelsResponse{Channels: channelDetails})
}
