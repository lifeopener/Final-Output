$OutputEncoding = [Text.UTF8Encoding]::new($true)
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($true)
[Console]::InputEncoding = [Text.UTF8Encoding]::new($true)

Write-Host "Set console to UTF-8 (65001). Launching opencode..."
opencode
