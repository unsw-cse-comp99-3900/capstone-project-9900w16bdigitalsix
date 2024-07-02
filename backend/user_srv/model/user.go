package model

import (
	"gorm.io/gorm"
)

// type BaseModel struct {
// 	gorm.Model
// 	ID        int32      `gorm:"primary_key"`
// 	CreatedAt time.Time  `gorm:"column:created_at"`
// 	UpdatedAt time.Time  `gorm:"column:updated_at"`
// 	DeletedAt *time.Time `gorm:"column:deleted_at"`
// 	IsDeleted bool
// }

type User struct {
	gorm.Model
	Email    string `gorm:"index:idx_email;unique;type:varchar(255);not null"`
	Password string `gorm:"type:varchar(255);not null"`
	Username string `gorm:"type:varchar(16);not null"`
	Role     int    `gorm:"default:1;type:int comment '1表示student, 2表示tutor, 3表示convenor, 4表示client, 5表示admin'"`
}
