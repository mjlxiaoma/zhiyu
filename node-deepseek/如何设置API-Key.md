# 如何设置 DeepSeek API Key

## 步骤 1: 获取 API Key

访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 获取你的 API Key。

API Key 格式类似：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 步骤 2: 在 PowerShell 中设置环境变量

打开 PowerShell，在**运行程序之前**执行：

```powershell
$env:DEEPSEEK_API_KEY = "sk-你的API密钥粘贴在这里"
```

**重要提示**：
- ✅ 将 `sk-你的API密钥粘贴在这里` 替换为你的真实 API Key
- ✅ 保留双引号
- ✅ 在同一个 PowerShell 窗口中继续运行 `npm start`

## 步骤 3: 验证设置（可选）

```powershell
echo $env:DEEPSEEK_API_KEY
```

如果显示了你的 API Key，说明设置成功。

## 步骤 4: 运行程序

```powershell
npm start
```

---

## 完整示例

在 PowerShell 中依次运行：

```powershell
# 1. 设置 API Key（替换为你的真实密钥）
$env:DEEPSEEK_API_KEY = "sk-1234567890abcdef1234567890abcdef"

# 2. 验证（可选）
echo $env:DEEPSEEK_API_KEY

# 3. 运行程序
npm start
```

---

## 注意事项

⚠️ **临时设置**：这种方式设置的环境变量只在当前 PowerShell 窗口有效
- 关闭窗口后失效
- 每次打开新的 PowerShell 都需要重新设置

💡 **永久设置**：如果想永久设置，在 PowerShell 中运行：

```powershell
[System.Environment]::SetEnvironmentVariable("DEEPSEEK_API_KEY", "sk-你的API密钥", "User")
```

然后**重启 PowerShell** 即可。

