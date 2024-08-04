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
// @Description Authenticate user with email and password
// @Tags Personal Management
// @Accept json
// @Produce json
// @Param body body forms.PasswordLoginForm true "Login Form"
// @Success 200 {object} map[string]string "{"id": int, "username": string, "token": string, "expires_at": int64}"
// @Failure 400 {object} map[string]string "{"error": "Invalid credentials. Please check your email and password."}"
// @Failure 404 {object} map[string]string "{"error": "User not found"}"
// @Failure 500 {object} map[string]string "{"error": "Internal server error. Please try again later."}"
// @Router /v1/user/pwd_login [post]
func PasswordLogin(ctx *gin.Context) {
	passwordLoginForm := forms.PasswordLoginForm{}
	if err := ctx.ShouldBind(&passwordLoginForm); err != nil {
		HandleValidatorError(ctx, err)
		return
	}

	ip := global.ServerConfig.UserSrvInfo.Host
	port := global.ServerConfig.UserSrvInfo.Port

	// connect gprc service
	clientConn, err := grpc.NewClient(fmt.Sprintf("%s:%d", ip, port), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		zap.S().Errorw("[GetUserList] connection failed",
			"msg", err.Error(),
		)
	}
	defer clientConn.Close()
	zap.S().Debug("login")

	userSrvClient := proto.NewUserClient(clientConn)

	// login logic
	rsp, err := userSrvClient.GetUserByEmail(context.Background(), &proto.EmailRequest{
		Email: passwordLoginForm.Email,
	})
	// zap.S().Infof("login user id: %d", rsp.Id)
	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() { // change grpc 的 code to HTTP status code
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
	// check password
	if pwdRsp, pwdErr := userSrvClient.CheckPassword(ctx, &proto.CheckPasswordInfo{
		Passward:          passwordLoginForm.Password,
		EncryptedPassward: rsp.Password,
	}); pwdErr != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Login failed",
		})
	} else {
		if pwdRsp.Success { // password is correct

			// Token Generator
			// 1. Create a JWT instance
			j := middlewares.NewJWT()
			// 2. Define the payload portion of the CustomClaims JWT
			claims := models.CustomClaims{
				ID:          uint(rsp.Id),
				Username:    rsp.Username,
				AuthorityId: uint(rsp.Role),
				StandardClaims: jwt.StandardClaims{
					NotBefore: time.Now().Unix(),                          // token is valid now
					ExpiresAt: time.Now().Add(30 * 24 * time.Hour).Unix(), // 30 days expiers
					Issuer:    "my-app",                                   // issuer name
				},
			}

			// 3.  create Token
			token, err := j.CreateToken(claims)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"msg": "fail to create token",
				})
				return
			}

			ctx.JSON(http.StatusOK, gin.H{
				"id":         rsp.Id,
				"role":       rsp.Role,
				"username":   rsp.Username,
				"token":      token,
				"expires_at": time.Now().Add(30*24*time.Hour).Unix() * 1000, //30 days
			})

		} else { // password incorrect
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid credentials. Please check your email and password.",
			})
		}
	}
}

// VerifyEmail godoc
// @Summary User register (verify email)
// @Description verify email and complete register
// @Tags Personal Management
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

	// from Redis get RegisterForm data
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

	// delete redis token record
	if err := rdb.Del(context.Background(), token).Err(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete token"})
		return
	}

	// connect to grpc server
	ip := global.ServerConfig.UserSrvInfo.Host
	port := global.ServerConfig.UserSrvInfo.Port
	clientConn, err := grpc.NewClient(fmt.Sprintf("%s:%d", ip, port), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		zap.S().Errorw("[GetUserList] connect failed",
			"msg", err.Error(),
		)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to user service"})
		return
	}
	defer clientConn.Close()

	userSrvClient := proto.NewUserClient(clientConn)
	_, err = userSrvClient.CreateUser(ctx, &proto.CreateUserInfo{
		Username: registerForm.Username,
		Email:    registerForm.Email,
		Course:   registerForm.Course,
		Password: registerForm.Password,
	})

	if err != nil {
		zap.S().Errorw("[Register] 【create user account failed】%s", err)
		HandleGrpcErrorToHttp(err, ctx)
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"msg": "register successfully",
	})

}

