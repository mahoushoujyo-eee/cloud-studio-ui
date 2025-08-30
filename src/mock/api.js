import { mockUsers, mockWorkspaces, mockApiResponse, mockErrorResponse } from './index.js'

// 模拟API延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟登录API
export const mockLogin = async (credentials) => {
  await delay()
  
  const user = mockUsers.find(u => 
    (u.username === credentials.username || u.email === credentials.username) && 
    u.password === credentials.password
  )
  
  if (user) {
    const token = 'mock-jwt-token-' + Date.now()
    return mockApiResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar
      }
    }, '登录成功')
  } else {
    return mockErrorResponse('用户名或密码错误', 401)
  }
}

// 模拟注册API
export const mockRegister = async (userData) => {
  await delay()
  
  // 检查用户名是否已存在
  const existingUser = mockUsers.find(u => 
    u.username === userData.username || u.email === userData.email
  )
  
  if (existingUser) {
    return mockErrorResponse('用户名或邮箱已存在', 400)
  }
  
  return mockApiResponse(null, '注册成功')
}

// 模拟发送验证码API
export const mockSendCode = async (data) => {
  await delay()
  console.log('发送验证码到:', data.receiver)
  return mockApiResponse(null, '验证码已发送')
}

// 模拟重置密码API
export const mockResetPassword = async (data) => {
  await delay()
  return mockApiResponse(null, '密码重置成功')
}

// 模拟获取用户信息API
export const mockGetUserInfo = async () => {
  await delay()
  return mockApiResponse(mockUsers[0], '获取成功')
}

// 模拟获取工作空间列表API
export const mockGetWorkspaces = async () => {
  await delay()
  return mockApiResponse(mockWorkspaces, '查询成功')
}

// 模拟创建工作空间API
export const mockCreateWorkspace = async (data) => {
  await delay()
  const newWorkspace = {
    ...data,
    status: 'Creating',
    phase: 'Pending',
    created_at: new Date().toISOString(),
    url: ''
  }
  mockWorkspaces.push(newWorkspace)
  return mockApiResponse(data.name, '创建成功')
}

// 模拟删除工作空间API
export const mockDeleteWorkspace = async (data) => {
  await delay()
  const index = mockWorkspaces.findIndex(ws => ws.name === data.name)
  if (index > -1) {
    mockWorkspaces.splice(index, 1)
    return mockApiResponse(null, '删除成功')
  }
  return mockErrorResponse('工作空间不存在', 404)
}

// 模拟获取工作空间详情API
export const mockGetWorkspaceDetails = async (data) => {
  await delay()
  const workspace = mockWorkspaces.find(ws => ws.name === data.name)
  if (workspace) {
    return mockApiResponse({
      phase: workspace.phase,
      conditions: []
    }, '获取成功')
  }
  return mockErrorResponse('工作空间不存在', 404)
}

// 模拟停止工作空间API
export const mockStopWorkspace = async (data) => {
  await delay()
  const workspace = mockWorkspaces.find(ws => ws.deployment === data.deployment)
  if (workspace) {
    workspace.status = 'Stopped'
    workspace.phase = 'Succeeded'
    workspace.state = 'stopped'
    workspace.url = ''
    workspace.UpdatedAt = new Date().toISOString()
    return mockApiResponse(null, '工作空间已停止')
  }
  return mockErrorResponse('工作空间不存在', 404)
}

// 模拟启动/重启工作空间API
export const mockStartWorkspace = async (data) => {
  await delay()
  const workspace = mockWorkspaces.find(ws => ws.deployment === data.deployment)
  if (workspace) {
    // 首先设置为pending状态
    workspace.status = 'Pending'
    workspace.phase = 'Pending'
    workspace.state = 'pending'
    workspace.UpdatedAt = new Date().toISOString()
    
    // 模拟异步启动过程，2秒后变为running状态
    setTimeout(() => {
      workspace.status = 'Running'
      workspace.phase = 'Running'
      workspace.state = 'running'
      workspace.UpdatedAt = new Date().toISOString()
      // 模拟生成访问 URL
      workspace.url = `https://${workspace.name}.cloudstudio.dev`
    }, 2000)
    
    return mockApiResponse(null, '工作空间启动中')
  }
  return mockErrorResponse('工作空间不存在', 404)
}

