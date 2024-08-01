package main

import (
	"user_srv/global"
	"user_srv/initialize"
	"user_srv/model"
)

func main() {
	// 自动迁移 schema，将 struct 生成对应的表
	initialize.InitConfig()
	initialize.InitDB()
	global.DB.AutoMigrate(&model.User{})

	// // 生成一些数据填充进表格
	// // 用户密码加密
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
