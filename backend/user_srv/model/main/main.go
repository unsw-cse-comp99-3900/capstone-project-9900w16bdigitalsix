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

}
