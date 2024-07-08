package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email              string `gorm:"index:idx_email;unique;type:varchar(255);not null"`
	Password           string `gorm:"type:varchar(255);not null"`
	Username           string `gorm:"type:varchar(16);not null"`
	AvatarURL          string `gorm:"type:varchar(255)"`
	Bio                string `json:"bio"`
	Organization       string `json:"organization"`
	Position           string `json:"position"`
	Field              string `json:"field"`
	Phone              string
	Role               int            `gorm:"default:1;type:int comment '1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin'"`
	BelongsToGroup     *uint          `gorm:"default:null"`
	ClientProjects     []Project      `gorm:"foreignkey:ClientID"`      // a client/coordinator can create/responsible for many projects
	TutorProjects      []Project      `gorm:"foreignkey:TutorID"`       // a tutor responsible for many projects
	CoordinatorProject []Project      `gorm:"foreignkey:CoordinatorID"` // a coordinator responsible for many projects
	Skills             []Skill        `gorm:"many2many:student_skills"` // a student has many skills, a skill can have many students
	Notifications      []Notification `gorm:"many2many:user_notifications"`
}

type Team struct {
	gorm.Model
	TeamIdShow       uint
	Name             string
	TutorID          *uint                   `gorm:"default:null"`
	AllocatedProject *uint                   `gorm:"default:null"`
	Members          []User                  `gorm:"foreignkey:BelongsToGroup"` // a group has many students
	PreferencedProj  []TeamPreferenceProject `gorm:"foreignkey:TeamID"`         // 使用Preference模型
	Skills           []Skill                 `gorm:"many2many:team_skills;"`
	Sprints          []Sprint                `gorm:"foreignkey:TeamID"` // 一个团队有多个Sprint
}

type Project struct {
	gorm.Model
	Name          string
	Field         string
	IsPublic      uint                    `gorm:"default:1;type:int comment '1表示public 2 表示没有public'"`
	Description   string                  `gorm:"type:text"`
	Filename      string                  `gorm:"type:text;"`
	FileURL       string                  `gorm:"type:varchar(255)"` // 存储文件路径
	ClientID      *uint                   `gorm:"default:null"`      // 一个项目被谁负责的
	TutorID       *uint                   `gorm:"default:null"`
	CoordinatorID *uint                   `gorm:"default:null"`
	Teams         []Team                  `gorm:"foreignkey:AllocatedProject"` // a project can be done by many groups
	PreferencedBy []TeamPreferenceProject `gorm:"foreignkey:ProjectID"`        // 使用Preference模型
	Skills        []Skill                 `gorm:"many2many:project_skills;"`
}

// Preference model
type TeamPreferenceProject struct {
	ID        uint   `gorm:"primaryKey"`
	TeamID    uint   `gorm:"primaryKey"`
	ProjectID uint   `gorm:"primaryKey"`
	Reason    string `gorm:"type:text"`
}

type Skill struct {
	gorm.Model
	SkillName string    `gorm:"type:text;collate:utf8mb4_bin"`
	Students  []User    `gorm:"many2many:student_skills"`
	Teams     []Team    `gorm:"many2many:team_skills;"`
	Projects  []Project `gorm:"many2many:project_skills;"`
}

// Notification model
type Notification struct {
	gorm.Model
	Content string `gorm:"type:text"`
	Users   []User `gorm:"many2many:user_notifications"`
}

type UserNotifications struct {
	UserID         uint `gorm:"primaryKey"`
	NotificationID uint `gorm:"primaryKey"`
}

type Sprint struct {
	TeamID      uint        `gorm:"primaryKey;not null"` // 外键，关联到团队
	SprintNum   int         `gorm:"primaryKey;not null"` // Sprint编号，从1到3
	StartDate   time.Time   `gorm:"type:datetime"`
	EndDate     time.Time   `gorm:"type:datetime"`
	Grade       int         `gorm:"not null"`                                                // 打分
	Comment     string      `gorm:"type:text"`                                               // 评语
	UserStories []UserStory `gorm:"foreignKey:TeamID,SprintNum;references:TeamID,SprintNum"` // 一个Sprint有多个UserStory
}

type UserStory struct {
	gorm.Model
	TeamID      uint   `gorm:"not null"` // 外键，关联到Sprint的TeamID
	SprintNum   int    `gorm:"not null"` // 外键，关联到Sprint的SprintNum
	Description string `gorm:"type:text"`
	Status      int    `gorm:"not null"` // 1表示未完成，2表示进行中，3表示已完成
}
