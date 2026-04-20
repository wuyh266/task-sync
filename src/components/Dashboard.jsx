import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { Plus, LogOut, RefreshCw } from 'lucide-react'
import TaskList from './TaskList'
import TaskForm from './TaskForm'

export default function Dashboard({ session }) {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all') // all, active, completed
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [device, setDevice] = useState(getDeviceName())

  function getDeviceName() {
    const ua = navigator.userAgent
    if (/iPhone|iPad|Android/i.test(ua)) return '手机'
    if (/Mac/i.test(ua)) return 'Mac'
    if (/Win/i.test(ua)) return 'Windows PC'
    return '电脑'
  }

  const fetchTasks = useCallback(async () => {
    setSyncing(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTasks(data)
      setLastSync(new Date())
    }
    setSyncing(false)
  }, [session.user.id])

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${session.user.id}`,
      }, () => fetchTasks())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchTasks, session.user.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await supabase
        .from('tasks')
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .eq('id', editingTask.id)
        .eq('user_id', session.user.id)

      await addLog(editingTask.id, session.user.id, device, '更新任务')
    } else {
      const { data } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: session.user.id })
        .select()
        .single()

      if (data) await addLog(data.id, session.user.id, device, '创建任务')
    }

    setShowForm(false)
    setEditingTask(null)
    fetchTasks()
  }

  const handleToggleComplete = async (task) => {
    const newStatus = !task.is_completed
    await supabase
      .from('tasks')
      .update({ is_completed: newStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id)
      .eq('user_id', session.user.id)

    await addLog(task.id, session.user.id, device, newStatus ? '标记完成' : '取消完成')
    fetchTasks()
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('确定要删除这个任务吗？')) return
    await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', session.user.id)
    fetchTasks()
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.is_completed
    if (filter === 'completed') return t.is_completed
    return true
  })

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.headerTitle}>📋 任务同步清单</h1>
          <span style={styles.deviceTag}>📱 {device}</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.syncInfo}>
            {syncing ? '同步中...' : lastSync ? `已同步 ${lastSync.toLocaleTimeString()}` : ''}
          </span>
          <button onClick={fetchTasks} style={styles.iconBtn} title="刷新">
            <RefreshCw size={18} />
          </button>
          <button onClick={handleSignOut} style={styles.iconBtn} title="退出">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Filter tabs */}
      <div style={styles.filterBar}>
        {[
          { key: 'all', label: '全部', count: tasks.length },
          { key: 'active', label: '进行中', count: tasks.filter(t => !t.is_completed).length },
          { key: 'completed', label: '已完成', count: tasks.filter(t => t.is_completed).length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{ ...styles.filterBtn, ...(filter === f.key ? styles.filterBtnActive : {}) }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Task list */}
      <div style={styles.content}>
        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          userId={session.user.id}
          device={device}
        />
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingTask(null); setShowForm(true) }}
        style={styles.fab}
        title="添加任务"
      >
        <Plus size={28} color="#fff" />
      </button>

      {/* Task form modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowForm(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

async function addLog(taskId, userId, device, action) {
  await supabase.from('task_logs').insert({ task_id: taskId, user_id: userId, device, action })
}

const styles = {
  wrapper: { minHeight: '100vh', background: '#f0f2f5', paddingBottom: '100px' },
  header: {
    background: '#fff',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  deviceTag: { fontSize: '12px', background: '#eef2ff', color: '#6366f1', padding: '4px 10px', borderRadius: '20px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  syncInfo: { fontSize: '12px', color: '#999', marginRight: '4px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666', borderRadius: '8px' },
  filterBar: { display: 'flex', gap: '8px', padding: '12px 20px', background: '#fff', borderBottom: '1px solid #eee' },
  filterBtn: {
    padding: '6px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '20px',
    background: '#fff',
    color: '#666',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  filterBtnActive: { background: '#6366f1', color: '#fff', borderColor: '#6366f1' },
  content: { maxWidth: '720px', margin: '0 auto', padding: '16px 12px' },
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
}
