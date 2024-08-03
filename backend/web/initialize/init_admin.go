package initialize

import (
	"crypto/sha512"
	"fmt"
	"web/global"
	"web/models"

	"github.com/anaskhan96/go-password-encoder"
)

func CreateAdminUser() {

	var user models.User
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
