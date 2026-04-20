import { useState } from 'react'
import TaskCard from './TaskCard'

export default function TaskList({ tasks, onToggle, onEdit, onDelete, userId, device }) {
  const [expandedId, setExpandedId] = useState(null)

  if (tasks.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>📭</div>
        <p style={styles.emptyText}>暂无任务</p>
        <p style={styles.emptySub}>点击右下角 + 添加您的第一个任务</p>
      </div>
    )
  }

  return (
    <div style={styles.list}>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          isExpanded={expandedId === task.id}
          onToggle={() => onToggle(task)}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onExpand={() => setExpandedId(expandedId === task.id ? null : task.id)}
          userId={userId}
          device={device}
        />
      ))}
    </div>
  )
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#999' },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: '600', color: '#555', marginBottom: '6px' },
  emptySub: { fontSize: '13px' },
}
