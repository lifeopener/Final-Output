# OpenCode 한글 입력 해결 방법

## 방법 1: 배치 파일로 실행 (간편)
`opencode-korean.bat` 파일을 실행하세요.
UTF-8 모드로 전환한 후 OpenCode가 실행됩니다.

## 방법 2: PowerShell 스크립트
`opencode-korean.ps1` 파일을 실행하세요.

## 방법 3: PowerShell 프로필에 추가 (영구적)
PowerShell을 열고:
```powershell
if (!(Test-Path $PROFILE)) { New-Item -Path $PROFILE -ItemType File -Force }
notepad $PROFILE
```
다음 내용 추가 후 저장:
```powershell
function opencode-utf8 {
    [Console]::OutputEncoding = [Text.UTF8Encoding]::new($true)
    [Console]::InputEncoding = [Text.UTF8Encoding]::new($true)
    opencode
}
Set-Alias -Name ok -Value opencode-utf8
```
이제 `ok` 명령어로 OpenCode를 실행하면 됩니다.

## 방법 4: Windows Terminal 프로필 설정
Windows Terminal → 설정 → 프로필 추가 → 다음 명령어:
```
cmd.exe /k "chcp 65001 && opencode"
```

## 방법 5: Web UI (가장 안정적)
```
opencode web
```
