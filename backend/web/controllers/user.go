package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"

	"web/forms"
	"web/global"
	"web/global/response"
	"web/middlewares"
	"web/models"
	"web/proto"
	"web/service"
	"web/util"
)

// PasswordLogin handles user login using email and password
// @Summary User Login
// @Description Authenticate user with email and password, Role 1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin
// @Tags User
// @Accept json
// @Produce json
// @Param body body forms.PasswordLoginForm true "Login Form"
// @Success 200 {object} map[string]string "{"id": int, "username": string, "token": string, "expires_at": int64}"
// @Failure 400 {object} map[string]string "{"error": "Invalid credentials. Please check your email and password."}"
// @Failure 404 {object} map[string]string "{"error": "User not found"}"
// @Failure 500 {object} map[string]string "{"error": "Internal server error. Please try again later."}"
// @Router /v1/user/pwd_login [post]
func PasswordLogin(ctx *gin.Context) {
	// 表单验证
	passwordLoginForm := forms.PasswordLoginForm{}
	if err := ctx.ShouldBind(&passwordLoginForm); err != nil {
		HandleValidatorError(ctx, err)
		return
	}

	// // 验证码
	// if !store.Verify(passwordLoginForm.CaptchaID, passwordLoginForm.Captcha, true) {
	// 	ctx.JSON(http.StatusBadRequest, gin.H{
	// 		"captcha": "验证码错误",
	// 	})
	// 	return
	// }

	ip := global.ServerConfig.UserSrvInfo.Host
	port := global.ServerConfig.UserSrvInfo.Port

	// 拨号连接用户 grpc 服务
	clientConn, err := grpc.NewClient(fmt.Sprintf("%s:%d", ip, port), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		zap.S().Errorw("[GetUserList] 连接【用户服务】 失败",
			"msg", err.Error(),
		)
	}
	defer clientConn.Close()
	zap.S().Debug("用密码登陆")

	// 使用 clientConn 来创建服务客户端
	userSrvClient := proto.NewUserClient(clientConn)

	// 登录逻辑
	rsp, err := userSrvClient.GetUserByEmail(context.Background(), &proto.EmailRequest{
		Email: passwordLoginForm.Email, // 做完表单验证后
	})
	// zap.S().Infof("登陆用户 id: %d", rsp.Id)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() { // 把 grpc 的 code 转换成 HTTP 的状态码
			case codes.NotFound:
				ctx.JSON(http.StatusNotFound, gin.H{
					"error": "User not found",
				})
			default:
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error. Please try again later.",
				})
			}
			return
		}
	}
	// 用户存在， check密码
	if pwdRsp, pwdErr := userSrvClient.CheckPassword(ctx, &proto.CheckPasswordInfo{
		Passward:          passwordLoginForm.Password,
		EncryptedPassward: rsp.Password,
	}); pwdErr != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Login failed",
		})
	} else {
		if pwdRsp.Success { // 密码认证通过

			// 生成 token
			// 1. 创建 JWT 实例
			j := middlewares.NewJWT()
			// 2. 定义自定义声明 (CustomClaims) JWT的 payload 部分
			claims := models.CustomClaims{
				ID:          uint(rsp.Id),
				Username:    rsp.Username,
				AuthorityId: uint(rsp.Role),
				StandardClaims: jwt.StandardClaims{
					NotBefore: time.Now().Unix(),                          // 签名的生效时间，表示令牌在此时间之前无效
					ExpiresAt: time.Now().Add(30 * 24 * time.Hour).Unix(), // 30天过期
					Issuer:    "my-app",                                   // 签发者, 通常是发出令牌的应用程序或服务
				},
			}

			// 3. 创建Token
			token, err := j.CreateToken(claims)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"msg": "生成Token失败",
				})
				return
			}

			ctx.JSON(http.StatusOK, gin.H{
				"id":         rsp.Id,
				"role":       rsp.Role,
				"username":   rsp.Username,
				"token":      token,                                         // 前端可以从这个token 中解析出 JWT 中 的payload
				"expires_at": time.Now().Add(30*24*time.Hour).Unix() * 1000, // 单位毫秒， 30 天
			})

		} else { // 密码认证不对
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid credentials. Please check your email and password.",
			})
		}
	}
}

