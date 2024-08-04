package middlewares

import (
	"net/http"
	"web/models"

	"github.com/gin-gonic/gin"
)

func IsAdmin() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		claims, _ := ctx.Get("claims")
		currentUser := claims.(*models.CustomClaims) // type assertion
		if currentUser.AuthorityId != 5 {
			ctx.JSON(http.StatusForbidden, gin.H{
				"msg": "only admin have permission",
			})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}
