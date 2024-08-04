package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/*
	OPTIONS预检请求：在跨域请求中，浏览器会先发送一个OPTIONS请求，以确定服务器是否允许该实际请求。
	这个预检请求不带实际数据，只是询问服务器是否允许接下来的跨域请求。
	如果请求方法是OPTIONS，直接返回204 No Content状态码，表示成功但无内容。
	如果不是OPTIONS请求，调用c.Next()继续处理其他中间件和请求处理逻辑。
*/
// CORS中间件函数
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method

		// 设置CORS头
		c.Header("Access-Control-Allow-Origin", "*")                                                                                         // 允许所有来源
		c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization, Token")                              // 指定允许的请求头，如Content-Type、Authorization等
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PATCH, PUT")                                                   // 允许的请求方法
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type") // 指定可以暴露给浏览器的响应头
		c.Header("Access-Control-Allow-Credentials", "true")                                                                                 // 允许发送凭证（如Cookies）

		// 处理OPTIONS预检请求
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent) // 直接返回204 No Content状态码, 表示成功但无内容
		} else {
			c.Next() // 继续处理其他请求
		}
	}
}
