import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Check, Edit2, Trash2, ChevronDown, ChevronUp, Clock, Plus } from 'lucide-react'

export default function TaskCard({ task, isExpanded, onToggle, onEdit, onDelete, onExpand, userId, device }) {
  const [logs, setLogs] = useState([])
  const [newLog, setNewLog] = useState('')
  const [showLogInput, setShowLogInput] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)

  const isOverdue = task.due_date && !task.is_completed && new Date(task.due_date) < new Date()

  const fetchLogs = async () => {
    setLoadingLogs(true)
    const { data } = await supabase
      .from('task_logs')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setLogs(data || [])
    setLoadingLogs(false)
  }

  useEffect(() => {
    if (isExpanded) fetchLogs()
  }, [isExpanded, task.id])

  const handleAddLog = async () => {
    if (!newLog.trim()) return
    await supabase.from('task_logs').insert({
      task_id: task.id,
      user_id: userId,
      device,
      action: newLog.trim(),
    })
    setNewLog('')
    setShowLogInput(false)
    fetchLogs()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diff = d - now
    if (diff < 0 && diff > -86400000) return '今天截止'
    if (diff > 0 && diff < 86400000) return '明天截止'
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ ...styles.card, ...(task.is_completed ? styles.cardDone : {}) }}>
      {/* Main row */}
      <div style={styles.mainRow}>
        <button onClick={onToggle} style={{ ...styles.checkBtn, ...(task.is_completed ? styles.checkBtnDone : {}) }}>
          {task.is_completed && <Check size={14} color="#fff" />}
        </button>

        <div style={styles.info} onClick={onExpand}>
          <div style={styles.titleRow}>
            <span style={{ ...styles.title, ...(task.is_completed ? styles.titleDone : {}) }}>
              {task.title}
            </span>
            {task.due_date && (
              <span style={{ ...styles.dueTag, ...(isOverdue ? styles.dueTagOverdue : {}) }}>
                <Clock size={11} /> {formatDate(task.due_date)}
              </span>
            )}
          </div>
          {task.description && (
            <p style={{ ...styles.desc, ...(task.is_completed ? styles.descDone : {}) }}>
              {task.description}
            </p>
          )}
        </div>

        <div style={styles.actions}>
          <button onClick={onEdit} style={styles.actionBtn} title="编辑">
            <Edit2 size={15} />
          </button>
          <button onClick={onDelete} style={{ ...styles.actionBtn, ...styles.deleteBtn }} title="删除">
            <Trash2 size={15} />
          </button>
          <button onClick={onExpand} style={styles.actionBtn} title={isExpanded ? '收起' : '展开'}>
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Expanded: logs section */}
      {isExpanded && (
        <div style={styles.logsSection}>
          <div style={styles.logsHeader}>
            <span style={styles.logsTitle}>📝 操作日志</span>
            <button
              onClick={() => setShowLogInput(!showLogInput)}
              style={styles.addLogBtn}
            >
              <Plus size={13} /> 追加日志
            </button>
          </div>

          {showLogInput && (
            <div style={styles.logInputRow}>
              <input
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                placeholder="写下你想记录的内容..."
                style={styles.logInput}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}
                autoFocus
              />
              <button onClick={handleAddLog} style={styles.logSubmit}>发送</button>
              <button onClick={() => { setShowLogInput(false); setNewLog('') }} style={styles.logCancel}>取消</button>
            </div>
          )}

          {loadingLogs ? (
            <p style={styles.loadingLogs}>加载中...</p>
          ) : logs.length === 0 ? (
            <p style={styles.noLogs}>暂无日志记录</p>
          ) : (
            <div style={styles.logs}>
              {logs.map(log => (
                <div key={log.id} style={styles.logItem}>
                  <div style={styles.logDot} />
                  <div style={styles.logContent}>
                    <div style={styles.logAction}>{log.action}</div>
                    <div style={styles.logMeta}>
                      {log.device} · {new Date(log.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    transition: 'all 0.2s',
  },
  cardDone: { opacity: 0.6 },
  mainRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 14px 14px 12px' },
  checkBtn: {
    width: '22px', height: '22px', borderRadius: '50%',
    border: '2px solid #d0d0d0', background: '#fff',
    cursor: 'pointer', flexShrink: 0, marginTop: '2px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  checkBtnDone: { background: '#6366f1', borderColor: '#6366f1' },
  info: { flex: 1, minWidth: 0, cursor: 'pointer' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  title: { fontSize: '15px', fontWeight: '600', color: '#1a1a2e' },
  titleDone: { textDecoration: 'line-through', color: '#999' },
  desc: { fontSize: '13px', color: '#888', marginTop: '4px', lineHeight: 1.4 },
  descDone: { textDecoration: 'line-through' },
  dueTag: {
    fontSize: '11px', background: '#f0f0f0', color: '#666',
    padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px',
  },
  dueTagOverdue: { background: '#fee2e2', color: '#dc2626' },
  actions: { display: 'flex', gap: '2px', flexShrink: 0 },
  actionBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
    color: '#aaa', borderRadius: '6px', transition: 'all 0.15s',
  },
  deleteBtn: { color: '#fca5a5' },
  logsSection: { borderTop: '1px solid #f0f0f0', padding: '12px 14px' },
  logsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  logsTitle: { fontSize: '13px', fontWeight: '600', color: '#555' },
  addLogBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: '#f0f0ff', color: '#6366f1', border: 'none',
    padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
  },
  logInputRow: { display: 'flex', gap: '8px', marginBottom: '10px' },
  logInput: {
    flex: 1, padding: '8px 12px', border: '1.5px solid #e0e0e0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
  },
  logSubmit: {
    background: '#6366f1', color: '#fff', border: 'none',
    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
  },
  logCancel: {
    background: '#f5f5f5', color: '#888', border: 'none',
    padding: '8px 10px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
  },
  loadingLogs: { fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '8px' },
  noLogs: { fontSize: '13px', color: '#ccc', textAlign: 'center', padding: '8px' },
  logs: { display: 'flex', flexDirection: 'column', gap: '0' },
  logItem: { display: 'flex', gap: '10px', padding: '6px 0', position: 'relative' },
  logDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#6366f1', flexShrink: 0, marginTop: '5px',
  },
  logContent: { flex: 1 },
  logAction: { fontSize: '13px', color: '#333', lineHeight: 1.4 },
  logMeta: { fontSize: '11px', color: '#aaa', marginTop: '2px' },
}
