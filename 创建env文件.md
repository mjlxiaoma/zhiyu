# 如何创建 .env 文件

## 步骤 1: 创建 .env 文件

在项目根目录（`F:\node-deepsek\`）创建一个名为 `.env` 的文件。

### Windows 创建 .env 文件的方法：

**方法 1：使用 PowerShell**
```powershell
New-Item -Path .env -ItemType File
```

**方法 2：使用记事本**
1. 打开记事本
2. 粘贴下面的内容
3. 点击"文件" → "另存为"
4. 文件名输入：`.env`（包含引号）
5. 文件类型选择：所有文件
6. 保存到项目根目录

**方法 3：使用 VSCode/Cursor**
1. 在项目根目录右键
2. 选择"新建文件"
3. 命名为 `.env`

## 步骤 2: 编辑 .env 文件内容

在 `.env` 文件中写入：

```
DEEPSEEK_API_KEY=sk-7714527068b640199290bfec2e0bdfa9
```

**注意：**
- ✅ 等号两边不要有空格
- ✅ 不需要引号
- ✅ 确保没有多余的空行或空格

## 步骤 3: 验证文件内容

你的 `.env` 文件应该看起来像这样：

```
DEEPSEEK_API_KEY=sk-7714527068b640199290bfec2e0bdfa9
```

## 步骤 4: 运行程序

```powershell
npm start
```

---

## 工作原理

现在 `index.js` 已经更新为：

```javascript
import dotenv from 'dotenv';

// 加载 .env 文件中的环境变量
dotenv.config();

// 从环境变量中获取 DeepSeek API Key
const apiKey = process.env.DEEPSEEK_API_KEY;
```

- `dotenv.config()` 会自动读取项目根目录下的 `.env` 文件
- 将文件中的配置加载到 `process.env` 中
- 这样就不需要在 PowerShell 中手动设置环境变量了

---

## 常见问题

### 问：为什么要用 .env 文件？

**答**：
- ✅ 方便管理配置
- ✅ 不需要每次打开终端都设置环境变量
- ✅ 符合行业标准实践
- ✅ `.env` 文件在 `.gitignore` 中，不会被提交到 Git

### 问：.env 文件在哪里创建？

**答**：在项目根目录，和 `index.js`、`package.json` 在同一个文件夹。

### 问：还是报错怎么办？

**答**：
1. 确认 `.env` 文件在正确的位置（项目根目录）
2. 确认文件名是 `.env`（不是 `.env.txt`）
3. 确认内容格式正确（等号两边无空格）
4. 重新运行 `npm start`

