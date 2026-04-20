import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        })
        if (error) throw error
        setMessage('注册成功！请查收验证邮件后登录。')
      }
    } catch (error) {
      setMessage(error.message || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>📋</div>
        <h1 style={styles.title}>任务同步清单</h1>
        <p style={styles.subtitle}>{isLogin ? '登录到您的账号' : '创建新账号'}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input
              type="text"
              placeholder="设置用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          )}
          <input
            type="email"
            placeholder="邮箱地址"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>

          {message && (
            <p style={message.includes('成功') ? styles.successMsg : styles.errorMsg}>
              {message}
            </p>
          )}
        </form>

        <p style={styles.toggle}>
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button onClick={() => { setIsLogin(!isLogin); setMessage('') }} style={styles.toggleBtn}>
            {isLogin ? '立即注册' : '去登录'}
          </button>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  logo: { fontSize: '48px', marginBottom: '12px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' },
  subtitle: { color: '#888', marginBottom: '28px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: {
    padding: '14px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  primaryBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
  },
  successMsg: { color: '#22c55e', fontSize: '14px', marginTop: '8px' },
  errorMsg: { color: '#ef4444', fontSize: '14px', marginTop: '8px' },
  toggle: { marginTop: '20px', color: '#888', fontSize: '14px' },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '4px',
  },
}
