package controllers

import (
	"crypto/tls"
	"encoding/hex"
	"fmt"
	"math/rand"

	"go.uber.org/zap"
	"gopkg.in/gomail.v2"

	"web/global"
)


func generateVerificationToken() (string, error) {
	token := make([]byte, 8) // 8字节 = 16字符，因为每个字节是2个字符
	if _, err := rand.Read(token); err != nil {
		return "", fmt.Errorf("failed to generate random token: %w", err)
	}
	return hex.EncodeToString(token), nil
}

// emailType 1: register, 2: forget password
func SendEmail(toEmail, token string, emailType int) error {

	// 配置SMTP服务器信息
	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	smtpUser := global.ServerConfig.GmailInfo.SendEmail
	smtpPass := global.ServerConfig.GmailInfo.Password

	host := global.ServerConfig.Host
	// port := global.ServerConfig.Port
	var registerLink string
	var resetPasswordLink string
	if emailType == 1 {
		registerLink = fmt.Sprintf("http://%s:3000/verify-email-check?token=%s", host, token)
	} else if (emailType == 2) {
		resetPasswordLink = fmt.Sprintf("http://%s:3000/reset-pwd?email=%s&token=%s", host, toEmail, token)
		fmt.Println("email:", toEmail)
	}
	
	// 使用邮件服务发送邮件
	m := gomail.NewMessage()
	m.SetHeader("From", smtpUser)
	m.SetHeader("To", toEmail)
	if (emailType == 1) {
		m.SetHeader("Subject", "Verify your email")
	} else if (emailType == 2) {
		m.SetHeader("Subject", "Reset your password")
	}
	
	if (emailType == 1) {
		m.SetBody("text/plain", "Click the following link to verify your email: "+registerLink)
	} else if (emailType == 2) {
		m.SetBody("text/plain", "Click the following link to reset your password: "+resetPasswordLink)
	}
	

	// 设置 SMTP 服务器
	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPass)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	// 发送邮件
	if err := d.DialAndSend(m); err != nil {
		zap.S().Infof("Failed to send verification email: %v", err)
		return err
	}
	zap.S().Infof("Verification email sent successfully!")
	return nil
}
package controllers

import (
	"crypto/tls"
	"encoding/hex"
	"fmt"
	"math/rand"

	"go.uber.org/zap"
	"gopkg.in/gomail.v2"

	"web/global"
)


func generateVerificationToken() (string, error) {
	token := make([]byte, 8) // 8字节 = 16字符，因为每个字节是2个字符
	if _, err := rand.Read(token); err != nil {
		return "", fmt.Errorf("failed to generate random token: %w", err)
	}
	return hex.EncodeToString(token), nil
}

// emailType 1: register, 2: forget password
func SendEmail(toEmail, token string, emailType int) error {

	// 配置SMTP服务器信息
	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	smtpUser := global.ServerConfig.GmailInfo.SendEmail
	smtpPass := global.ServerConfig.GmailInfo.Password

	host := global.ServerConfig.Host
	// port := global.ServerConfig.Port
	var registerLink string
	var resetPasswordLink string
	if emailType == 1 {
		registerLink = fmt.Sprintf("http://%s:3000/verify-email-check?token=%s", host, token)
	} else if (emailType == 2) {
		resetPasswordLink = fmt.Sprintf("http://%s:3000/reset-pwd?email=%s?&token=%s", host, toEmail, token)
		fmt.Println("email:", toEmail)
	}
	
	// 使用邮件服务发送邮件
	m := gomail.NewMessage()
	m.SetHeader("From", smtpUser)
	m.SetHeader("To", toEmail)
	if (emailType == 1) {
		m.SetHeader("Subject", "Verify your email")
	} else if (emailType == 2) {
		m.SetHeader("Subject", "Reset your password")
	}
	
	if (emailType == 1) {
		m.SetBody("text/plain", "Click the following link to verify your email: "+registerLink)
	} else if (emailType == 2) {
		m.SetBody("text/plain", "Click the following link to reset your password: "+resetPasswordLink)
	}
	

	// 设置 SMTP 服务器
	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPass)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	// 发送邮件
	if err := d.DialAndSend(m); err != nil {
		zap.S().Infof("Failed to send verification email: %v", err)
		return err
	}
	zap.S().Infof("Verification email sent successfully!")
	return nil
}
