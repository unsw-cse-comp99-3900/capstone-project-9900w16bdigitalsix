package main

import (
	"crypto/sha512"
	"fmt"
	"web/controllers"
	"web/global"
	"web/initialize"
	"web/models"

	"github.com/anaskhan96/go-password-encoder"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func createUsers() {
	users := []struct {
		Email    string
		Username string
		Password string
		Role     int
		Course   string
	}{
		{"admin@unsw.edu", "admin", "admin123", 5, ""},
		{"student1@unsw.edu", "student1", "password1", 1, "COMP9900"},
		{"student2@unsw.edu", "student2", "password2", 1, "COMP9900"},
		{"student3@unsw.edu", "student3", "password3", 1, "COMP9900"},
		{"student4@unsw.edu", "student4", "password4", 1, "COMP3900"},
		{"student5@unsw.edu", "student5", "password4", 1, "COMP3900"},
		{"student6@unsw.edu", "student6", "password4", 1, "COMP3900"},
		{"tutor1@unsw.edu", "tutor1", "password3", 2, ""},
		{"tutor2@unsw.edu", "tutor2", "password3", 2, ""},
		{"client1@unsw.edu", "client1", "password4", 3, ""},
		{"client2@unsw.edu", "client2", "password4", 3, ""},
		{"coordinator1@unsw.edu", "coordinator1", "password4", 4, ""},
		{"coordinator2@unsw.edu", "coordinator2", "password4", 4, ""},
	}

	// encription
	options := &password.Options{SaltLen: 10, Iterations: 100, KeyLen: 32, HashFunction: sha512.New}

	for _, u := range users {
		var user models.User
		result := global.DB.Where("Email = ?", u.Email).First(&user)
		if result.Error == nil {
			// zap.S().Infof("User %s already exists", u.Email)
			continue
		}

		salt, encodedPwd := password.Encode("admin123", options)
		passwordHash := fmt.Sprintf("pbkdf2-sha512$%s$%s", salt, encodedPwd)

		user = models.User{
			Email:    u.Email,
			Username: u.Username,
			Course:   u.Course,
			Password: passwordHash,
			Role:     u.Role,
		}

		global.DB.Create(&user)
		zap.S().Infof("Created user %s", u.Email)
	}
}

func createTeams() {
	var student1, student4 models.User
	var project models.Project

	global.DB.Where("Email = ?", "student1@unsw.edu").First(&student1)
	global.DB.Where("Email = ?", "student4@unsw.edu").First(&student4)
	global.DB.First(&project, 1)

	if student1.BelongsToGroup != nil {
		zap.S().Info("student1 is already in a team")
	} else {
		team1 := models.Team{
			Name:             "Team1",
			TeamIdShow:       controllers.GenerateRandomInt(),
			Course:           "COMP9900",
			AllocatedProject: &project.ID,
			Members: []models.User{
				student1,
			},
		}
		global.DB.Create(&team1)
		zap.S().Info("Created team for student1")
	}

	if student4.BelongsToGroup != nil {
		zap.S().Info("student4 is already in a team")
	} else {
		team2 := models.Team{
			Name:       "Team2",
			TeamIdShow: controllers.GenerateRandomInt() + 1,
			Course:     "COMP3900",
			Members: []models.User{
				student4,
			},
		}
		global.DB.Create(&team2)
		zap.S().Info("Created team for student4")
	}
}

func createProjects() {
	var projectCount int64
	global.DB.Model(&models.Project{}).Count(&projectCount)

	if projectCount >= 20 {
		zap.S().Info("There are already 20 or more projects. No new projects will be created.")
		return
	}

	skillsList := []string{"Python3", "Golang", "C++"}

	var client1, tutor1, coordinator1 models.User
	global.DB.Where("Email = ?", "client1@unsw.edu").First(&client1)
	global.DB.Where("Email = ?", "tutor1@unsw.edu").First(&tutor1)
	global.DB.Where("Email = ?", "coordinator1@unsw.edu").First(&coordinator1)

	for i := 1; i <= 5; i++ {
		project := models.Project{
			Name:          fmt.Sprintf("Project %d", i),
			Field:         "Software Engineering",
			MaxTeams:      5,
			IsPublic:      1,
			Description:   fmt.Sprintf("Description for project %d", i),
			ClientID:      &client1.ID,
			TutorID:       &tutor1.ID,
			CoordinatorID: &coordinator1.ID,
		}

		global.DB.Create(&project)
		zap.S().Infof("Created project %d", i)

		for _, skillName := range skillsList {
			var skill models.Skill
			if err := global.DB.Where("skill_name = ?", skillName).First(&skill).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					skill = models.Skill{
						SkillName: skillName,
					}
					global.DB.Create(&skill)
					zap.S().Infof("Created new skill %s", skillName)
				} else {
					zap.S().Error("Error finding skill: ", err)
					continue
				}
			}
			global.DB.Model(&project).Association("Skills").Append(&skill)
			zap.S().Infof("Added skill %s to project %d", skillName, project.ID)
		}
	}

	var client2 models.User
	skillsList = []string{"Javascript", "Golang", "React"}
	global.DB.Where("Email = ?", "client2@unsw.edu").First(&client2)

	for i := 6; i <= 20; i++ {
		project := models.Project{
			Name:          "Updated Project Title",
			Field:         "Machine Learning",
			MaxTeams:      10,
			IsPublic:      1,
			Description:   fmt.Sprintf("Description for project %d", i),
			ClientID:      &client2.ID,
		}

		global.DB.Create(&project)
		zap.S().Infof("Created project %d", i)

		for _, skillName := range skillsList {
			var skill models.Skill
			if err := global.DB.Where("skill_name = ?", skillName).First(&skill).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					skill = models.Skill{
						SkillName: skillName,
					}
					global.DB.Create(&skill)
					zap.S().Infof("Created new skill %s", skillName)
				} else {
					zap.S().Error("Error finding skill: ", err)
					continue
				}
			}
			global.DB.Model(&project).Association("Skills").Append(&skill)
			zap.S().Infof("Added skill %s to project %d", skillName, project.ID)
		}
	}
}

func main() {
	// initialize
	initialize.InitLogger()
	initialize.InitConfig() // must first initconfig then initialize database
	initialize.InitDB()

	// Auto migrate the model
	global.DB.AutoMigrate(&models.User{}, &models.Team{}, &models.Project{},
		&models.Skill{}, &models.Sprint{}, &models.UserStory{}, &models.TeamPreferenceProject{},
		&models.Notification{}, &models.UserNotifications{}, &models.Channel{}, &models.Message{}, &models.ChannelUser{})

	createUsers()
	createProjects()
	createTeams()

}