// VerifyEmail godoc
// @Summary 用户注册 (验证邮箱)
// @Description 验证邮箱，并完成用户注册
// @Tags User
// @Accept json
// @Produce json
// @Param token query string true "Verification Token"
// @Success 200 {object} map[string]interface{} "{"msg":"Register successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Invalid or expired token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to verify token"}"
// @Router /v1/user/register/verify [get]
func VerifyEmail(ctx *gin.Context) {
	token := ctx.Query("token")

	rdb := redis.NewClient(&redis.Options{
		Addr:     global.ServerConfig.RedisInfo.Host + ":" + fmt.Sprintf("%d", global.ServerConfig.RedisInfo.Port),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// 从 Redis 中获取 RegisterForm 数据
	data, err := rdb.Get(context.Background(), token).Result()
	if err == redis.Nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify token"})
		return
	}

	var registerForm forms.RegisterForm
	if err := json.Unmarshal([]byte(data), &registerForm); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse registration data"})
		return
	}

	// 删除 redis token 记录
	if err := rdb.Del(context.Background(), token).Err(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete token"})
		return
	}

	// 拨号连接用户 grpc 服务
	ip := global.ServerConfig.UserSrvInfo.Host
	port := global.ServerConfig.UserSrvInfo.Port
	clientConn, err := grpc.NewClient(fmt.Sprintf("%s:%d", ip, port), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		zap.S().Errorw("[GetUserList] 连接【用户服务】 失败",
			"msg", err.Error(),
		)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to user service"})
		return
	}
	defer clientConn.Close()

	// 使用 clientConn 来创建服务客户端
	userSrvClient := proto.NewUserClient(clientConn)
	_, err = userSrvClient.CreateUser(ctx, &proto.CreateUserInfo{
		Username: registerForm.Username,
		Email:    registerForm.Email,
		Password: registerForm.Password,
	})

	if err != nil {
		zap.S().Errorw("[Register] 【新建用户失败】%s", err)
		HandleGrpcErrorToHttp(err, ctx)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"msg": "注册成功",
	})

}

// Register godoc
// @Summary 用户注册 （发送邮件）
// @Description 用户注册，发送验证邮件
// @Tags User
// @Accept json
// @Produce json
// @Param registerForm body forms.RegisterForm true "Register form"
// @Success 200 {object} map[string]string "{"msg":"Verification email sent successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 409 {object} map[string]string "{"error": "User already exists"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to generate verification token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to store verification token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to send verification email"}"
// @Router /v1/user/register/send_email [post]
func Register(ctx *gin.Context) {
	var registerForm forms.RegisterForm
	// 表单验证
	if err := ctx.ShouldBind(&registerForm); err != nil {
		HandleValidatorError(ctx, err)
		return
	}

	// 检查用户是否存在
	var user models.User
	if err := global.DB.Where("email = ?", registerForm.Email).First(&user).Error; err == nil {
		ctx.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	token, err := generateVerificationToken()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}

	// 存储 token 和 RegisterForm 到 Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     global.ServerConfig.RedisInfo.Host + ":" + fmt.Sprintf("%d", global.ServerConfig.RedisInfo.Port),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// 令牌过期时间设置为 1 小时
	registerData, _ := json.Marshal(registerForm)
	if err := rdb.Set(context.Background(), token, registerData, 1*time.Hour).Err(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store verification token"})
		return
	}

	if err := SendEmail(registerForm.Email, token, 1); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"msg": "Verification email sent successfully"})
}

// SendEmailResetPassword godoc
// @Summary Send reset password email
// @Description 发送重置密码邮件
// @Tags User
// @Accept json
// @Produce json
// @Param sendEmailResetPwdForm body forms.SendEmailResetPwdForm true "Reset Password form"
// @Success 200 {object} map[string]string "{"msg":"Reset password email sent successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 404 {object} map[string]string "{"error": "User not found"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to generate verification token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to store verification token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to send reset password email"}"
// @Router /v1/user/forget_password/send_email [post]
func SendEmailResetPassword(c *gin.Context) {
	var sendEmailResetPwdForm forms.SendEmailResetPwdForm
	if err := c.ShouldBindJSON(&sendEmailResetPwdForm); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 检查用户是否存在
	var user models.User
	if err := global.DB.Where("email = ?", sendEmailResetPwdForm.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	token, err := generateVerificationToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}

	// 存储 token 到 Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     global.ServerConfig.RedisInfo.Host + ":" + fmt.Sprintf("%d", global.ServerConfig.RedisInfo.Port),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// 令牌过期时间设置为 1 小时
	if err := rdb.Set(context.Background(), token, sendEmailResetPwdForm.Email, 1*time.Hour).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store verification token"})
		return
	}

	if err := SendEmail(sendEmailResetPwdForm.Email, token, 2); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send reset password email"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"msg": "Reset password email sent successfully"})
}

