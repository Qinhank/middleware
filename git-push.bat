@echo off 
echo �ϴ���...
git add .
git commit -am 'u'
git push
echo WScript.Sleep 1000 > %temp%/tmp$$$.vbs  
set /a i = 5
:Timeout  
::���ʱ�������ִ��Next����
if %i% == 0 goto Next  
color 2 
echo �ϴ���ɣ�%i%���ر�... 
setlocal
set /a i = %i% - 1  
cscript //nologo %temp%/tmp$$$.vbs  
goto Timeout 
goto End
:Next  
exit