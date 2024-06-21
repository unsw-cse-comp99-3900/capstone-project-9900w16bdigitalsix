package main

import (
	"context"
	"fmt"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"user_srv/initialize"
	"user_srv/proto"
)

var clientConn *grpc.ClientConn
var userClient proto.UserClient

func Init() {
	var err error
	// 假设的使用方法，具体实现依赖于官方文档的更新
	clientConn, err = grpc.NewClient("127.0.0.1:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		panic(err)
	}

	// 使用 clientConn 来创建服务客户端
	userClient = proto.NewUserClient(clientConn)
}

func TestGetUserList() {
	rsp, err := userClient.GetUserList(context.Background(), &proto.PageInfo{
		PageNum:  1,
		PageSize: 2,
	})
	if err != nil {
		panic(err)
	}
	for _, userInfoRsp := range rsp.Data {
		fmt.Println(userInfoRsp.Email, userInfoRsp.Username, userInfoRsp.Password)
		checkRsp, err := userClient.CheckPassword(context.Background(), &proto.CheckPasswordInfo{
			Passward:          "admin123",
			EncryptedPassward: userInfoRsp.Password,
		})
		if err != nil {
			panic(err)
		}
		fmt.Println("check password success:", checkRsp.Success)
	}
}

func TestCreatedUser() {
	for i := 0; i < 10; i++ {
		rsp, err := userClient.CreateUser(context.Background(), &proto.CreateUserInfo{
			Username: fmt.Sprintf("Lisa%d", i),
			Email:     fmt.Sprintf("z5462%d28@ad.unsw.edu.au", i),
			Password:  "admin123",
		})
		if err != nil {
			panic(err)
		}
		fmt.Println(rsp.Id, rsp.Email, rsp.Username, rsp.Password)
	}

}

func main() {
	Init()
	initialize.InitConfig()
	defer clientConn.Close()
	// TestGetUserList()
	TestCreatedUser()

}
