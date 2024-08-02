package main

import (
	"crypto/sha512"
	"fmt"
	"user_srv/global"
	"user_srv/initialize"
	"user_srv/model"

	"github.com/anaskhan96/go-password-encoder"
)

func main() {
	// initialize
	initialize.InitLogger()
	initialize.InitConfig() // must first initconfig then initialize database
	initialize.InitDB()

	// Auto migrate the User model
	global.DB.AutoMigrate(&model.User{})

	var user model.User
	result := global.DB.Where("Email = ?", "admin@unsw.edu").First(&user)
	if result.Error == nil {
		// zap.S().Info("Admin user already exists")
		return
	}

	// create the admin
	user.Email = "admin@unsw.edu"
	user.Username = "admin"
	user.Role = 5

	// encription
	options := &password.Options{SaltLen: 10, Iterations: 100, KeyLen: 32, HashFunction: sha512.New}
	salt, encodedPwd := password.Encode("admin123", options)
	user.Password = fmt.Sprintf("pbkdf2-sha512$%s$%s", salt, encodedPwd)

	global.DB.Create(&user)
}
