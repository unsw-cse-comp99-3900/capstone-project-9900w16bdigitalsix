package main

import (
	"user_srv/global"
	"user_srv/initialize"
	"user_srv/model"
)

func main() {
	initialize.InitConfig()
	initialize.InitDB()
	global.DB.AutoMigrate(&model.User{})

	// // encription password
	// options := &password.Options{SaltLen: 10, Iterations: 100, KeyLen: 32, HashFunction: sha512.New}
	// salt, encodedPwd := password.Encode("admin123", options)
	// encryptedPwd := fmt.Sprintf("pbkdf2-sha512$%s$%s", salt, encodedPwd)
	// fmt.Println(encryptedPwd)

	// for i := 0; i < 10; i++ {
	// 	user := &model.User{
	// 		Nickname: fmt.Sprintf("Lisa%d", i),
	// 		Mobile:   fmt.Sprintf("188222222%d", i),
	// 		Password: encryptedPwd,
	// 	}
	// 	global.DB.Save(&user)
	// }
}
