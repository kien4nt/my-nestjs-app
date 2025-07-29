#  NestJS App Setup Guide (Windows & Linux)

This guide helps you set up and run the NestJS app on **Windows** (PowerShell/Command Prompt) and **Linux** (bash terminal).

---

##  System Setup

###  Install Git

- **Windows:** Download from https://git-scm.com/downloads/win
- **Linux (Fedora):**

```bash
sudo dnf install -y git
```

After installing:

```bash
git --version
```

---

###  Install NVM (Node Version Manager)

- **Windows:** Download from https://github.com/coreybutler/nvm-windows/releases (use the `nvm-setup.exe` installer)
- **Linux:**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Then load it into your shell:

```bash
source ~/.bashrc
# or
source ~/.profile
```

Verify installation:

```bash
nvm version
```

---

##  Install Node.js 22 and Nest CLI

```bash
nvm install 22
nvm use 22
node -v
npm -v
```

###  Install NestJS CLI

```bash
npm install -g @nestjs/cli
```

---

##  Clone and Setup the App

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

###  View Example Template

```bash
cat .env.example
```

###  Create and Edit `filename.env` File

- **Windows:**

```powershell
copy .env.example filename.env
notepad filename.env
```

- **Linux:**

```bash
cp .env.example filename.env
nano filename.env
```

 Replace placeholder values with your actual credentials.

---

##  Run Database Migrations with `filename.env`

- **Windows:**

```powershell
$env:NODE_ENV="filename"; npm run mg:run
```

- **Linux:**

```bash
NODE_ENV=filename npm run mg:run
```

---

##  Seeding

###  Configuration
Open `seed-delivery.ts`:

- **Windows:**

```powershell
notepad seeds/seed-delivery.ts
```

- **Linux:**

```bash
nano seeds/seed-delivery.ts
```

Adjust the number of seeding records:
```ts
const numberOfRecordsToInsert = 100000; // Adjust as needed
```

###  Run the seeding

- **Windows:**

```powershell
$env:NODE_ENV="filename"; npx ts-node .\seeds\seed-admin.ts
$env:NODE_ENV="filename"; npx ts-node .\seeds\seed-store.ts
$env:NODE_ENV="filename"; npx ts-node .\seeds\seed-delivery.ts
```

- **Linux:**

```bash
NODE_ENV=filename npx ts-node .\seeds\seed-admin.ts
NODE_ENV=filename npx ts-node .\seeds\seed-store.ts
NODE_ENV=filename npx ts-node .\seeds\seed-delivery.ts
```

---

##  Build and Run the App with `filename.env`

- **Windows:**

```powershell
nest build
$env:NODE_ENV="filename"; nest start run
# or for production
$env:NODE_ENV="filename"; nest start --prod
```

- **Linux:**

```bash
nest build
NODE_ENV=filename nest start run
# or for production
NODE_ENV=filename nest start --prod
```

---
