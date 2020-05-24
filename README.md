# Udacity Cloud Developer Program #
## Project 3 - Convert Monolith Udagram App to Microservices ##
### Gordon Seeler ###
##### Date ####
May 24, 2020
#### Summary ####
The Monolithic version of the Udagram Application has faults which can affect service availability and limitations to efficiently deploying new solutions. The "New World" of Microservices addresses these issues utilizing **Containerized** code and services that can be scaled up or down to meet demand and provide portability across all platforms. Containers along with **Kubernetes** offers **Container Orchestration** enabling multiple deployment patterns for how the Containers interface and how they are accessed externally.
#### Description ####
The Udagram application is very distributed. It accesses the AWS Cloud for both backend Database storage **(Postgres)** and **S3** file services to store images. Although there are several Kubernetes services to employ, my application uses **Docker's Kubernetes** services to build the **cluster** of containers contributing to the support of my Udagram application. Each container in the cluster runs a service, this is a different model from the monolithic version of the app which ran all the services together.  

* * *

#### GitHub Repository ####
https://github.com/linden416/Microservices.git

This is the source repository for my Udagram application. 
The following directories are defined within the **Microservices** root directory:
- **deployments** `<-- All the YAML files to deploy containers into Kubernetes cluster`
- **Kubernetes_console_output** `<-- Supporting console output of working application`
- **Screenshots** `<-- Supporting screenshots of full functioning application, Docker Hub Repository, Travis CI triggering successful build`
- **Travis_CI_Rawlog** `<-- Full log of pushed GitHub update that triggered Travis CI to build and deploy new images`
- **udagram-app-ui**   `<-- Udagram's front end User Interface`
- **udagram-feed-api**  `<-- Backend REST API providing images`
- **udagram-nginx-rp**  `<-- Reverse Proxy`
- **udagram-user-api** `<--Backend REST API providing user authentication`

Two important files reside off the root:
1. **docker-image-build.yaml**  `<-- This file builds the 4 Docker images contributing to Udagram app` 
2. **.travis.yml**  `<-- This file controls the Travis CI/CD service`

* * *

#### Docker Hub Repository ####
This is the central location for Docker containers. 
Please refer to the image in the **Screenshots** directory identified as: **Docker_Hub_Repository.png**. 

It shows my repository called **linden416** and the four images deployed to it: 
- **linden416/udagram-app-ui** 
- **linden416/udagram-nginx-rp** 
- **linden416/udagram-feed-api** 
- **linden416/udagram-user-api**

Note: The Kubernetes deployments reference these images from Docker Hub to instantiate containers running as **pods** in a **node** they run within.

* * *

#### Travis CI ####
The Travis CI / CD continuous integration and continuous deployment work flow tool is configured in with my GitHub repository. It has been granted access to this "Microservices" repository and will be triggered to run the commands defined within the **.travis.yml** file to do the following:
1. Build new images 
2. Push new images to Docker Hub Repository

Refer to the images in the **Screenshots** directory to view a triggered Build and Push in action:
- Travis_CI_Triggered.png `<-- This shows GitHub triggering a build event in Travis CI`
- Travis_CI_Build initiate.png `<-- Start running the build`
- Travis_CI_Build_images.png `<-- Building the new images`
- Travis_CI_Build_images_pused.png `<-- Pushing new images to Docker Hub Repository`
- Travis_CI_Success `<-- Successful completion of the build`

The **Travis_CI_Rawlog** directory contains the Rawlog file of a build. The file is called: **successful_build_and_push.out**

* * *

#### Proof of Working Solution ####
My application was **Exposed** locally to access the Kubernetes cluster. The application design uses the default ClusterIP pattern. After successful deployment, two terminals were opened and the application was exposed locally using Kubernetes CLI command **port-forward**. The following images located in the **Screenshots** folder show the full working functionality of the application:
- Udagram_App 1of5.png `<-- Shows the main splash page`
- Udagram_App 2of5.png `<-- Login to the application`
- Udagram_App 3of5.png `<-- Posting a new Image`
- Udagram_App 4of5.png `<-- Viewing the new image on home page`
- Udagram_App 5of5.png `<-- Logout of application`

