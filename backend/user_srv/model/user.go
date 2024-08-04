package model

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email    string `gorm:"index:idx_email;unique;type:varchar(255);not null"`
	Password string `gorm:"type:varchar(255);not null"`
	Username string `gorm:"type:varchar(16);not null"`
	Course   string `gorm:"type:varchar(16)"`
	Role     int    `gorm:"default:1;type:int comment '1 for student, 2 for tutor, 3 for coordinator, 4 for client, 5 for admin'"`
}
