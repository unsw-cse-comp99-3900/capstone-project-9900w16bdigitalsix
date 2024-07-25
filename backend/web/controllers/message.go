package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"web/forms"
	"web/global"
	"web/models"
)

// CreateChannel Create channel
// @Summary create channel
// @Description private channle or group channel
// @Tags Message
// @Accept json
// @Produce json
// @Param CreateChannelForm body forms.CreateChannelForm true "create channel form"
// @Success 200 {object} map[string]string "{"msg":"create channel successfully"}"
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
			c.JSON(http.StatusConflict, gin.H{"error": "private chat channel already exists"})
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

	c.JSON(http.StatusOK, gin.H{"msg":"Update channel name successfully"})
}