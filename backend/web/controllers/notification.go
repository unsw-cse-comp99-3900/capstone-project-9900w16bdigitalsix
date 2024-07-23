package controllers

import (
	"net/http"
	"web/global"
	"web/global/response"
	"web/models"

	"github.com/gin-gonic/gin"
)

// @Summary Get all notifications for a user
// @Description Retrieves all notifications for a user by user ID
// @Tags Notification
// @Accept  json
// @Produce  json
// @Param userId path uint true "User ID"
// @Success 200 {array} response.NotificationResponse
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/notification/get/all/{userId} [get]
func GetUserNotifications(c *gin.Context) {
	userId := c.Param("userId")
	var notifications []models.Notification

	if err := global.DB.Joins("JOIN user_notifications ON user_notifications.notification_id = notifications.id").
		Where("user_notifications.user_id = ?", userId).
		Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var notificationResponse []response.NotificationResponse
	for _, notification := range notifications {
		notificationResponse = append(notificationResponse, response.NotificationResponse{
			Content:   notification.Content,
			UpdatedAt: notification.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, notificationResponse)
}

// @Summary Clear all notifications for a user
// @Description Clears all notifications for a user by user ID
// @Tags Notification
// @Accept  json
// @Produce  json
// @Param userId path uint true "User ID"
// @Success 200 {object} map[string]string "{"msg": "Clear all notifications successfully for the user}"
// @Failure 500 {object} map[string]string "{"error": "internal server error"}"
// @Router /v1/notification/clear/all/{userId} [delete]
func ClearUserNotifications(c *gin.Context) {
	userId := c.Param("userId")

	// delete all notifications
	if err := global.DB.Where("user_id = ?", userId).Delete(&models.UserNotifications{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "All notifications cleared successfully"})
}
