#!/bin/bash

# 查找所有 .go 文件，排除自动生成的文件，然后统计行数
find . -name "*.go" \
    | grep -v -E "(/web/docs/docs.go|\
./web/proto/user_grpc.pb.go|\
./web/proto/user.pb.go|\
./user_srv/proto/user_grpc.pb.go|\
./user_srv/proto/user.pb.go)" \
    | xargs wc -l
