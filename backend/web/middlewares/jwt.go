package middlewares

import (
	"errors"
	"strings"

	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"

	"web/global"
	"web/models"
)

/*
	JWT 的结构 Header.Payload.Signature
	1. 头部通常由两部分组成：令牌类型（即 "JWT"）和签名使用的哈希算法（例如 HMAC SHA256 或 RSA）。
	头部是一个 JSON 对象，Base64Url 编码后构成 JWT 的第一部分。
	2. 载荷部分包含声明（claims）。声明是有关实体（通常是用户）和其他数据的声明。
	3. 签名部分是为了确保令牌的完整性和真实性。首先，使用头部中指定的算法（例如 HMAC SHA256）对编码后的头部和载荷进行签名。

	JWT 的使用
	1. 生成和签发：服务器生成一个 JWT，并将其签发给客户端。生成过程中会对头部和载荷进行 Base64Url 编码，并使用指定的算法和密钥生成签名。
	2. 存储和传输：客户端通常将 JWT 存储在本地（如 Local Storage 或 Cookies），
	并在每次请求时将其包含在 HTTP 请求头中（例如 Authorization: Bearer <token>）。
	3. 验证和解析：服务器接收到 JWT 后，会验证签名的有效性。如果签名有效，服务器解析载荷并根据其中的声明执行相应的操作。
	JWT 会放在 HTTP 请求头的 Authorization 字段中，格式为 Bearer <token>。
*/

// JWTAuth 中间件，验证 JWT
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 我们这里jwt鉴权取头部信息 Authorization 登录时回返回token信息 这里前端需要把token存储到cookie或者本地localSstorage中 不过需要跟后端协商过期时间 可以约定刷新令牌或者重新登录
		// 前端在后续请求中把 JWT 包含在请求头中， Authorization: Bearer <token>
		// 后端从请求头中获取令牌
		tokenString := c.Request.Header.Get("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"msg": "请登录"})
			c.Abort()
			return
		}

		// 提取 "Bearer " 前缀后的实际令牌
		parts := strings.SplitN(tokenString, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"msg": "请提供合法的Token"})
			c.Abort()
			return
		}

		token := parts[1]

		j := NewJWT()
		// parseToken 解析token包含的信息
		claims, err := j.ParseToken(token)
		if err != nil {
			if err == ErrTokenExpired {
				c.JSON(http.StatusUnauthorized, gin.H{"msg": "授权已过期"})
				c.Abort()
				return
			}

			c.JSON(http.StatusUnauthorized, gin.H{"msg": "未登录"})
			c.Abort()
			return
		}

		c.Set("claims", claims)
		// fmt.Println(claims)
		c.Set("userID", claims.ID)
		c.Next()
	}
}

type JWT struct {
	SigningKey []byte // 签名密钥
}

var (
	ErrTokenExpired     = errors.New("token is expired")
	ErrTokenNotValidYet = errors.New("token not active yet")
	ErrTokenMalformed   = errors.New("that's not even a token")
	ErrTokenInvalid     = errors.New("couldn't handle this token")
)

func NewJWT() *JWT {
	return &JWT{
		[]byte(global.ServerConfig.JWTInfo.SigningKey),
	}
}

// 创建一个token
func (j *JWT) CreateToken(claims models.CustomClaims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.SigningKey) // 返回一个 JWT 字符串
}

// 解析 token
func (j *JWT) ParseToken(tokenString string) (*models.CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &models.CustomClaims{}, func(token *jwt.Token) (i interface{}, e error) {
		return j.SigningKey, nil // &models.CustomClaims{}：用于存储解析后的声明的自定义结构
	})
	if err != nil {
		if ve, ok := err.(*jwt.ValidationError); ok {
			if ve.Errors&jwt.ValidationErrorMalformed != 0 {
				return nil, ErrTokenMalformed
			} else if ve.Errors&jwt.ValidationErrorExpired != 0 {
				// Token is expired
				return nil, ErrTokenExpired
			} else if ve.Errors&jwt.ValidationErrorNotValidYet != 0 {
				return nil, ErrTokenNotValidYet
			} else {
				return nil, ErrTokenInvalid
			}
		}
	}
	if token != nil {
		if claims, ok := token.Claims.(*models.CustomClaims); ok && token.Valid {
			return claims, nil
		}
		return nil, ErrTokenInvalid

	} else {
		return nil, ErrTokenInvalid

	}

}

// 更新token
func (j *JWT) RefreshToken(tokenString string) (string, error) {
	jwt.TimeFunc = func() time.Time {
		return time.Unix(0, 0)
	}
	token, err := jwt.ParseWithClaims(tokenString, &models.CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return j.SigningKey, nil
	})
	if err != nil {
		return "", err
	}
	if claims, ok := token.Claims.(*models.CustomClaims); ok && token.Valid {
		jwt.TimeFunc = time.Now
		claims.StandardClaims.ExpiresAt = time.Now().Add(1 * time.Hour).Unix()
		return j.CreateToken(*claims)
	}
	return "", ErrTokenInvalid
}
