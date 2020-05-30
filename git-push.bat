@echo off 
echo 上传中...
git add .
git commit -am 'u'
git push
echo WScript.Sleep 1000 > %temp%/tmp$$$.vbs  
set /a i = 5
:Timeout  
::如果时间结束，执行Next函数
if %i% == 0 goto Next  
color 2 
echo 上传完成，%i%秒后关闭... 
setlocal
set /a i = %i% - 1  
cscript //nologo %temp%/tmp$$$.vbs  
goto Timeout 
goto End
:Next  
exit