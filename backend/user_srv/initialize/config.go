package initialize

import (
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"user_srv/global"
)

func GetEnvInfo(env string) bool {
	// get environment variables
	viper.AutomaticEnv()
	return viper.GetBool(env)
}

//  read config file  from yaml file
func InitConfig() {
	configFileName := "config-production.yaml"
	if GetEnvInfo("CAPSTONE_DEBUG") { // environment variable true; export CAPSTONE_DEBUG="true"
		configFileName = "config-debug.yaml"
	} 
	v := viper.New() // create a new viper object

	// config file name 
	v.SetConfigFile(configFileName)

	// read from config file
	if err := v.ReadInConfig(); err != nil {
		panic(err) 
	}

	// serverConfig := config.ServerConfig{} // global variable
	v.Unmarshal(global.ServerConfig)

	zap.S().Infof("config info %+v", global.ServerConfig)

	// viper function -- dynamic 
	v.WatchConfig()
	v.OnConfigChange(func(e fsnotify.Event) {
		zap.S().Infof("config info change %s", e.Name)
		v.Unmarshal(global.ServerConfig)
		zap.S().Infof("config info &v", global.ServerConfig)
	})

	// time.Sleep(time.Second * 2)

}
