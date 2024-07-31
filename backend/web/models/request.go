package models

import (
	"github.com/dgrijalva/jwt-go"
)

type CustomClaims struct {
	ID          uint
	Username   string
	AuthorityId uint // role 管理员或者普通用户
	jwt.StandardClaims
}
