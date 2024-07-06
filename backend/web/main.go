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

	global.DB.AutoMigrate(&models.User{}, &models.Team{}, &models.Project{},
		&models.Skill{}, &models.Sprint{}, &models.UserStory{}, &models.TeamPreferenceProject{})
	// 修改现有表的字段排序规则
	global.DB.Exec("ALTER TABLE skills MODIFY skill_name VARCHAR(255) COLLATE utf8mb4_bin")

	Router := initialize.InitRouters()

	// 启动服务
	port := global.ServerConfig.Port
	zap.S().Infof("server start at %d", port)
	if err := Router.Run(fmt.Sprintf(":%d", port)); err != nil {
		zap.S().Panic("server start failed", err.Error())
	}
}