// Register godoc
// @Summary User register（send email）
// @Description user register, send email
// @Tags Personal Management
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

	if err := ctx.ShouldBind(&registerForm); err != nil {
		HandleValidatorError(ctx, err)
		return
	}

	// check if user exists
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

	// store token and RegisterForm to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     global.ServerConfig.RedisInfo.Host + ":" + fmt.Sprintf("%d", global.ServerConfig.RedisInfo.Port),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	// token expiration 1 hour
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
// @Summary Reset password (send email)
// @Description send reset password email
// @Tags Personal Management
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

	// chaeck if user exists
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

	// store token to Redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     global.ServerConfig.RedisInfo.Host + ":" + fmt.Sprintf("%d", global.ServerConfig.RedisInfo.Port),
		Password: "", // no password set
		DB:       0,  // use default DB
	})

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
// @Description reset password
// @Tags Personal Management
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

	// from Redis get email
	email, err := rdb.Get(context.Background(), token).Result()
	if err == redis.Nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify token"})
		return
	}

	// delete redis token record
	if err := rdb.Del(context.Background(), token).Err(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete token"})
		return
	}

	// reset password
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
// @Description change password
// @Tags Personal Management
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

	// connect to grpc server
	clientConn, err := grpc.NewClient(fmt.Sprintf("%s:%d", ip, port), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		zap.S().Errorw("[GetUserList] connecction failed",
			"error", err.Error(),
		)
	}
	defer clientConn.Close()
	zap.S().Info("change passsword")

	userSrvClient := proto.NewUserClient(clientConn)

	rsp, err := userSrvClient.GetUserByEmail(context.Background(), &proto.EmailRequest{
		Email: changePasswordForm.Email,
	})

	if err != nil {
		if e, ok := status.FromError(err); ok {
			switch e.Code() {
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

	zap.S().Infof("User change password id: %d", rsp.Id)

	// user exists, check password
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
	if pwdRsp.Success { // password correct

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
// @Description update user profile
// @Tags Personal Management
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
	// generate file name
	if user.AvatarURL == "" {
		filename = time.Now().Format("20060102150405") + ".png"
	} else {
		urlStr := user.AvatarURL

		parsedURL, err := url.Parse(urlStr)
		if err != nil {
			zap.S().Errorf("parse avatar url error")
			return
		}

		filename = path.Base(parsedURL.Path)
	}

	url := ""
	if profileReq.Profile.Avatarbase64 != "" {
		// base64 analysis， save
		outputDir := global.ServerConfig.PicturePath
		var err error
		_, url, err = util.SaveBase64Image(profileReq.Profile.Avatarbase64, filename, outputDir)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save picture"})
		}
	}

	// update user info
	user.Username = profileReq.Profile.Name
	user.Bio = profileReq.Profile.Bio
	user.Organization = profileReq.Profile.Organization
	user.Role = profileReq.Profile.Role
	user.AvatarURL = url
	user.Field = profileReq.Profile.Field
	user.Course = profileReq.Profile.Course

	var skills []models.Skill
	for _, skillName := range profileReq.Profile.Skills {
		if skillName == "" {
			continue
		}
		var skill models.Skill
		// if skills doesn't exists, create skills
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

	if err := global.DB.Model(&user).Association("Skills").Replace(skills); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user skills"})
		return
	}

	if err := global.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
		fmt.Println("error", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"msg": "User profile updated successfully"})
}

// GetPersonProfile godoc
// @Summary Get User Profile
// @Description Get User Profile
// @Tags Personal Management
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

	// get skills name
	var skillNames []string
	for _, skill := range user.Skills {
		skillNames = append(skillNames, skill.SkillName)
	}

	profile := response.ProfileResponse{
		UserID:       user.ID,
		Name:         user.Username,
		Email:        user.Email,
		Course:       user.Course,
		Role:         user.Role,
		Bio:          user.Bio,
		Organization: user.Organization,
		AvatarURL:    user.AvatarURL,
		Skills:       skillNames,
		Field:        user.Field,
	}

	c.JSON(http.StatusOK, profile)
}

// @Summary Get all students List
// @Description get all student list
// @Tags Student
// @Accept  json
// @Produce  json
// @Success 200 {array} response.StudentListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch users"}""
// @Router /v1/user/student/list [get]
func GetAllStudents(c *gin.Context) {
	var users []models.User
	if err := global.DB.Where("role = ?", 1).Preload("Skills").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	var userResponses []response.StudentListResponse
	for _, user := range users {
		var skills []string
		for _, skill := range user.Skills {
			skills = append(skills, skill.SkillName)
		}

		userResponses = append(userResponses, response.StudentListResponse{
			UserID:     user.ID,
			UserName:   user.Username,
			Role:       user.Role,
			Email:      user.Email,
			Course:     user.Course,
			AvatarURL:  user.AvatarURL,
			UserSkills: skills,
		})
	}

	c.JSON(http.StatusOK, userResponses)
}

