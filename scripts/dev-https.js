const { spawn } = require('child_process')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 检查 mkcert 是否安装
function checkMkcert() {
  try {
    execSync('mkcert -version', { stdio: 'ignore' })
    return true
  } catch (error) {
    console.error('❌ mkcert 未安装或不在 PATH 中')
    console.log('💡 请安装 mkcert: https://github.com/FiloSottile/mkcert')
    return false
  }
}

// 生成证书
function generateCertificates() {
  const certDir = path.join(__dirname, '..', 'certs')
  
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true })
  }
  
  const certPath = path.join(certDir, 'localhost.pem')
  const keyPath = path.join(certDir, 'localhost-key.pem')
  
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('🔐 生成本地 SSL 证书...')
    try {
      execSync(`mkcert -key-file ${keyPath} -cert-file ${certPath} localhost 127.0.0.1 ::1`, {
        stdio: 'inherit',
        cwd: certDir
      })
      console.log('✅ 证书生成成功')
    } catch (error) {
      console.error('❌ 证书生成失败:', error.message)
      process.exit(1)
    }
  } else {
    console.log('✅ 证书已存在')
  }
  
  return { certPath, keyPath }
}

// 启动 Next.js 开发服务器
function startDevServer(certPath, keyPath) {
  console.log('🚀 启动 HTTPS 开发服务器...')
  
  const env = {
    ...process.env,
    NODE_TLS_REJECT_UNAUTHORIZED: '0',
    SSL_CRT_FILE: certPath,
    SSL_KEY_FILE: keyPath
  }
  
  const child = spawn('npx', ['next', 'dev', '--experimental-https'], {
    stdio: 'inherit',
    shell: true,
    // 隐藏 Node.js 警告和 Next.js 实验性功能警告
    env: {
      ...env,
      NODE_NO_WARNINGS: '1',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  })
  
  child.on('error', (error) => {
    console.error('❌ 启动服务器失败:', error)
    process.exit(1)
  })
  
  child.on('close', (code) => {
    console.log(`\n👋 服务器已停止 (退出码: ${code})`)
    process.exit(code)
  })
  
  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 正在停止服务器...')
    child.kill('SIGINT')
  })
}

// 主函数
function main() {
  console.log('🔧 准备启动 HTTPS 开发环境...')
  
  if (!checkMkcert()) {
    process.exit(1)
  }
  
  const { certPath, keyPath } = generateCertificates()
  startDevServer(certPath, keyPath)
}

main() 