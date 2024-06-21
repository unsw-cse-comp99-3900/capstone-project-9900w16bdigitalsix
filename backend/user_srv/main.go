package main

import (
	"flag"
	"fmt"
	"net"
	"user_srv/global"
	"user_srv/initialize"
	"user_srv/proto"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"user_srv/handler"
)

func main() {
	// 初始化
	initialize.InitLogger()
	initialize.InitConfig() // 必须要先initconfig 再初始化数据库
	initialize.InitDB()

	zap.S().Info(global.ServerConfig)

	IP := flag.String("ip", global.ServerConfig.Host, "ip address") // 命令行读取
	Port := flag.Int("port", global.ServerConfig.Port, "port")
	flag.Parse()

	zap.S().Info("ip address ", *IP)
	zap.S().Info("port ", *Port)

	server := grpc.NewServer()
	proto.RegisterUserServer(server, &handler.UserServer{})

	// 监听
	lis, err := net.Listen("tcp", fmt.Sprintf("%s:%d", *IP, *Port))
	if err != nil {
		panic("failed to listen: " + err.Error())
	}
	err = server.Serve(lis)
	if err != nil {
		panic("failed to start grpc: " + err.Error())
	}

}
