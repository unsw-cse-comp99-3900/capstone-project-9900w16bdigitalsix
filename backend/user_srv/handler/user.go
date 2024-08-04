package handler

import (
	"context"
	"crypto/sha512"
	"fmt"
	"strings"

	"github.com/anaskhan96/go-password-encoder"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"

	"user_srv/global"
	"user_srv/model"
	"user_srv/proto"
)

type UserServer struct {
	proto.UnimplementedUserServer
}

func ModelToResponse(user *model.User) *proto.UserInfoResponse {
	userInfoRsp := &proto.UserInfoResponse{
		Id:       uint32(user.ID),
		Password: user.Password,
		Email:    user.Email,
		Username: user.Username,
		// Gender:   user.Gender,
		Role: uint32(user.Role),
	}
	// if user.Birthday != nil {
	// 	userInfoRsp.Birthday = uint64(user.Birthday.Unix())
	// }
	return userInfoRsp
}

func Paginate(page, pageSize int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page <= 0 {
			page = 1
		}

		switch {
		case pageSize > 100:
			pageSize = 100
		case pageSize <= 0:
			pageSize = 10
		}

		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}

func (srv *UserServer) GetUserList(ctx context.Context, req *proto.PageInfo) (*proto.UserListResponse, error) {
	var users []model.User
	result := global.DB.Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}

	rsp := &proto.UserListResponse{}
	rsp.Total = int32(result.RowsAffected)

	global.DB.Scopes(Paginate(int(req.PageNum), int(req.PageSize))).Find(&users)
	for _, user := range users {
		userInfoRsp := ModelToResponse(&user)
		rsp.Data = append(rsp.Data, userInfoRsp)
	}
	return rsp, nil

}

func (s *UserServer) GetUserByEmail(ctx context.Context, req *proto.EmailRequest) (*proto.UserInfoResponse, error) {
	// get user info by email
	var user model.User
	result := global.DB.Where("email =?", req.Email).First(&user)
	if result.RowsAffected == 0 {
		return nil, status.Errorf(codes.NotFound, "User not found")
	}
	if result.Error != nil {
		return nil, result.Error
	}
	userInfoRsp := ModelToResponse(&user)
	return userInfoRsp, nil
}

func (s *UserServer) GetUserByID(ctx context.Context, req *proto.IDRequest) (*proto.UserInfoResponse, error) {
	// get user info by id
	var user model.User
	result := global.DB.First(&user, req.Id)
	if result.RowsAffected == 0 {
		return nil, status.Errorf(codes.NotFound, "User not found")
	}
	if result.Error != nil {
		return nil, result.Error
	}
	userInfoRsp := ModelToResponse(&user)
	return userInfoRsp, nil
}

func (s *UserServer) CreateUser(ctx context.Context, req *proto.CreateUserInfo) (*proto.UserInfoResponse, error) {
	var user model.User
	result := global.DB.Where("email = ?", req.Email).First(&user)
	if result.RowsAffected == 1 {
		// zap.S().Errorf("User %v already exists")
		return nil, status.Errorf(codes.AlreadyExists, "User already exists")
	}

	// create the user
	user.Email = req.Email
	user.Username = req.Username
	user.Course = req.Course

	// encription
	options := &password.Options{SaltLen: 10, Iterations: 100, KeyLen: 32, HashFunction: sha512.New}
	salt, encodedPwd := password.Encode(req.Password, options)
	user.Password = fmt.Sprintf("pbkdf2-sha512$%s$%s", salt, encodedPwd)

	result = global.DB.Create(&user)
	if result.Error != nil {
		return nil, status.Errorf(codes.Internal, result.Error.Error())
	}
	userInfoRsp := ModelToResponse(&user)
	return userInfoRsp, nil

}

func (s *UserServer) UpdateUser(ctx context.Context, req *proto.UpdateUserInfo) (*proto.Empty, error) {
	var user model.User
	result := global.DB.First(&user, req.Id)
	if result.RowsAffected == 0 {
		return nil, status.Errorf(codes.NotFound, "User not found")
	}
	// user.Gender = req.Gender
	// birthday := time.Unix(int64(req.Birthday), 0)
	// user.Birthday = &birthday
	result = global.DB.Save(&user)
	if result.Error != nil {
		return nil, status.Errorf(codes.Internal, result.Error.Error())
	}
	return &proto.Empty{}, nil
}

func (s *UserServer) CheckPassword(ctx context.Context, req *proto.CheckPasswordInfo) (*proto.CheckResponse, error) {
	// check password
	// Using custom options
	options := &password.Options{SaltLen: 10, Iterations: 100, KeyLen: 32, HashFunction: sha512.New}
	encryptedPwd := req.EncryptedPassward
	passwordInfo := strings.Split(encryptedPwd, "$")
	check := password.Verify(req.Passward, passwordInfo[1], passwordInfo[2], options)
	return &proto.CheckResponse{
		Success: check,
	}, nil
}
