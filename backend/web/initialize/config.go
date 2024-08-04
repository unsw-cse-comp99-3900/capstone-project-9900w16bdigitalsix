package initialize

import (
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"web/global"
)

func GetEnvInfo(env string) bool {
	// get environment variables
	viper.AutomaticEnv()
	return viper.GetBool(env)
}

func InitConfig() {
	configFileName := "config-production.yaml"
	if GetEnvInfo("CAPSTONE_DEBUG") { //  export CAPSTONE_DEBUG="true"
		configFileName = "config-debug.yaml"
	}

	v := viper.New() 

	v.SetConfigFile(configFileName)

	if err := v.ReadInConfig(); err != nil {
		panic(err) 
	}

	// 将配置文件映射到结构体
	// serverConfig := &config.ServerConfig{} // 这个对象如何在其他文件中使用 --全局变量
	v.Unmarshal(global.ServerConfig)

	zap.S().Infof("配置信息 %+v", global.ServerConfig)

	// // 获取配置文件中的 "name" 配置项的值并打印
	// fmt.Println(v.Get("name"))

	// viper 的功能 -- 动态监控变化
	v.WatchConfig()
	v.OnConfigChange(func(e fsnotify.Event) {
		zap.S().Infof("配置信息产生变化 %s", e.Name)
		v.Unmarshal(global.ServerConfig)
		zap.S().Infof("配置信息 &v", global.ServerConfig)
	})

	// time.Sleep(time.Second * 2)

}