// GetAllUnassignedStudents godoc
// @Summary Get all students unassigned list
// @Description Get all students unassigned list
// @Tags Student
// @Accept  json
// @Produce  json
// @Success 200 {array} response.StudentListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch users"}"
// @Router /v1/student/unassigned/list [get]
func GetAllUnassignedStudents(c *gin.Context) {
	var users []models.User
	if err := global.DB.Where("role = ? AND belongs_to_group IS NULL", 1).Preload("Skills").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	var userResponses []response.StudentListResponse
	for _, user := range users {
		var skills []string
		for _, skill := range user.Skills {
			skills = append(skills, skill.SkillName)
		}

		userResponses = append(userResponses, response.StudentListResponse{
			UserID:     user.ID,
			UserName:   user.Username,
			Role:       user.Role,
			Email:      user.Email,
			AvatarURL:  user.AvatarURL,
			Course:     user.Course,
			UserSkills: skills,
		})
	}

	c.JSON(http.StatusOK, userResponses)
}

// @Summary Get all users List
// @Description   Role field（int）， 1 represent student, 2 represent tutor, 3 represent client, 4 represent convenor, 5 represent admin
// @Tags User
// @Accept  json
// @Produce  json
// @Param Authorization header string true "Bearer <token>"
// @Success 200 {array} response.UserListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch users"}"
// @Failure 403 {object} map[string]string "{"error": "only admin have permission"}"
// @Failure 401 {object} map[string]string "{"error": "Please login"}"
// @Router /v1/user/get/user/list [get]
func GetAllUsersInfo(c *gin.Context) {
	var users []models.User
	if err := global.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	var userResponses []response.UserListResponse
	for _, user := range users {
		userResponses = append(userResponses, response.UserListResponse{
			UserID:    user.ID,
			UserName:  user.Username,
			Email:     user.Email,
			Role:      user.Role,
			AvatarURL: user.AvatarURL,
		})
	}

	c.JSON(http.StatusOK, userResponses)
}

// @Summary Get all students have the same course doesn't join the team
// @Description Get all students who have the same course as the user and are not in any team
// @Tags Student
// @Accept  json
// @Produce  json
// @Param userId path int true "User ID"
// @Success 200 {array} response.StudentListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch users"}"
// @Router /v1/user/same/course/student/list/{userId} [get]
func GetAllSameCourseStudents(c *gin.Context) {
	userId := c.Param("userId")

	var user models.User
	if err := global.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	var students []models.User
	if err := global.DB.Where("role = ? AND course = ? AND belongs_to_group IS NULL", 1, user.Course).Preload("Skills").Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	var studentResponses []response.StudentListResponse
	for _, student := range students {
		var skills []string
		for _, skill := range student.Skills {
			skills = append(skills, skill.SkillName)
		}

		studentResponses = append(studentResponses, response.StudentListResponse{
			UserID:     student.ID,
			UserName:   student.Username,
			Role:       student.Role,
			Email:      student.Email,
			Course:     student.Course,
			AvatarURL:  student.AvatarURL,
			UserSkills: skills,
		})
	}

	c.JSON(http.StatusOK, studentResponses)
}

// @Summary Get all unassigned students list by course
// @Description Return a list of unassigned students, note that the Role field in the users table, 1 represents student, 2 represents tutor, 3 represents client, 4 represents convenor, 5 represents admin
// @Tags Student
// @Accept  json
// @Produce  json
// @Param course path string true "Course"
// @Success 200 {array} response.StudentListResponse
// @Failure 500 {object} map[string]string "{"error": "Failed to fetch students"}"
// @Router /v1/student/unassigned/list/{course} [get]
func GetAllUnassignedStudentsByCourse(c *gin.Context) {
	course := c.Param("course")

	var users []models.User
	if err := global.DB.Where("role = ? AND belongs_to_group IS NULL AND course = ?", 1, course).Preload("Skills").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	var userResponses []response.StudentListResponse
	for _, user := range users {
		var skills []string
		for _, skill := range user.Skills {
			skills = append(skills, skill.SkillName)
		}

		userResponses = append(userResponses, response.StudentListResponse{
			UserID:     user.ID,
			UserName:   user.Username,
			Role:       user.Role,
			Email:      user.Email,
			AvatarURL:  user.AvatarURL,
			Course:     user.Course,
			UserSkills: skills,
		})
	}

	c.JSON(http.StatusOK, userResponses)
}
