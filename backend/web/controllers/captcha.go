package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mojocn/base64Captcha"
	"go.uber.org/zap"
)

var store = base64Captcha.DefaultMemStore // default memory

func GetCaptcha(ctx *gin.Context) {
	driver := base64Captcha.NewDriverDigit(80, 240, 5, 0.7, 80)
	cp := base64Captcha.NewCaptcha(driver, store)
	id, b64s, _, err := cp.Generate()
	if err != nil {
		zap.S().Errorf("error: ", err.Error())
		ctx.JSON(http.StatusInternalServerError, gin.H{"msg": "cannot generate captcha"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"captchaID": id, "picPath": b64s})
}