// ResetPassword godoc
// @Summary Reset Password
// @Description 重置用户密码
// @Tags User
// @Accept json
// @Produce json
// @Param resetPasswordForm body forms.ResetPasswordForm true "Reset Password form"
// @Success 200 {object} map[string]string "{"msg":"Password reset successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Invalid or expired token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to verify token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to delete token"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to reset password"}"
// @Router /v1/user/reset/password [post]
func ResetPassword(ctx *gin.Context) {
	var resetPasswordForm forms.ResetPasswordForm
	if err := ctx.ShouldBindJSON(&resetPasswordForm); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token := resetPasswordForm.Token

	rdb := redis.NewClient(&redis.Options{
		Addr:     global.ServerConfig.RedisInfo.Host + ":" + fmt.Sprintf("%d", global.ServerConfig.RedisInfo.Port),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// 从 Redis 中获取 email
	email, err := rdb.Get(context.Background(), token).Result()
	if err == redis.Nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify token"})
		return
	}

	// 删除 redis token 记录
	if err := rdb.Del(context.Background(), token).Err(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete token"})
		return
	}

	// 重置密码
	if err := service.ResetPassword(email, resetPasswordForm.NewPassword); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"msg": "Password reset successfully",
	})
}

// ChangePassword godoc
// @Summary Change Password
// @Description 修改用户密码
// @Tags User
// @Accept json
// @Produce json
// @Param changePasswordForm body forms.ChangePasswordForm true "Change Password form"
// @Success 200 {object} map[string]string "{"msg":"Password updated successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 400 {object} map[string]string "{"error":"Original passwords do not match"}"
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Failure 500 {object} map[string]string "{"error":"Change Password failed"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to connect to user service"}"
// @Router /v1/user/change_password [post]
func ChangePassword(c *gin.Context) {
	var changePasswordForm forms.ChangePasswordForm
	if err := c.ShouldBindJSON(&changePasswordForm); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ip := global.ServerConfig.UserSrvInfo.Host
	port := global.ServerConfig.UserSrvInfo.Port

	// 拨号连接用户 grpc 服务
	clientConn, err := grpc.NewClient(fmt.Sprintf("%s:%d", ip, port), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		zap.S().Errorw("[GetUserList] 连接【用户服务】 失败",
			"error", err.Error(),
		)
	}
	defer clientConn.Close()
	zap.S().Info("修改密码")

	// 使用 clientConn 来创建服务客户端
	userSrvClient := proto.NewUserClient(clientConn)

	rsp, err := userSrvClient.GetUserByEmail(context.Background(), &proto.EmailRequest{
		Email: changePasswordForm.Email,
	})

	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() { // 把 grpc 的 code 转换成 HTTP 的状态码
			case codes.NotFound:
				c.JSON(http.StatusNotFound, gin.H{
					"error": "User not found",
				})
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Change password failed",
				})
			}
			return
		}
	}

	zap.S().Infof("用户修改密码 id: %d", rsp.Id)

	// 用户存在， check密码
	pwdRsp, pwdErr := userSrvClient.CheckPassword(c, &proto.CheckPasswordInfo{
		Passward:          changePasswordForm.OldPassword,
		EncryptedPassward: rsp.Password,
	})
	if pwdErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": pwdErr.Error(),
		})
		return
	}
	if pwdRsp.Success { // 密码认证通过
		// 调用 ResetPassword 函数
		if err := service.ResetPassword(changePasswordForm.Email, changePasswordForm.NewPassword); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"msg": "Password updated successfully",
		})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Original passwords do not match",
		})
	}
}