// 模拟获取工作空间日志API
export const mockGetWorkspaceLog = async (data) => {
  await delay()
  const workspace = mockWorkspaces.find(ws => ws.deployment === data.deployment)
  if (workspace) {
    // 模拟真实的日志内容，采用用户提供的格式
    const logContent = `[migrations] started
[migrations] no migrations found
───────────────────────────────────────

      ██╗     ███████╗██╗ ██████╗
      ██║     ██╔════╝██║██╔═══██╗
      ██║     ███████╗██║██║   ██║
      ██║     ╚════██║██║██║   ██║
      ███████╗███████║██║╚██████╔╝
      ╚══════╝╚══════╝╚═╝ ╚═════╝

   Brought to you by linuxserver.io
───────────────────────────────────────

To support LSIO projects visit:
https://www.linuxserver.io/donate/

───────────────────────────────────────
GID/UID
───────────────────────────────────────

User UID:    1000
User GID:    1000
───────────────────────────────────────
Linuxserver.io version: 4.103.0-ls292
Build-date: 2025-08-13T02:36:25+00:00
───────────────────────────────────────
    
setting up sudo access
adding abc to sudoers
setting sudo password using SUDO_PASSWORD env var
New password: Retype new password: passwd: password updated successfully
[custom-init] No custom files found, skipping...
[2025-08-30T08:57:00.787Z] info  code-server 4.103.0 f1236d80b96dce4fc53bbf63b77d03d1fec8eb1d
[2025-08-30T08:57:00.788Z] info  Using user-data-dir /config/data
[2025-08-30T08:57:00.810Z] info  Using config file /config/.config/code-server/config.yaml
[2025-08-30T08:57:00.810Z] info  HTTP server listening on http://0.0.0.0:8443/
[2025-08-30T08:57:00.810Z] info    - Authentication is enabled
[2025-08-30T08:57:00.811Z] info      - Using password from $PASSWORD
[2025-08-30T08:57:00.811Z] info    - Not serving HTTPS
[2025-08-30T08:57:00.811Z] info  Session server listening on /config/data/code-server-ipc.sock
Connection to 127.0.0.1 8443 port [tcp/*] succeeded!
[ls.io-init] done.
[08:57:25] 




[08:57:25] Extension host agent started.
File not found: /app/code-server/lib/vscode/node_modules/vsda/rust/web/vsda_bg.wasm
File not found: /app/code-server/lib/vscode/node_modules/vsda/rust/web/vsda.js
[08:57:33] [10.244.219.64][74b749df][ManagementConnection] New connection established.
[08:57:36] [10.244.219.64][02a576ac][ExtensionHostConnection] New connection established.
[08:57:36] [10.244.219.64][02a576ac][ExtensionHostConnection] ⟨1126⟩ Launched Extension Host Process.
[2025-08-30T08:58:06.073Z] error Failed to get latest version [38;2;140;140;140m{"error":"https://api.github.com/repos/coder/code-server/releases/latest: 503"}[0m
[09:06:32] Error: read ECONNRESET
    at TCP.onStreamRead (node:internal/stream_base_commons:216:20) {
  errno: -104,
  code: 'ECONNRESET',
  syscall: 'read'
}
[09:06:32] [10.244.219.64][74b749df][ManagementConnection] The client has disconnected, will wait for reconnection 3h before disposing...
File not found: /app/code-server/lib/vscode/node_modules/vsda/rust/web/vsda_bg.wasm
File not found: /app/code-server/lib/vscode/node_modules/vsda/rust/web/vsda.js
[09:07:27] [10.244.219.64][74b749df][ManagementConnection] Another client has connected, will shorten the wait for reconnection 5m before disposing...
[09:07:27] [10.244.219.64][b264e7f3][ManagementConnection] New connection established.
[09:07:29] [10.244.219.64][1b76646d][ExtensionHostConnection] New connection established.
[09:07:29] [10.244.219.64][1b76646d][ExtensionHostConnection] ⟨4005⟩ Launched Extension Host Process.`
    
    // 返回符合用户要求的响应格式
    return {
      data: {
        statuscode: 200,
        data: logContent,
        message: "查询成功"
      }
    }
  }
  return {
    data: {
      statuscode: 404,
      data: null,
      message: "工作空间不存在"
    }
  }
}

export default function setupMockAPI() {
  console.log('Mock API initialized')
}