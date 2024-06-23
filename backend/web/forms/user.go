package forms

type PasswordLoginForm struct {
	Email     string `form:"email" json:"email" binding:"required,email"`
	Password  string `form:"password" json:"password"  binding:"required,min=3,max=20"`
	// Captcha   string `form:"captcha" json:"captcha" binding:"required,len=5"`
	// CaptchaID string `form:"captcha_id" json:"captcha_id" binding:"required"`
}

type RegisterForm struct {
	Username        string `json:"username" binding:"required"`
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=3,max=20"`
	ConfirmPassword string `json:"password_confirm" binding:"required,eqfield=Password"`
}

type ChangePasswordForm struct {
	Email       string `form:"email" json:"email" binding:"required,email"`
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type ResetPasswordForm struct {
	Token              string `form:"token" json:"token" binding:"required"`
	NewPassword        string `json:"new_password" binding:"required"`
	NewPasswordConfirm string `json:"new_password_confirm" binding:"required,eqfield=NewPassword"`
}

type Profile struct {
	UserID       uint     `json:"userId"`
	Name         string   `json:"name"`
	Bio          string   `json:"bio"`
	Organization string   `json:"organization"`
	Position     string   `json:"position"`
	Skills       []string `json:"skills"`
	Field        string   `json:"field"`
}

type ProfileRequest struct {
	Profile Profile `json:"profile" binding:"required"`
}
