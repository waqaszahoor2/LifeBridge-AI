param(
  [string]$Alias = "lifebridge",
  [string]$StorePassword = "",
  [string]$KeyPassword = ""
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$AndroidDir = "$Root\apps\mobile\android"
if (-not $StorePassword) {
  $SecureStore = Read-Host "Keystore password" -AsSecureString
  $StorePassword = [System.Net.NetworkCredential]::new("", $SecureStore).Password
}
if (-not $KeyPassword) {
  $SecureKey = Read-Host "Key password" -AsSecureString
  $KeyPassword = [System.Net.NetworkCredential]::new("", $SecureKey).Password
}
$Keystore = "$AndroidDir\app\lifebridge-upload-key.jks"
keytool -genkeypair -v -keystore $Keystore -keyalg RSA -keysize 4096 -validity 10000 -alias $Alias -storepass $StorePassword -keypass $KeyPassword -dname "CN=LifeBridge AI, OU=Mobile, O=LifeBridge AI, L=City, S=State, C=PK"
@"
storePassword=$StorePassword
keyPassword=$KeyPassword
keyAlias=$Alias
storeFile=app/lifebridge-upload-key.jks
"@ | Set-Content "$AndroidDir\key.properties"
Write-Host "Created Android signing files. Keep the .jks and key.properties private and backed up."
