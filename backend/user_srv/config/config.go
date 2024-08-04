package config

// ymal config file map 到 struct, 在 initialize/config.go中
type MysqlConfig struct {
	Host     string `mapstructure:"host" json:"host"`
	Port     int    `mapstructure:"port" json:"port"`
	Name     string `mapstructure:"db" json:"db"`
	User     string `mapstructure:"user" json:"user"`
	Password string `mapstructure:"password" json:"password"`
}

type ServerConfig struct {
	Host      string      `mapstructure:"host" json:"host"` // user_srv 的 host
	Port      int         `mapstructure:"port" json:"port"` // user_srv 的 port
	MysqlInfo MysqlConfig `mapstructure:"mysql" json:"mysql"`
}
