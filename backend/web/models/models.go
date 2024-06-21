package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email          string     `gorm:"index:idx_email;unique;type:varchar(255);not null"`
	Password       string     `gorm:"type:varchar(255);not null"`
	Username       string     `gorm:"type:varchar(16);not null"`
	Gender         string     `gorm:"default:male;type:varchar(6)"`
	Birthday       *time.Time `gorm:"type:datetime"`
	Bio            string     `json:"bio"`
	Organization   string     `json:"organization"`
	Position       string     `json:"position"`
	Field          string     `json:"field"`
	Phone          string
	Role           int `gorm:"default:1;type:int comment '1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin'"`
	TechStack      string
	BelongsToGroup *uint     `gorm:"default:null"`
	Teams          []Team    `gorm:"foreignkey:TutorID"`       //  a turor responsible for many groups
	Projects       []Project `gorm:"foreignkey:CreatedBy"`     // a client can create many projects
	Skills         []Skill   `gorm:"many2many:student_skills"` // a student has many skills, a skill can have many students
}

type Team struct {
	gorm.Model
	Name            string
	TutorID         *uint     `gorm:"default:null"`
	ProjectID       *uint     `gorm:"default:null"`
	Members         []User    `gorm:"foreignkey:BelongsToGroup"` // a group has many students
	PreferencedProj []Project `gorm:"many2many:team_preferenced_projects"`
	Skills          []Skill   `gorm:"many2many:team_skills;"`
}

type Project struct {
	gorm.Model
	Name          string
	Field         string
	IsPublic      uint   `gorm:"default:1;type:int comment '1表示public 2 表示没有public'"`
	Description   string `gorm:"type:text"`
	MaxGroups     uint
	CreatedBy     *uint   `gorm:"default:null"`
	Teams         []Team  `gorm:"foreignkey:ProjectID"`                // a project can be done by many groups
	PreferencedBy []Team  `gorm:"many2many:team_preferenced_projects"` // a project can be preferenced by many groups
	Skills        []Skill `gorm:"many2many:project_skills;"`
}

type Skill struct {
	gorm.Model
	SkillName string    `gorm:"type:text"`
	Students  []User    `gorm:"many2many:student_skills"`
	Teams     []Team    `gorm:"many2many:team_skills;"`
	Projects  []Project `gorm:"many2many:project_skills;"`
}
