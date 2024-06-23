package main

import (
	"web/global"
	"web/initialize"
	"web/models"
)

func main() {
	// 自动迁移 schema，将 struct 生成对应的表
	initialize.InitConfig()
	initialize.InitDB()
	
    global.DB.AutoMigrate(&models.Project{})
    global.DB.AutoMigrate(&models.Team{})
	global.DB.AutoMigrate(&models.User{})


}
