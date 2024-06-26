package global

import (
	"user_srv/config"

	"gorm.io/gorm"
)

var (
	DB           *gorm.DB                                      // 定义一个全局变量
	ServerConfig *config.ServerConfig = &config.ServerConfig{} // 指针必须初始化
)
