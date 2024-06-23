package global

import (
	"web/config"

	"gorm.io/gorm"
)

// 一些全局变量
var (
	DB           *gorm.DB
	ServerConfig *config.ServerConfig = &config.ServerConfig{}
)
