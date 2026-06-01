import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Plus, 
  Trash2, 
  Edit2, 
  LogOut, 
  User as UserIcon, 
  FolderPlus, 
  Calendar,
  Play,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { ToastContainer } from './components/Toast';
import type { ToastType } from './components/Toast';

const API_BASE_URL = 'http://localhost:5000/api/v1';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    role: string;
  };
}

export default function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user_profile') ? JSON.parse(localStorage.getItem('user_profile')!) : null
  );
  
  // Navigation State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Input states for login/signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [registerRole, setRegisterRole] = useState<'USER' | 'ADMIN'>('USER');

  // Task list states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

  // Inline editing task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [editStatus, setEditStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

  // Toast System
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch tasks once user is authenticated
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data.data);
      } else {
        addToast(data.message || 'Failed to fetch tasks', 'error');
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      addToast('Cannot connect to backend server. Is it running?', 'error');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent, mode: 'login' | 'register') => {
    e.preventDefault();
    setActionLoading('auth');

    const url = mode === 'login' ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/register`;
    const payload = mode === 'login' 
      ? { email, password } 
      : { name, email, password, passwordConfirm, role: registerRole };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const { token: receivedToken, user: receivedUser } = data.data;
        localStorage.setItem('jwt_token', receivedToken);
        localStorage.setItem('user_profile', JSON.stringify(receivedUser));
        
        setToken(receivedToken);
        setUser(receivedUser);
        
        addToast(data.message || 'Successfully logged in!', 'success');
        
        // Clear auth inputs
        setName('');
        setEmail('');
        setPassword('');
        setPasswordConfirm('');
      } else {
        // Render validation errors if present
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: any) => {
            addToast(`${err.field}: ${err.message}`, 'error');
          });
        } else {
          addToast(data.message || 'Authentication failed', 'error');
        }
      }
    } catch (err) {
      addToast('Network connection failed. Verify server is online.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_profile');
    setToken(null);
    setUser(null);
    setTasks([]);
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    addToast('Logged out successfully', 'success');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('Task title is required', 'error');
      return;
    }

    setActionLoading('create');
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          priority: newPriority,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Task added successfully', 'success');
        setTasks((prev) => [data.data, ...prev]);
        setNewTitle('');
        setNewDescription('');
        setNewPriority('MEDIUM');
        setNewStatus('TODO');
      } else {
        addToast(data.message || 'Failed to create task', 'error');
      }
    } catch (err) {
      addToast('Server connection failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setActionLoading(`delete-${taskId}`);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Task deleted successfully', 'success');
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        addToast(data.message || 'Failed to delete task', 'error');
      }
    } catch (err) {
      addToast('Network error.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCycleStatus = async (task: Task) => {
    const nextStatusMap: Record<'TODO' | 'IN_PROGRESS' | 'DONE', 'TODO' | 'IN_PROGRESS' | 'DONE'> = {
      'TODO': 'IN_PROGRESS',
      'IN_PROGRESS': 'DONE',
      'DONE': 'TODO',
    };
    
    const nextStatus = nextStatusMap[task.status];
    setActionLoading(`status-${task.id}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast(`Task marked as ${nextStatus.replace('_', ' ')}`, 'success');
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      } else {
        addToast(data.message || 'Failed to update task status', 'error');
      }
    } catch (err) {
      addToast('Network connection error.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditStatus(task.status);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleUpdateTaskSubmit = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      addToast('Task title cannot be empty', 'error');
      return;
    }

    setActionLoading(`edit-${taskId}`);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription || null,
          priority: editPriority,
          status: editStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Task updated successfully', 'success');
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? data.data : t))
        );
        setEditingTaskId(null);
      } else {
        addToast(data.message || 'Failed to update task', 'error');
      }
    } catch (err) {
      addToast('Network error.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {!token ? (
        // ==========================================
        // AUTHENTICATION VIEW (Login / Register)
        // ==========================================
        <div className="auth-container">
          <div className="glass-panel auth-card">
            <h1 className="auth-logo">TASK MANAGER</h1>
            <p className="auth-subtitle">
              {authMode === 'login' 
                ? 'Sign in to access your secure task manager dashboard' 
                : 'Create an account to scale up your productivity'}
            </p>

            <form onSubmit={(e) => handleAuthSubmit(e, authMode)}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <UserIcon size={18} className="input-icon" />
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="Repeat your password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {authMode === 'register' && (
                <div className="form-group">
                  <label className="form-label">Role Definition (RBAC Testing)</label>
                  <select
                    className="form-control form-select"
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value as 'USER' | 'ADMIN')}
                  >
                    <option value="USER">User (Self Task access only)</option>
                    <option value="ADMIN">Admin (Superuser access to ALL Tasks)</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={actionLoading === 'auth'}
              >
                {actionLoading === 'auth' ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : authMode === 'login' ? (
                  'Sign In to Dashboard'
                ) : (
                  'Create Secure Account'
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px' }}>
              {authMode === 'login' ? (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <span className="auth-toggle-link" onClick={() => setAuthMode('register')}>
                    Sign up now
                  </span>
                </p>
              ) : (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <span className="auth-toggle-link" onClick={() => setAuthMode('login')}>
                    Sign in here
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // SECURE DASHBOARD VIEW
        // ==========================================
        <div className="dashboard-container">
          {/* Top navigation Header */}
          <nav className="nav-bar">
            <div className="nav-brand">TASK MANAGER</div>
            <div className="nav-user">
              {user && (
                <div className="user-badge">
                  <UserIcon size={14} />
                  <span>Welcome, {user.name} ({user.email})</span>
                  <span className={`user-role role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>
              )}
              <button className="btn btn-secondary btn-logout" onClick={handleLogout}>
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </nav>

          {/* Core Panel Content */}
          <main className="dashboard-main">
            {/* Sidebar Creation Form */}
            <div className="glass-panel task-form-panel">
              <h2 className="panel-title">
                <FolderPlus size={18} style={{ color: 'var(--primary-color)' }} />
                <span>New Task Module</span>
              </h2>

              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Optimize API queries"
                    className="form-control"
                    style={{ paddingLeft: '16px' }}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    placeholder="Provide details about this task..."
                    className="form-control"
                    rows={4}
                    style={{ paddingLeft: '16px', resize: 'vertical' }}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-control form-select"
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
                    >
                      <option value="TODO">Todo</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={actionLoading === 'create'}
                  style={{ marginTop: '12px' }}
                >
                  {actionLoading === 'create' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Add Task</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Tasks Board List Panel */}
            <div className="task-board-panel">
              <div className="board-header">
                <h2 className="board-title">
                  Task Database board {user?.role === 'ADMIN' && <span style={{ color: 'var(--warning-color)', fontSize: '14px', fontWeight: 'normal' }}>(ADMIN Overlord Mode: Viewing ALL records)</span>}
                </h2>
                <button className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }} onClick={fetchTasks} disabled={tasksLoading}>
                  {tasksLoading ? <Loader2 className="animate-spin" size={14} /> : 'Refresh'}
                </button>
              </div>

              {tasksLoading && tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Loader2 className="animate-spin" size={36} style={{ color: 'var(--primary-color)', margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Retrieving secure database tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="glass-panel empty-state">
                  <CheckCircle2 size={40} className="empty-icon" />
                  <h3>All tasks completed or empty!</h3>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>Fill in the sidebar form to populate your relational task board.</p>
                </div>
              ) : (
                <div className="tasks-grid">
                  {tasks.map((task) => (
                    <div key={task.id} className="glass-panel task-card">
                      {editingTaskId === task.id ? (
                        // ==========================================
                        // INLINE TASK EDITING FORM
                        // ==========================================
                        <form onSubmit={(e) => handleUpdateTaskSubmit(e, task.id)} className="edit-form">
                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label className="form-label">Task Title</label>
                            <input
                              type="text"
                              required
                              className="form-control"
                              style={{ paddingLeft: '16px' }}
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label className="form-label">Description</label>
                            <textarea
                              className="form-control"
                              rows={3}
                              style={{ paddingLeft: '16px', resize: 'vertical' }}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div className="form-group" style={{ marginBottom: '0' }}>
                              <label className="form-label">Priority</label>
                              <select
                                className="form-control form-select"
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                              </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '0' }}>
                              <label className="form-label">Status</label>
                              <select
                                className="form-control form-select"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
                              >
                                <option value="TODO">Todo</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: '1', padding: '10px' }} disabled={actionLoading === `edit-${task.id}`}>
                              {actionLoading === `edit-${task.id}` ? <Loader2 className="animate-spin" size={16} /> : 'Save Changes'}
                            </button>
                            <button type="button" className="btn btn-secondary" style={{ flex: '1', padding: '10px' }} onClick={handleCancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        // ==========================================
                        // STANDARD TASK DISPLAY CARD
                        // ==========================================
                        <>
                          <div className="task-card-header">
                            <h3 className="task-title">{task.title}</h3>
                            <div className="task-actions">
                              <button 
                                className="action-btn"
                                title="Edit Task Properties"
                                onClick={() => handleStartEdit(task)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                className="action-btn action-btn-danger"
                                title="Delete Task Forever"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={actionLoading === `delete-${task.id}`}
                              >
                                {actionLoading === `delete-${task.id}` ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          {task.description && (
                            <p className="task-desc">{task.description}</p>
                          )}

                          <div className="task-card-footer">
                            <div className="task-badges">
                              {/* status trigger action (interactive badge) */}
                              <button 
                                className={`badge badge-${task.status.toLowerCase()}`}
                                style={{ border: 'none', cursor: 'pointer' }}
                                onClick={() => handleCycleStatus(task)}
                                disabled={actionLoading === `status-${task.id}`}
                                title="Click to cycle status"
                              >
                                {actionLoading === `status-${task.id}` ? (
                                  <Loader2 className="animate-spin" size={10} />
                                ) : task.status === 'DONE' ? (
                                  <CheckCircle2 size={10} />
                                ) : task.status === 'IN_PROGRESS' ? (
                                  <Play size={10} />
                                ) : (
                                  <Calendar size={10} />
                                )}
                                <span>{task.status.replace('_', ' ')}</span>
                              </button>

                              <span className={`badge badge-${task.priority.toLowerCase()}`}>
                                {task.priority}
                              </span>
                            </div>

                            {/* Show ownership label in Admin mode */}
                            {user?.role === 'ADMIN' && task.user && (
                              <span className="task-owner-label">
                                Owner: {task.user.email} ({task.user.role})
                              </span>
                            )}

                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {formatDate(task.createdAt)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
}
