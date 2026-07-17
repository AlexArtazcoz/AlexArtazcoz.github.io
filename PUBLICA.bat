@echo off
rem ---------------------------------------------------------------
rem  PUBLICA.bat — un sol clic per publicar el portfolio.
rem  Desa qualsevol canvi pendent (edicions de l'editor, imatges
rem  noves, textos) en un commit i el puja a GitHub, que reconstrueix
rem  el web automaticament en 2-3 minuts.
rem ---------------------------------------------------------------
cd /d "C:\CLAUDE\architecture-portfolio"
git remote remove origin 2>nul
git remote add origin https://github.com/alexsantae160305-glitch/alexsantae160305-glitch.github.io.git

git add -A
git diff --cached --quiet || git commit -m "content: edicions des de l'editor"

echo.
echo Pujant a GitHub...
echo.
git push -u origin main
echo.
echo ---------------------------------------------------------------
echo Si aqui sobre no hi ha cap "error" ni "fatal", ja esta enviat.
echo El web es reconstrueix sol i en 2-3 minuts els canvis es veuen a:
echo    https://alexsantae160305-glitch.github.io
echo ---------------------------------------------------------------
pause
