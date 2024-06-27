package controllers

import (
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"web/models"
)

func ExtractSkillNames(skills []models.Skill) []string {
    skillNames := make([]string, len(skills))
    for i, skill := range skills {
        skillNames[i] = skill.SkillName
    }
    return skillNames
}

func HandleValidatorError(ctx *gin.Context, err error) {
	errs, ok := err.(validator.ValidationErrors)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"msg": err.Error(),
		})
	}

	ctx.JSON(http.StatusBadRequest, gin.H{
		"msg": errs.Error(),
	})

}

// HandleGrpcErrorToHttp 将 gRPC 的 code 转换成 HTTP 的状态码
func HandleGrpcErrorToHttp(err error, c *gin.Context) {
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
			case codes.NotFound:
				c.JSON(http.StatusNotFound, gin.H{
					"msg": e.Message(),
				})
			case codes.Internal:
				c.JSON(http.StatusInternalServerError, gin.H{
					"msg": "内部错误",
				})
			case codes.InvalidArgument:
				c.JSON(http.StatusBadRequest, gin.H{
					"msg": "参数错误",
				})
			case codes.Unavailable:
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"msg": "服务不可用",
				})
			case codes.Unauthenticated:
				c.JSON(http.StatusUnauthorized, gin.H{
					"msg": "未认证",
				})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"msg": e.Message(),
				})
			}
			return
		}
	}
}


func GenerateRandomNumber(r *rand.Rand) int {
    // 定义最小和最大值
    min := 1
    max := 9999
    
    // 生成随机数
    return r.Intn(max-min+1) + min
}
