package initialize

import (
	"web/middlewares"
	"web/routes"

	_ "web/docs" // 重要: 导入docs包，确保docs文件夹的路径正确

	"github.com/gin-gonic/gin"               
	"github.com/swaggo/files" // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger" // gin-swagger middleware
)

func InitRouters() *gin.Engine {
	Router := gin.Default()
	// 配置跨域
	Router.Use(middlewares.CORS())
	Router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	ApiGroup := Router.Group("v1")
	routes.UserRouter(ApiGroup)
	routes.BaseRouter(ApiGroup)
	routes.GroupRouter(ApiGroup)
	return Router
}