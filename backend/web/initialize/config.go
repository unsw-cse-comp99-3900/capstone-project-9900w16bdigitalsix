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

	// Map the configuration file to the struct
	// serverConfig := &config.ServerConfig{} // How can this object be used in other files -- global variables
	v.Unmarshal(global.ServerConfig)

	zap.S().Infof("配置信息 %+v", global.ServerConfig)

	// // Gets the value of the "name" configuration item in the configuration file and prints it
	// fmt.Println(v.Get("name"))

	// viper Dynamic monitoring of changes
	v.WatchConfig()
	v.OnConfigChange(func(e fsnotify.Event) {
		zap.S().Infof("配置信息产生变化 %s", e.Name)
		v.Unmarshal(global.ServerConfig)
		zap.S().Infof("配置信息 &v", global.ServerConfig)
	})

	// time.Sleep(time.Second * 2)

}
