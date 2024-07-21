package global

import (
	"web/config"

	"gorm.io/gorm"
)

// global variables
var (
	DB           *gorm.DB
	ServerConfig *config.ServerConfig = &config.ServerConfig{}
)
