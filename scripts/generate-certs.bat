@echo off
REM Create certs directory if it doesn't exist
if not exist "certs" mkdir certs

REM Generate self-signed certificate for localhost using OpenSSL
echo Generating self-signed certificates for localhost...

REM Check if OpenSSL is available
openssl version >nul 2>&1
if %errorlevel% neq 0 (
    echo OpenSSL not found. Please install OpenSSL or use Git Bash.
    echo.
    echo Alternative: Use Git Bash and run:
    echo   ./scripts/generate-certs.sh
    echo.
    pause
    exit /b 1
)

REM Generate the certificate
openssl req -x509 -out certs/localhost.pem -keyout certs/localhost-key.pem -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -extensions EXT -config <(echo [dn] & echo CN=localhost & echo [req] & echo distinguished_name = dn & echo [EXT] & echo subjectAltName=DNS:localhost & echo keyUsage=digitalSignature & echo extendedKeyUsage=serverAuth)

if %errorlevel% equ 0 (
    echo.
    echo Self-signed certificates generated successfully in certs/ directory
    echo You can now run: npm run dev:https
) else (
    echo.
    echo Failed to generate certificates. Please try using Git Bash instead.
    echo Run: ./scripts/generate-certs.sh
)

pause
