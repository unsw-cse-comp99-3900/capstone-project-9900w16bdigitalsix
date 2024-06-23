package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mojocn/base64Captcha"
	"go.uber.org/zap"
)

var store = base64Captcha.DefaultMemStore // 默认内存

// 验证码 base64 解码， 前端用这个picPath 可以得到图片 base64 转图片

func GetCaptcha(ctx *gin.Context) {
	driver := base64Captcha.NewDriverDigit(80, 240, 5, 0.7, 80)
	cp := base64Captcha.NewCaptcha(driver, store)
	id, b64s, _, err := cp.Generate()
	if err != nil {
		zap.S().Errorf("生成验证码错误: ", err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"msg": "生成验证码错误"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"captchaID": id, "picPath": b64s})
}