// UpdateUserInfo godoc
// @Summary Update User Profile
// @Description 更新用户个人信息和技能
// @Tags User
// @Accept json
// @Produce json
// @Param profileReq body forms.ProfileRequest true "Profile Request"
// @Success 200 {object} map[string]string "{"msg":"User profile updated successfully"}"
// @Failure 400 {object} map[string]string "{"error":"Validation failed"}"
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to create skill"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to query skill"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to update user skills"}"
// @Failure 500 {object} map[string]string "{"error":"Failed to update user profile"}"
// @Router /v1/user/modify/profile [post]
func UpdateUserInfo(c *gin.Context) {
	var profileReq forms.ProfileRequest
	if err := c.ShouldBindJSON(&profileReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := profileReq.Profile.UserID

	var user models.User
	if err := global.DB.Preload("Skills").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var filename string
	// 生成文件名
	if user.AvatarURL == "" {
		filename = time.Now().Format("20060102150405") + ".png"
	} else {
		urlStr := user.AvatarURL
		// 解析 URL
		parsedURL, err := url.Parse(urlStr)
		if err != nil {
			zap.S().Errorf("解析 avatar url 出错")
			return
		}
		// 提取路径部分并获取文件名
		filename = path.Base(parsedURL.Path)
	}

	// 解析 base64 图片， 并保存
	outputDir := global.ServerConfig.PicturePath

	_, url, err := util.SaveBase64Image(profileReq.Profile.Avatarbase64, filename, outputDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save picture"})
	}

	// 更新用户信息
	user.Username = profileReq.Profile.Name
	user.Bio = profileReq.Profile.Bio
	user.Organization = profileReq.Profile.Organization
	user.Role = profileReq.Profile.Role
	user.AvatarURL = url
	user.Field = profileReq.Profile.Field

	// 更新用户技能
	var skills []models.Skill
	for _, skillName := range profileReq.Profile.Skills {
		if skillName == "" {
			continue // 跳过空技能名称
		}
		var skill models.Skill
		// 先查询是否存在该技能，如果不存在则创建
		if err := global.DB.Where("skill_name = ?", skillName).First(&skill).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				skill = models.Skill{SkillName: skillName}
				if err := global.DB.Create(&skill).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create skill"})
					return
				}
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query skill"})
				return
			}
		}
		skills = append(skills, skill)
	}

	// 更新用户与技能的关联关系
	if err := global.DB.Model(&user).Association("Skills").Replace(skills); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user skills"})
		return
	}

	// 更新用户信息，当使用 struct 更新时，用 Updates 方法，默认情况下GORM 只会更新非零值的字段
	if err := global.DB.Model(&user).Updates(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
		fmt.Println("error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "User profile updated successfully"})
}

// GetPersonProfile godoc
// @Summary Get User Profile
// @Description 获取用户个人信息
// @Tags User
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Success 200 {object} response.ProfileResponse
// @Failure 404 {object} map[string]string "{"error":"User not found"}"
// @Router /v1/user/profile/{user_id} [get]
func GetPersonProfile(c *gin.Context) {
	userID := c.Param("user_id")

	var user models.User
	if err := global.DB.Preload("Skills").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 提取技能名称
	var skillNames []string
	for _, skill := range user.Skills {
		skillNames = append(skillNames, skill.SkillName)
	}

	profile := response.ProfileResponse{
		UserID:       user.ID,
		Name:         user.Username,
		Email:        user.Email,
		Bio:          user.Bio,
		Organization: user.Organization,
		AvatarURL:    user.AvatarURL,
		Skills:       skillNames,
		Field:        user.Field,
	}

	c.JSON(http.StatusOK, profile)
}

// @Summary Get Student List
// @Description 返回所有学生列表， 注意 users 表格里面有 Role 字段， 1表示student, 2表示tutor, 3表示client, 4表示convenor, 5表示admin
// @Tags User
// @Accept  json
// @Produce  json
// @Success 200 {array} response.StudentListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch users"}""
// @Router /v1/user/student/list [get]
func GetAllStudents(c *gin.Context) {
	var users []models.User
	if err := global.DB.Where("role = ?", 1).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// 映射到返回的结构体
	var userResponses []response.StudentListResponse
	for _, user := range users {
		userResponses = append(userResponses, response.StudentListResponse{
			UserID:   user.ID,
			UserName: user.Username,
			Email:    user.Email,
		})
	}

	c.JSON(http.StatusOK, userResponses)
}
