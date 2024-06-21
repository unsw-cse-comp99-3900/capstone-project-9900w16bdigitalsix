package routes

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"web/controllers"
	"web/middlewares"
)

func BaseRouter(Router *gin.RouterGroup) {
	UserRouter := Router.Group("base")
	zap.S().Info("配置验证码 url")
	{
		UserRouter.GET("/captcha", controllers.GetCaptcha)
	}
}

func UserRouter(Router *gin.RouterGroup) {
	UserRouter := Router.Group("user")
	zap.S().Info("配置用户相关的 url")
	{
		// UserRouter.GET("/list", middlewares.JWTAuth(), middlewares.IsAdmin(), controllers.GetUserList) // 需要登录才能访问

		UserRouter.POST("/register/send_email", controllers.Register)
		UserRouter.GET("/register/verify", controllers.VerifyEmail)
		UserRouter.POST("/pwd_login", controllers.PasswordLogin)
		UserRouter.POST("/change_password", controllers.ChangePassword)
		UserRouter.POST("/forget_password/send_email", controllers.SendEmailResetPassword)
		UserRouter.POST("/reset/password", controllers.ResetPassword)
		UserRouter.POST("/modify/profile", controllers.UpdateUserInfo)
		UserRouter.GET("/profile/:user_id", middlewares.JWTAuth(), controllers.GetPersonProfile)
	}
}

func GroupRouter(Router *gin.RouterGroup) {
	groupRouter := Router.Group("team")
	zap.S().Info("配置分组相关的 url")
	{
		groupRouter.POST("/create", controllers.CreateTeam)
		groupRouter.PUT("/update/profile/:teamId", controllers.UpdateTeamProfile)
		groupRouter.PUT("/join", controllers.JoinTeam)
		groupRouter.GET("/profile/:userId", controllers.GetTeamProfile)
		groupRouter.DELETE("/leave", controllers.LeaveTeam)

		// groupRouter.POST("/groups/:group_id/invite", controllers.InviteToTeam)
		// groupRouter.POST("/groups/:group_id/leave", controllers.LeaveTeam)

	}
}