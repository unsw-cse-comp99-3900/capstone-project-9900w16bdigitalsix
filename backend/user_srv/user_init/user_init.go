package main

import (
	"crypto/sha512"
	"fmt"
	"user_srv/global"
	"user_srv/initialize"
	"user_srv/model"

	"github.com/anaskhan96/go-password-encoder"
	"go.uber.org/zap"
)

func main() {
	// initialize
	initialize.InitLogger()
	initialize.InitConfig() // must first initconfig then initialize database
	initialize.InitDB()

	// Auto migrate the User model
	global.DB.AutoMigrate(&model.User{})

	users := []struct {
		Email    string
		Username string
		Password string
		Role     int
		Course   string
	}{
		{"admin@unsw.edu", "admin", "admin123", 5, ""},
		{"student1@unsw.edu", "student1", "password1", 1, "COMP9900"},
		{"student2@unsw.edu", "student2", "password2", 1, "COMP9900"},
		{"student3@unsw.edu", "student3", "password3", 1, "COMP3300"},
		{"student4@unsw.edu", "student4", "password4", 1, "COMP3300"},
		{"tutor1@unsw.edu", "student3", "password3", 2, ""},
		{"client1@unsw.edu", "student4", "password4", 3, ""},
		{"coordinator1@unsw.edu", "student4", "password4", 4, ""},
	}

	options := &password.Options{SaltLen: 10, Iterations: 100, KeyLen: 32, HashFunction: sha512.New}

	for _, u := range users {
		var user model.User
		result := global.DB.Where("Email = ?", u.Email).First(&user)
		if result.Error == nil {
			// zap.S().Infof("User %s already exists", u.Email)
			continue
		}

		salt, encodedPwd := password.Encode("admin123", options)
		passwordHash := fmt.Sprintf("pbkdf2-sha512$%s$%s", salt, encodedPwd)

		user = model.User{
			Email:    u.Email,
			Username: u.Username,
			Password: passwordHash,
			Role:     u.Role,
		}

		global.DB.Create(&user)
		zap.S().Infof("Created user %s", u.Email)
	}
}
