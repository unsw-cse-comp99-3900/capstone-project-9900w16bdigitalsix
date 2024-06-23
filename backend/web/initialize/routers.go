package initialize

import (
	"web/global"
	"web/middlewares"
	"web/routes"

	_ "web/docs" // 重要: 导入docs包，确保docs文件夹的路径正确

	"github.com/gin-gonic/gin"
	"github.com/swaggo/files"                  // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger" // gin-swagger middleware
)

func InitRouters() *gin.Engine {
	Router := gin.Default()
	// 配置跨域
	Router.Use(middlewares.CORS())
	Router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	imagesPath := global.ServerConfig.PicturePath
	filePath := global.ServerConfig.FilePath
	Router.Static("/images", imagesPath)
	Router.Static("files", filePath)

	ApiGroup := Router.Group("v1")
	routes.UserRouter(ApiGroup)
	routes.BaseRouter(ApiGroup)
	routes.GroupRouter(ApiGroup)
	routes.ProjectRouter(ApiGroup)
	return Router
}
