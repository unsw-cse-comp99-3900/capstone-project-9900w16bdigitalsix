package main

import (
	"fmt"

	"go.uber.org/zap"

	"web/global"
	"web/initialize"
	"web/models"
)

func main() {
	initialize.InitLogger()
	initialize.InitConfig()
	initialize.InitDB()
	// initialize.CreateAdminUser() // create admin user if not exists

	global.DB.AutoMigrate(&models.User{}, &models.Team{}, &models.Project{},
		&models.Skill{}, &models.Sprint{}, &models.UserStory{}, &models.TeamPreferenceProject{}, 
		&models.Notification{}, &models.UserNotifications{}, &models.Channel{}, &models.Message{}, &models.ChannelUser{})
	
	global.DB.Exec("ALTER TABLE skills MODIFY skill_name VARCHAR(255) COLLATE utf8mb4_bin")

	Router := initialize.InitRouters()

	// start server
	port := global.ServerConfig.Port
	zap.S().Infof("server start at %d", port)
	if err := Router.Run(fmt.Sprintf(":%d", port)); err != nil {
		zap.S().Panic("server start failed", err.Error())
	}
}
