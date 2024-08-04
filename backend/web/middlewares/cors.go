package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// OPTIONS preflight request: In cross-origin requests, the browser sends an OPTIONS request first to determine if the server allows the actual request.
// This preflight request doesn't contain any actual data, it's just asking the server if the subsequent cross-origin request is permitted.
// If the request method is OPTIONS, it directly returns a 204 No Content status code, indicating success but no content.
// If it's not an OPTIONS request, it calls c.Next() to continue processing other middleware and request handling logic.

// CORS middlewares
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method

		// set CORS HEADER
		c.Header("Access-Control-Allow-Origin", "*") // Allow all sources
		c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization, Token")
		c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PATCH, PUT")                                                   // Allowed request method
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type") // Specifies the response headers that can be exposed to the browser
		c.Header("Access-Control-Allow-Credentials", "true")                                                                                 // Allow sending of credentials (such as Cookies)

		// handle option request
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent) // No Content status code
		} else {
			c.Next() // continue handle other request
		}
	}
}
