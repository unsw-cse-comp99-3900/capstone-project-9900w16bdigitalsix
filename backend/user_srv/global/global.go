package global

import (
	"user_srv/config"

	"gorm.io/gorm"
)

var (
	DB           *gorm.DB                                      
	ServerConfig *config.ServerConfig = &config.ServerConfig{} 
)
