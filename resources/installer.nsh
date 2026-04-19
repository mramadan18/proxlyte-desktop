; Custom NSIS script for Proxlyte
; This file is included in the installer build process by electron-builder

!macro customInit
  ; This macro is called when the installer is initialized.
  ; You can add custom initialization logic here.
!macroend

!macro customInstall
  ; This macro is called after the application files are installed.
  ; You can add custom post-installation logic here (e.g., adding to PATH).
!macroend

!macro customUnInstall
  ; This macro is called after the application files are uninstalled.
  ; You can add custom cleanup logic here.
!macroend
