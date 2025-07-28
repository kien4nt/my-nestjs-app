# NestJS App Deployment Guide (EC2 + RDS Setup)

This guide walks you through deploying and running the NestJS app on an **Amazon EC2** instance and connecting it to **Amazon RDS**.


## Requirements
- A running AWS VPC instance with at least 1 AZ that has both private and public subnets in Asia Pacific (Singapore) region

- A running AWS EC2 instance which:
    + Contained in a public subnet of the VPC instance
    + Has auto-assigned public IP configured
    + Allows SSH connection from your IP
    + Allows public connection via port 3000

- A running AWS RDS instance which:
    + Contained in the private subnet from them same AZ as the EC2 instance
    + Has RDS CA authorization configured (ap-southeast-1-bundle.pem)
    + Allow only connection from the EC2 instance

- You need to have the private access key file of your ec2 instance stored locally (ec2-key.pem)

## Download RDS CA Certificate from AWS
Go to this URL and download the certificate bundle for Asia Pacific (Singapore) (ap-southeast-1-bundle.pem) :
https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.CertificatesAllRegions


---

##  Upload RDS CA Certificate to EC2

```bash
scp -i /path/to/ec2-key.pem /path/to/ap-southeast-1-bundle.pem ec2-user@<ec2-public-ip>:/home/ec2-user/
```

---

##  SSH into the EC2 Instance

```bash
ssh -i /path/to/ec2-key.pem ec2-user@<ec2-public-ip>
```

- Type `yes` to accept the host fingerprint if prompted.

---

##  System Setup

###  Update Package List

```bash
sudo dnf update -y
```

###  Install Git

```bash
sudo dnf install -y git
git --version
```

###  Install NVM (Node Version Manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

###  Load NVM into Shell

```bash
source ~/.bashrc
# or, if needed:
# source ~/.profile
# source ~/.bash_profile
```

---

##  Install Node.js 22 and Nest CLI

```bash
nvm install 22
nvm alias default 22
node -v
npm -v
```

###  Install Nest CLI

```bash
npm install -g @nestjs/cli
```

---

##  Clone and Setup the App

###  Clone the Repository

```bash
git clone https://github.com/kien4nt/my-nestjs-app.git
cd my-nestjs-app
```

###  Install Dependencies

```bash
npm install
npm audit fix
```

---

##  Check Important Packages

```bash
npm list @nestjs/schedule
npm list @nestjs/typeorm
```

---

##  Environment Configuration

### View the Example Template

```bash
nano .env.example
```

### Create and Edit the `.env` File

```bash
nano development.env
```

- Paste content from `.env.example`.
- Replace placeholder values with your actual credentials and configuration.

---

##  Run Database Migrations

```bash
npm run mg:run
```

---

##  Build and Run the App

```bash
nest build
nest start
# or
nest start --prod
```

---
