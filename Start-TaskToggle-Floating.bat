@echo off
title TaskToggle Floating Desktop Widget
echo ===================================================
echo Starting TaskToggle Pure Floating Desktop Widget...
echo (Frameless, Transparent, Zero Navbar, Floats over all apps)
echo ===================================================
cd /d "%~dp0"
node electron/launcher.cjs
