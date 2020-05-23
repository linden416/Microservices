#!/bin/bash
cd ./deployments
kubectl apply -f ./configmap/env-configmap.yaml
kubectl apply -f ./secrets/db-secret.yaml
kubectl apply -f ./secrets/aws-secret.yaml
kubectl apply -f ./deploy/app-ui-deployment.yaml
kubectl apply -f ./deploy/nginx-deployment.yaml
kubectl apply -f ./deploy/feed-api-deployment.yaml
kubectl apply -f ./deploy/user-api-deployement.yaml
kubectl apply -f ./service/app-ui-service.yaml
kubectl apply -f ./service/nginx-service.yaml
kubectl apply -f ./service/feed-api-service.yaml
kubectl apply -f ./service/user-api-service.yaml