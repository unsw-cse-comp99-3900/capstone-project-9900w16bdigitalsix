package controllers

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"

	"web/global"
	"web/models"
)

func handleNotification(notificationContent string, userIds []uint) error {
	var existingNotifications []models.Notification

	if err := global.DB.Preload("Users").Where("content = ?", notificationContent).Find(&existingNotifications).Error; err != nil {
		return err
	}

	var matchedNotification *models.Notification
	for _, notification := range existingNotifications {
		notificationUserIDs := make(map[uint]bool)
		for _, user := range notification.Users {
			notificationUserIDs[user.ID] = true
		}

		allUsersMatch := true
		for _, userID := range userIds {
			if !notificationUserIDs[userID] {
				allUsersMatch = false
				break
			}
		}

		if allUsersMatch {
			matchedNotification = &notification
			break
		}
	}

	if matchedNotification != nil {
		matchedNotification.UpdatedAt = time.Now()
		if err := global.DB.Save(matchedNotification).Error; err != nil {
			return err
		}
	} else {
		newNotification := models.Notification{
			Content: notificationContent,
		}
		if err := global.DB.Create(&newNotification).Error; err != nil {
			return err
		}

		for _, userID := range userIds {
			if err := global.DB.Model(&newNotification).Association("Users").Append(&models.User{Model: gorm.Model{ID: userID}}); err != nil {
				return err
			}
		}
	}

	return nil

}

func ExtractSkillNames(skills []models.Skill) []string {
	skillNames := make([]string, len(skills))
	for i, skill := range skills {
		skillNames[i] = skill.SkillName
	}
	return skillNames
}

// GenerateRandomInt generate random int
func GenerateRandomInt() uint {
	src := rand.NewSource(time.Now().UnixNano())
	r := rand.New(src)
	return uint(r.Intn(900000) + 100000)
}

func HandleValidatorError(ctx *gin.Context, err error) {
	errs, ok := err.(validator.ValidationErrors)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"msg": err.Error(),
		})
	}

	ctx.JSON(http.StatusBadRequest, gin.H{
		"msg": errs.Error(),
	})

}

// HandleGrpcErrorToHttp Convert gRPC code to HTTP status code
func HandleGrpcErrorToHttp(err error, c *gin.Context) {
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				c.JSON(http.StatusNotFound, gin.H{
					"msg": e.Message(),
				})
			case codes.Internal:
				c.JSON(http.StatusInternalServerError, gin.H{
					"msg": "internal error",
				})
			case codes.InvalidArgument:
				c.JSON(http.StatusBadRequest, gin.H{
					"msg": "parameter error",
				})
			case codes.Unavailable:
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"msg": "Service unavailable",
				})
			case codes.Unauthenticated:
				c.JSON(http.StatusUnauthorized, gin.H{
					"msg": "unverified",
				})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"msg": e.Message(),
				})
			}
			return
		}
	}
}

func GenerateRandomNumber(r *rand.Rand) int {
	// Define minimum and maximum values
	min := 1
	max := 9999

	// Generate random numbers
	return r.Intn(max-min+1) + min
}
