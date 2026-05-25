Set WshShell = CreateObject("WScript.Shell")
DesktopPath = WshShell.SpecialFolders("Desktop")
Set Shortcut = WshShell.CreateShortcut(DesktopPath & "\考研背单词.lnk")
Shortcut.TargetPath = DesktopPath & "\考研背单词\启动.bat"
Shortcut.WorkingDirectory = DesktopPath & "\考研背单词"
Shortcut.Description = "考研英语词汇记忆系统 - 艾宾浩斯遗忘曲线三重记忆法"
Shortcut.Save()
MsgBox "桌面快捷方式已创建！", 64, "考研背单词"
