package config

// ymal config file map to struct, in initialize/config.go
type MysqlConfig struct {
	Host     string `mapstructure:"host" json:"host"`
	Port     int    `mapstructure:"port" json:"port"`
	Name     string `mapstructure:"db" json:"db"`
	User     string `mapstructure:"user" json:"user"`
	Password string `mapstructure:"password" json:"password"`
}

type ServerConfig struct {
	Host      string      `mapstructure:"host" json:"host"` // user_srv host
	Port      int         `mapstructure:"port" json:"port"` // user_srv port
	MysqlInfo MysqlConfig `mapstructure:"mysql" json:"mysql"`
}
