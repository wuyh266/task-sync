import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function TaskForm({ task, onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('23:59')

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      if (task.due_date) {
        const d = new Date(task.due_date)
        setDueDate(d.toISOString().split('T')[0])
        setDueTime(d.toTimeString().slice(0, 5))
      }
    }
  }, [task])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    let dueDatetime = null
    if (dueDate) {
      dueDatetime = new Date(`${dueDate}T${dueTime || '23:59'}:00`).toISOString()
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      due_date: dueDatetime,
    })
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{task ? '编辑任务' : '新建任务'}</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>任务标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给任务起个名字"
              style={styles.input}
              required
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>详细描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充更多细节..."
              style={styles.textarea}
              rows={3}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={styles.input}
              />
            </div>
            {dueDate && (
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>截止时间</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          <div style={styles.btns}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>取消</button>
            <button type="submit" style={styles.saveBtn}>
              {task ? '保存修改' : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 300, padding: '16px',
  },
  modal: {
    background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 20px 0',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: '4px' },
  form: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: {
    padding: '12px 14px', border: '1.5px solid #e0e0e0',
    borderRadius: '10px', fontSize: '14px', outline: 'none', width: '100%',
  },
  textarea: {
    padding: '12px 14px', border: '1.5px solid #e0e0e0',
    borderRadius: '10px', fontSize: '14px', outline: 'none',
    resize: 'vertical', fontFamily: 'inherit', width: '100%',
  },
  row: { display: 'flex', gap: '12px' },
  btns: { display: 'flex', gap: '10px', marginTop: '4px' },
  cancelBtn: {
    flex: 1, padding: '12px', background: '#f5f5f5', color: '#666',
    border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer',
  },
  saveBtn: {
    flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer',
  },
}