The screenshot image **Local Ports Forwarded UI and Proxy.png** shows both the 8100 and 8080 ports configured to the Udagram-App and NGINX-RP services locally exposed via port-forward commands.

The **Kubernetes_console_output** directory contains two files showing the **Kubectl CLI** output for the active deployment:
- deployment, svc, pod, secrets, config.out `<-- shows deployments, services, pods, secrets, and configmap`
- pod.logs `<-- shows the running logs for pods`

* * *
### Installation:
After cloning the Microservices GitHub repository, change to the **deployments** directory and run the supplied bash script `deploy.sh`. The script will run the **Kubectl CLI** commands to setup the environment parameters needed by the backend APIs, the secrets for access to the backend database and the AWS S3 file storage, and deploy containers of the images residing in the Docker Hub Repository. 

The script will also implement scaling up and down the deployments as well to get the optimum CPU usage for local machine. 

It will also fix a connection issue due to the Pods being created prior to the Services that access them. As noted below, the NGINX reverse proxy needed its' deployment pods to be scaled down and back up after the Services are deployed so that the SERVICE connection variables are established on the NGINX pod.

Below is a breakdown of all the **Kubectl CLI** commands in the script:
##### Setup the Environment and Postgre DB password and AWS credentials 
```
#!/bin/bash

# Env Variables and Secrets
# Deploy env variables
kubectl apply -f ./configmap/env-configmap.yaml
# Deploy Postgres SQL credentials
kubectl apply -f ./secrets/db-secret.yaml
# Deploy AWS Credentials file
kubectl apply -f ./secrets/aws-secret.yaml
```
##### Run the deployments
```
# Deployments
# Deploy Ionic front end app - Udagram UI
kubectl apply -f ./deploy/app-ui-deployment.yaml
# Deploy NGINX Reverse Proxy
kubectl apply -f ./deploy/nginx-deployment.yaml
# Deploy REST API Feed Service
kubectl apply -f ./deploy/feed-api-deployment.yaml
# Deploy USER API Feed Service
kubectl apply -f ./deploy/user-api-deployment.yaml
```
##### Run the services
```
# Deploy Service Udagram-UI
kubectl apply -f ./service/app-ui-service.yaml
# Deploy Service NGINX-RP
kubectl apply -f ./service/nginx-service.yaml
# Deploy Service Feed-API
kubectl apply -f ./service/feed-api-service.yaml
# Deploy Service User-API
kubectl apply -f ./service/user-api-service.yaml
```
##### Scale down the nodes/replicas for all services except feed-api
_Personal note: I could not get 2 replicas for each pod. I noticed a CPU limit message. I had to scale down some of the deployments to get all of them actively available._
```
# Due to my experience, 2 replicas of each container cannot be made availabe
# Scale down to 1, leave feed-api at 2 replicas only 
kubectl scale --replicas=1 deployment/user-api deployment/nginx-rp deployment/udagram-app
```
##### Implement fix for Reverse Proxy to Backend APIs Connection
`I found fix to the connection issue many had from NGINX to Feed-API`
[Kubernetes Service Env Variables](https://kubernetes.io/docs/concepts/services-networking/connect-applications-service/#environment-variables)
When a Pod runs a Node, it adds to the environment SERVICE variables, but if the replicas from deployment are created before the service which is normal, these SERVICE variables will not be configured, so if you scale down the deployment to 0 replicas then scale back up, the SERVICE variables get created and the connections from APP to API work. NGINX RP needs to have these SERVICE variables to communicate to the backend apis.
**Example of the SERVICE parameters on the NGINX node:**
```
$ kubectl exec nginx-rp-f7957d698-z8pl4  — printenv | grep SERVICE
USER_API_SERVICE_PORT=8080
NGINX_RP_SERVICE_HOST=10.108.142.7
NGINX_RP_SERVICE_PORT=8080
FEED_API_SERVICE_PORT_8080=8080
NGINX_RP_SERVICE_PORT_8080=8080
USER_API_SERVICE_HOST=10.106.172.176
USER_API_SERVICE_PORT_8080=8080
UDAGRAM_APP_SERVICE_PORT=8100
KUBERNETES_SERVICE_PORT=443
FEED_API_SERVICE_HOST=10.108.142.98
KUBERNETES_SERVICE_PORT_HTTPS=443
UDAGRAM_APP_SERVICE_HOST=10.106.40.206
KUBERNETES_SERVICE_HOST=10.96.0.1
UDAGRAM_APP_SERVICE_PORT_8100=8100
FEED_API_SERVICE_PORT=8080
```
#### Scale down and back up Reverse Proxy and Front end App
```
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
```
##### Monitor the rollout status to ensure the deployments are ready
```
# Monitor
kubectl get pods
echo "Wait for roll out to complete"
kubectl rollout status deployment/nginx-rp
kubectl rollout status deployment/udagram-app
kubectl rollout status deployment/user-api
kubectl get pods
```
* * *
##### Running output example:
```
gs6687 Microservices
$ cd deployments
gs6687 deployments
$ ./deploy.sh
configmap/env-config created
secret/db-secret created
secret/aws-secret created
deployment.extensions/udagram-app created
deployment.extensions/nginx-rp created
deployment.extensions/feed-api created
deployment.extensions/user-api created
service/udagram-app created
service/nginx-rp created
service/feed-api created
service/user-api created
deployment.extensions/user-api scaled
deployment.extensions/nginx-rp scaled
deployment.extensions/udagram-app scaled
deployment.extensions/nginx-rp scaled
deployment.extensions/nginx-rp scaled
deployment.extensions/udagram-app scaled
deployment.extensions/udagram-app scaled
NAME                          READY   STATUS              RESTARTS   AGE
feed-api-56cc788fdb-w9zlp     0/1     ContainerCreating   0          4s
feed-api-56cc788fdb-xwz7n     0/1     ContainerCreating   0          4s
nginx-rp-f7957d698-d9sk5      0/1     Terminating         0          5s
nginx-rp-f7957d698-g2zmn      0/1     Terminating         0          5s
nginx-rp-f7957d698-wd89x      0/1     Pending             0          0s
udagram-app-58d7dd7d8-kpnhf   0/1     Terminating         0          5s
user-api-78fc49fd4c-rwrn5     0/1     Pending             0          4s
Wait for roll out to complete
Waiting for deployment "nginx-rp" rollout to finish: 0 of 1 updated replicas are available...
deployment "nginx-rp" successfully rolled out
Waiting for deployment "udagram-app" rollout to finish: 0 of 1 updated replicas are available...
deployment "udagram-app" successfully rolled out
Waiting for deployment "user-api" rollout to finish: 0 of 1 updated replicas are available...
deployment "user-api" successfully rolled out
NAME                          READY   STATUS    RESTARTS   AGE
feed-api-56cc788fdb-w9zlp     1/1     Running   0          15s
feed-api-56cc788fdb-xwz7n     1/1     Running   0          15s
nginx-rp-f7957d698-wd89x      1/1     Running   0          11s
udagram-app-58d7dd7d8-h2w82   1/1     Running   0          11s
user-api-78fc49fd4c-rwrn5     1/1     Running   0          15s
```
* * *

### Expose the NGINX and Frontend App Locally to access the Kubernetes cluster
```
$ kubectl port-forward service/nginx-rp 8080:8080
$ kubectl port-forward service/udagram-app 8100:8100
```
Open a browser and enter "http://localhost:8100"



