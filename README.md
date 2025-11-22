# Solar System NodeJS Application

A simple HTML+MongoDB+NodeJS project to display Solar System and it's planets.

---
## Requirements

For development, you will only need Node.js and NPM installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

---
## Install Dependencies from `package.json`
    $ npm install

## Run Unit Testing
    $ npm test

## Run Code Coverage
    $ npm run coverage

## Run Application
    $ npm start

## Access Application on Browser
    http://localhost:3000/

---
## Testing & Test Mode

- Run unit tests locally:

    ```powershell
    npm test
    ```

- What test mode does:
    - When `NODE_ENV` is `test`, the application skips attempting to connect to a real MongoDB and instead uses an in-memory seed of planet documents (IDs 1..8). This makes `npm test` hermetic and fast.
    - `app-test.js` sets `process.env.NODE_ENV = 'test'` before requiring `./app`, so no extra setup is required to run tests locally.

- Why this is useful:
    - Tests can run in CI without a running MongoDB instance or extra mocking libraries.

- If you want to run the tests against a real database (integration tests):
    1. Provide a test MongoDB and set `MONGO_URI`, `MONGO_USERNAME`, and `MONGO_PASSWORD` in environment or in a local `.env` file.
    2. Remove or override `NODE_ENV=test` so `app.js` will call `mongoose.connect()` and use the real `planets` collection.

If you prefer real-database integration tests or a different mocking approach (e.g., sinon/stub), tell me and I can add scripts or update the tests accordingly.

---
### Seed a real MongoDB (integration tests)

If you want to run integration tests against a real MongoDB, you can seed the database with the provided script.

1. Create a local `.env` file or set environment variables: `MONGO_URI`, `MONGO_USERNAME` (optional), `MONGO_PASSWORD` (optional).
2. Run the seed script:

```powershell
npm run seed
```

This script connects to the MongoDB in `MONGO_URI` and upserts planet documents (IDs 1..8) into the `planets` collection.

Notes:
 - The seed script uses the same `images/` paths as the app (`/images/*.png`). Ensure those files are available in the repo root `images/` directory.
- After seeding, run `npm test:ci` if your CI expects junit XML output; `npm test` is configured for local `spec` reporter.

---
## Running on an Ubuntu VM (quickstart)

These steps assume a fresh Ubuntu 20.04+ VM with internet access. Replace values for your environment (especially `MONGO_URI`).

1. Update system and install required packages

```bash
sudo apt update; sudo apt upgrade -y
sudo apt install -y curl git build-essential
```

2. Install Node.js LTS (recommended NodeSource installer)

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

3. Clone the repo and install dependencies

```bash
git clone <repo-url> solar-system
cd solar-system
npm install
```

4. Configure environment (example using a local `.env` file)

Create a `.env` file in the project root with these values (do NOT commit this file):

```ini
MONGO_URI=mongodb+srv://<user>:<pass>@<host>/<db>
MONGO_USERNAME=<optional>
MONGO_PASSWORD=<optional>
PORT=3000
```

Alternatively export env vars in your shell:

```bash
export MONGO_URI='your-uri'
export PORT=3000
```

5. (Optional) Seed a real MongoDB for integration tests

```bash
npm run seed
```

6. Open port in the firewall (if using `ufw`) and start the app

```bash
sudo ufw allow 3000/tcp
npm start
```

Visit `http://<vm-ip>:3000` in your browser.

7. Run tests locally

```bash
npm test        # console-friendly spec reporter
npm run test:ci # junit reporter for CI systems
```

8. Optional: run as a systemd service (production)

Create `/etc/systemd/system/solar-system.service`:

```ini
[Unit]
Description=Solar System Node.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/solar-system
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable solar-system
sudo systemctl start solar-system
sudo journalctl -u solar-system -f
```

Security note: keep `MONGO_URI` credentials secret and do not commit `.env` to source control. Use a secrets manager or environment variables in production.

---
### Mongoose `strictQuery` setting

When upgrading to Mongoose 7 the default for `strictQuery` will change. This project sets the value to `false` by default to prepare for that change and suppress the deprecation warning.

You can override the behavior without changing code by setting the environment variable `MONGOOSE_STRICT_QUERY`:

```bash
# enable strictQuery explicitly
export MONGOOSE_STRICT_QUERY=true

# or disable explicitly
export MONGOOSE_STRICT_QUERY=false
```

If `MONGOOSE_STRICT_QUERY` is not set, the app defaults to `false`.

