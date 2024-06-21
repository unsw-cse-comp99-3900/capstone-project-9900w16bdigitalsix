package config

// 自定义 struct, 把 yaml map  到 struct
type UserSrvConfig struct { // user_srv
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

type JWTConfig struct {
	SigningKey string `mapstructure:"signing_key"` // 签名密钥
}

type MysqlConfig struct {
	Host     string `mapstructure:"host" json:"host"`
	Port     int    `mapstructure:"port" json:"port"`
	Name     string `mapstructure:"db" json:"db"`
	User     string `mapstructure:"user" json:"user"`
	Password string `mapstructure:"password" json:"password"`
}

type RedisConfig struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

type GmailConfig struct {
	SendEmail string `mapstructure:"send_email"`
	Password  string `mapstructure:"password"`
	ExpiresAt int    `mapstructure:"expire"`
}

type ServerConfig struct {
	Name        string        `mapstructure:"name"`
	Host        string        `mapstructure:"host"`
	Port        int           `mapstructure:"port"`
	UserSrvInfo UserSrvConfig `mapstructure:"user_srv"`
	JWTInfo     JWTConfig     `mapstructure:"jwt"`
	MysqlInfo   MysqlConfig   `mapstructure:"mysql"`
	RedisInfo   RedisConfig   `mapstructure:"redis"`
	GmailInfo   GmailConfig   `mapstructure:"gmail"`
}
