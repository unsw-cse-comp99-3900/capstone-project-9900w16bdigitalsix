package forms

type SendEmailResetPwdForm struct {
	Email string `json:"email" form:"email" binding:"required,email"`
	// Type  int    `json:"type" form:"type" binding:"required,oneof=1 2"` //  1: register captcha 2: forget password
}
