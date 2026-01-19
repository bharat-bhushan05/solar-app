# 🚀 Jenkins Pipeline Prerequisites – Solar App

This document explains **all required variables, credentials, and tools** that must be configured **before running the Jenkins pipeline** for the **Solar App** project.

---

## 📌 Overview

The Jenkins pipeline for this repository performs:

* Source checkout
* Dependency installation
* Security scanning (OWASP + NPM audit)
* Database seeding
* Unit testing
* Code coverage reporting

To run successfully, Jenkins must be configured with **specific tools and credentials**.

---

## 🧰 Jenkins Prerequisites

### 1️⃣ Jenkins Agent

* OS: **Linux**
* Label: `linux`
* Internet access required (for npm, MongoDB Atlas, OWASP DB)

---

### 2️⃣ Required Jenkins Plugins

Ensure the following plugins are installed:

* Pipeline
* NodeJS Plugin
* OWASP Dependency-Check Plugin
* Credentials Plugin
* Git Plugin
* Workspace Cleanup Plugin
* HTML Publisher Plugin

---

### 3️⃣ Global Tool Configuration

#### Node.js

Configure Node.js in:

```
Manage Jenkins → Global Tool Configuration → NodeJS
```

| Tool Name       | Version        |
| --------------- | -------------- |
| `nodejs-22-6-0` | Node.js 22.6.0 |

> ⚠️ Tool name **must match** the one used in the pipeline.

---

## 🔐 Required Jenkins Credentials

### 1️⃣ MongoDB Credentials (MANDATORY)

Used for:

* Database seeding
* Unit tests
* Code coverage

Create this credential:

```
Manage Jenkins → Credentials → Add Credentials
```

| Field    | Value                  |
| -------- | ---------------------- |
| Kind     | Username with password |
| ID       | `mongo-db-credentials` |
| Username | MongoDB username       |
| Password | MongoDB password       |

🔒 **Do NOT store credentials in Jenkinsfile or GitHub**

---

### 2️⃣ NVD API Key (Optional but Recommended)

Used by OWASP Dependency Check to avoid rate limits.

| Field  | Value         |
| ------ | ------------- |
| Kind   | Secret Text   |
| ID     | `nvd-api-key` |
| Secret | NVD API key   |

🔗 Get key from: [https://nvd.nist.gov/developers/request-an-api-key](https://nvd.nist.gov/developers/request-an-api-key)

---

## 🌱 Environment Variables (Handled by Pipeline)

The following variables are **already defined in the pipeline** and do **not require user input**:

| Variable           | Purpose                          |
| ------------------ | -------------------------------- |
| `NODE_ENV`         | Execution environment (`test`)   |
| `APP_NAME`         | Application name                 |
| `NPM_CONFIG_AUDIT` | Disable npm audit during install |
| `NPM_CONFIG_FUND`  | Disable npm fund messages        |

❗ **Do not override these unless required**

---

## 🧪 MongoDB Configuration Notes

* The pipeline dynamically constructs `MONGO_URI` using Jenkins credentials.
* Database used: **test database**
* Required MongoDB role:

  ```
  readWrite on database: test
  ```

❌ Read-only users will cause the pipeline to fail during seeding.

---

## ▶️ How to Run the Pipeline

### Option 1: Jenkinsfile (Recommended)

1. Commit `Jenkinsfile` to repository root
2. Create a Jenkins Pipeline or Multibranch Pipeline job
3. Point it to this repository
4. Run the pipeline

---

### Option 2: Pipeline Script (UI)

1. Create a Pipeline job
2. Paste pipeline script into **Pipeline Script**
3. Save & Build

> Credential handling is **identical** in both approaches.

---

## 🚫 Security Best Practices

* ❌ Never hardcode secrets in Jenkinsfile
* ❌ Never commit `.env` files with passwords
* ✅ Always use Jenkins Credentials
* ✅ Use test-only databases for CI

---

## 🧠 Common Errors & Fixes

| Error                   | Cause                  | Fix                    |
| ----------------------- | ---------------------- | ---------------------- |
| Mongo permission denied | Read-only user         | Grant `readWrite` role |
| Missing credentials     | Credential ID mismatch | Verify credential ID   |
| cleanWs failure         | No workspace context   | Use `deleteDir()`      |
| APP_NAME not found      | Wrong variable access  | Use `env.APP_NAME`     |

---

## 📞 Support

If the pipeline fails:

1. Check Jenkins console logs
2. Verify credentials exist
3. Confirm Node.js tool name
4. Ensure MongoDB user has write access

---

## ✅ Summary Checklist

✔ Jenkins agent labeled `linux`
✔ NodeJS tool configured
✔ MongoDB credentials added
✔ Optional NVD API key added
✔ Internet access enabled

---

**Happy CI/CD 🚀**
If you need help extending this pipeline (Docker, Kubernetes, Slack alerts), feel free to reach out.
