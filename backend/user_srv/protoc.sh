#!/bin/bash

filename=$1

protoc --go_out=./proto --go-grpc_out=./proto $filename