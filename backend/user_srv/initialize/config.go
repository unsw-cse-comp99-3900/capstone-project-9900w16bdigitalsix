package initialize

import (
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"user_srv/global"
)

func GetEnvInfo(env string) bool {
	// 获取环境变量
	viper.AutomaticEnv()
	return viper.GetBool(env)
}

// 从 yaml 文件中读取配置 map 到 struct
func InitConfig() {
	configFileName := "config-production.yaml"
	if GetEnvInfo("CAPSTONE_DEBUG") { // 环境变量的值是 true; export CAPSTONE_DEBUG="true"
		configFileName = "config-debug.yaml"
	} 
	v := viper.New() // 创建一个新的 Viper 实例

	// 设置配置文件路径和文件名
	v.SetConfigFile(configFileName)

	// 读取配置文件并处理可能的错误
	if err := v.ReadInConfig(); err != nil {
		panic(err) // 如果读取配置文件时发生错误，则终止程序并输出错误信息
	}

	// 将配置文件映射到结构体
	// serverConfig := config.ServerConfig{} // 这个对象如何在其他文件中使用 --全局变量
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
