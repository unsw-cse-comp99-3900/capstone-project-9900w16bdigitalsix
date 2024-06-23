package forms

type SendEmailResetPwdForm struct {
	Email string `json:"email" form:"email" binding:"required,email"`
	// Type  int    `json:"type" form:"type" binding:"required,oneof=1 2"` // 注意中间的空格 1: 注册验证码 2: 忘记密码登陆验证码
}
