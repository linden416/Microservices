#!/bin/bash

# Env Variables and Secrets
# Deploy env variables
kubectl apply -f ./configmap/env-configmap.yaml
# Deploy Postgres SQL credentials
kubectl apply -f ./secrets/db-secret.yaml
# Deploy AWS Credentials file
kubectl apply -f ./secrets/aws-secret.yaml

# Deployments
# Deploy Ionic front end app - Udagram UI
kubectl apply -f ./deploy/app-ui-deployment.yaml
# Deploy NGINX Reverse Proxy
kubectl apply -f ./deploy/nginx-deployment.yaml
# Deploy REST API Feed Service
kubectl apply -f ./deploy/feed-api-deployment.yaml
# Deploy USER API Feed Service
kubectl apply -f ./deploy/user-api-deployment.yaml

# Secrets
# Deploy Service Udagram-UI
kubectl apply -f ./service/app-ui-service.yaml
# Deploy Service NGINX-RP
kubectl apply -f ./service/nginx-service.yaml
# Deploy Service Feed-API
kubectl apply -f ./service/feed-api-service.yaml
# Deploy Service User-API
kubectl apply -f ./service/user-api-service.yaml

# Due to CPU, 2 replicas of each container cannot be made availabe
# Scale down to 1, leave feed-api at 2 replicas only 
kubectl scale --replicas=1 deployment/user-api deployment/nginx-rp deployment/udagram-app

# Fix the connection issue where NGINX does not
# have SERVICEs setup properly, Scale down the
# NGINX deployment and scale it back up, this
# will establish all the connection addresses for
# all the services.
kubectl scale deployment/nginx-rp --replicas=0
kubectl scale deployment/nginx-rp --replicas=1
# Do same for front end Udagram-App Service
kubectl scale deployment/udagram-app --replicas=0
kubectl scale deployment/udagram-app --replicas=1

# Monitor
kubectl get pods
echo "Wait for roll out to complete"
kubectl rollout status deployment/nginx-rp
kubectl rollout status deployment/udagram-app
kubectl rollout status deployment/user-api
kubectl get pods
