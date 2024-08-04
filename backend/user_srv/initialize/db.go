package initialize

import (
	"fmt"
	"log"
	"os"
	"time"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"user_srv/global"
	"user_srv/model"
)

func InitDB() {
	// connect to database (DSN)
	// dsn := "root:root@tcp(127.0.0.1:3306)/capstone?charset=utf8mb4&parseTime=True&loc=Local"
	info := global.ServerConfig.MysqlInfo
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		info.User, info.Password, info.Host, info.Port, info.Name)
	zap.S().Debug("info", info)

	// logger define
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold: time.Second, 
			LogLevel:      logger.Info, 
			Colorful:      true,   
		},
	)

	// init gorm
	var err error
	global.DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		panic("failed to connect database" + err.Error())
	}

	// migrate schema
	_ = global.DB.AutoMigrate(&model.User{})
}
