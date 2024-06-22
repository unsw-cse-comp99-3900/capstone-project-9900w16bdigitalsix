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
	
	global.DB.AutoMigrate(&models.User{}, &models.Team{}, &models.Project{}, &models.Skill{})

	Router := initialize.InitRouters()


	// 启动服务
	port := global.ServerConfig.Port
	zap.S().Infof("server start at %d", port)
	if err := Router.Run(fmt.Sprintf(":%d", port)); err != nil {
		zap.S().Panic("server start failed", err.Error())
	}
}
