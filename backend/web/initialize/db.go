package initialize

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"web/global"
)


func InitDB() {
	// 数据库连接字符串 (DSN)
	// dsn := "root:root@tcp(127.0.0.1:3306)/capstone_manager?charset=utf8mb4&parseTime=True&loc=Local"
	info := global.ServerConfig.MysqlInfo
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		info.User, info.Password, info.Host, info.Port, info.Name)

	// 创建自定义的 logger
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold: time.Second, // 慢 SQL 阈值
			LogLevel:      logger.Info, // 日志级别
			Colorful:      true,        // 禁用彩色打印
		},
	)

	// 初始化 GORM 并使用自定义 logger
	var err error
	global.DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		panic("failed to connect database" + err.Error())
	}
}
