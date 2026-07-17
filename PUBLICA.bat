@echo off
rem Publica el portfolio a GitHub Pages (nomes cal la primera vegada;
rem despres n'hi ha prou amb: git push)
cd /d "C:\CLAUDE\architecture-portfolio"
git remote remove origin 2>nul
git remote add origin https://github.com/alexsantae160305-glitch/alexsantae160305-glitch.github.io.git
echo.
echo Pujant el portfolio a GitHub (pot trigar 1-3 minuts)...
echo.
git push -u origin main
echo.
echo ---------------------------------------------------------------
echo Si aqui sobre no hi ha cap error, ja esta! GitHub construira el
echo web sol en 2-3 minuts a:  https://alexsantae160305-glitch.github.io
echo ---------------------------------------------------------------
pause
