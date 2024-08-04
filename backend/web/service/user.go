package service

import (
	"crypto/sha512"
	"fmt"
	"web/global"
	"web/models"

	"github.com/anaskhan96/go-password-encoder"
)

func ResetPassword(email, newPassword string) error {
	var user models.User
	// read user
	if err := global.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return fmt.Errorf("user not found")
	}

	// encription
	options := &password.Options{SaltLen: 10, Iterations: 100, KeyLen: 32, HashFunction: sha512.New}
	salt, encodedPwd := password.Encode(newPassword, options)
	user.Password = fmt.Sprintf("pbkdf2-sha512$%s$%s", salt, encodedPwd)

	// update password
	if err := global.DB.Save(&user).Error; err != nil {
		return fmt.Errorf("failed to update password")
	}
	return nil
}
