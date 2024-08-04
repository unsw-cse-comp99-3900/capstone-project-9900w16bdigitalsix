package main

import (
	"web/global"
	"web/initialize"
	"web/models"
)

func main() {
	// Automatically migrate schema and generate corresponding tables from struct
	initialize.InitConfig()
	initialize.InitDB()

	global.DB.AutoMigrate(&models.Project{})
	global.DB.AutoMigrate(&models.Team{})
	global.DB.AutoMigrate(&models.User{})

}
