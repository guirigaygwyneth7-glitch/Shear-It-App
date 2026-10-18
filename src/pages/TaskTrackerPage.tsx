import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Layers,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  Users,
  Radio,
  ListFilter,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskStatus, TaskSubtask, UserProfile } from '../types';
import {
  subscribeToTasks,
  createTaskInFirestore,
  updateTaskInFirestore,
  deleteTaskInFirestore,
  seedInitialTasksIfEmpty,
} from '../lib/firebase';

interface TaskTrackerPageProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
}

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string; bg: string; border: string }[] = [
  {
    id: 'todo',
    label: 'To Do',
    icon: CheckSquare,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    icon: Sparkles,
    color: 'text-amber-800',
    bg: 'bg-amber-50/50',
    border: 'border-amber-200',
  },
  {
    id: 'review',
    label: 'Review / QA',
    icon: Clock,
    color: 'text-purple-800',
    bg: 'bg-purple-50/50',
    border: 'border-purple-200',
  },
  {
    id: 'done',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-800',
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
  },
];

const CATEGORIES = [
  'All',
  'Structural',
  'Calculations',
  'Documentation',
  'Design',
  'Laboratory',
  'General',
];

const PRIORITIES: { id: TaskPriority; label: string; bg: string; text: string; dot: string }[] = [
  { id: 'low', label: 'Low', bg: 'bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  { id: 'medium', label: 'Medium', bg: 'bg-sky-50', text: 'text-sky-800', dot: 'bg-sky-500' },
  { id: 'high', label: 'High', bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500' },
  { id: 'urgent', label: 'Urgent', bg: 'bg-rose-50', text: 'text-rose-800', dot: 'bg-rose-600' },
];

export const TaskTrackerPage: React.FC<TaskTrackerPageProps> = ({ currentUser, allUsers }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Structural');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time Firestore sync via onSnapshot
  useEffect(() => {
    seedInitialTasksIfEmpty();

    const unsubscribe = subscribeToTasks(
      (realtimeTasks) => {
        setTasks(realtimeTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to sync tasks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const openCreateModal = (defaultStatus: TaskStatus = 'todo') => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus(defaultStatus);
    setPriority('medium');
    setCategory('Structural');
    setAssigneeId(currentUser.id);
    setDueDate(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
    setTagsInput('');
    setSubtasks([]);
    setShowTaskModal(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setCategory(task.category || 'General');
    setAssigneeId(task.assigneeId || currentUser.id);
    setDueDate(task.dueDate || '');
    setTagsInput((task.tags || []).join(', '));
    setSubtasks(task.subtasks || []);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const targetAssignee = allUsers.find((u) => u.id === assigneeId) || currentUser;
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingTask) {
        await updateTaskInFirestore(editingTask.id, {
          title,
          description,
          status,
          priority,
          category,
          assigneeId: targetAssignee.id,
          assigneeName: targetAssignee.name,
          assigneeAvatar: targetAssignee.avatarUrl || '',
          dueDate,
          tags: parsedTags,
          subtasks,
        });
      } else {
        const newTask: TaskItem = {
          id: `task_${Date.now()}`,
          title,
          description,
          status,
          priority,
          category,
          assigneeId: targetAssignee.id,
          assigneeName: targetAssignee.name,
          assigneeAvatar: targetAssignee.avatarUrl || '',
          creatorId: currentUser.id,
          creatorName: currentUser.name,
          dueDate,
          tags: parsedTags,
          subtasks,
          commentsCount: 0,
          order: tasks.length + 1,
          createdAt: new Date().toISOString(),
        };
        await createTaskInFirestore(newTask);
      }
      setShowTaskModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving task to Firestore.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTaskInFirestore(taskId, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? Changes will sync immediately to all teammates.')) {
      return;
    }
    try {
      await deleteTaskInFirestore(taskId);
      setShowTaskModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = (task.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed } : s
    );

    // Optimistically update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t))
    );

    try {
      await updateTaskInFirestore(taskId, { subtasks: updatedSubtasks });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubtaskInModal = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    if (filterMyTasks && task.assigneeId !== currentUser.id) return false;
    if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && task.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = (task.description || '').toLowerCase().includes(q);
      const matchAssignee = (task.assigneeName || '').toLowerCase().includes(q);
      const matchTags = (task.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchAssignee && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Real-time Header & Collaboration Presence */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono text-[#800000] uppercase font-bold tracking-wider">
              Engineering Team Collaboration
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Firestore Sync
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#292329] tracking-tight mt-1">
            Collaborative Project & Study Task Tracker
          </h1>
          <p className="text-xs text-[#746B70] mt-1 max-w-2xl leading-relaxed">
            Organize engineering design tasks, capstone deliverables, formula derivations, and peer review checklists. Changes broadcast across all student teammates in real time via Firebase Firestore.
          </p>
        </div>

        {/* Action Controls & Active Team Members */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Active Collaborators Facepile */}
          <div className="flex items-center gap-1.5 p-2 bg-[#F8EDEF]/40 rounded-xl border border-[#E8A5A9]/50">
            <span className="text-[11px] font-semibold text-[#800000] mr-1 hidden sm:inline">
              Team:
            </span>
            <div className="flex -space-x-1.5">
              {allUsers.slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  title={`${u.name} (${u.program})`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white shadow-2xs ${
                    u.id === currentUser.id
                      ? 'bg-gradient-to-br from-[#800000] to-[#570018]'
                      : 'bg-gradient-to-br from-amber-600 to-amber-800'
                  }`}
                >
                  {u.name.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-mono text-[#746B70] ml-1">
              {tasks.length} tasks
            </span>
          </div>

          <button
            onClick={() => openCreateModal('todo')}
            className="px-4 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#800000]/25 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer active:scale-95 ring-1 ring-amber-300/40"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters, Search & View Switcher */}
      <div className="bg-white rounded-2xl border border-[#F8EDEF] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Search & Category filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, formulas, assignees..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#746B70] hover:text-[#292329]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#800000] text-white shadow-2xs'
                    : 'bg-[#FAF9F9] text-[#746B70] hover:bg-[#F8EDEF] hover:text-[#800000]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Priority, My Tasks, View Mode */}
        <div className="flex items-center gap-2">
          {/* Priority dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl text-[#292329] font-medium focus:outline-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assigned to Me Toggle */}
          <button
            onClick={() => setFilterMyTasks(!filterMyTasks)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMyTasks
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-2xs'
                : 'bg-white border-[#E8A5A9]/70 text-[#746B70] hover:bg-[#F8EDEF]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Tasks</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center p-0.5 bg-[#FAF9F9] rounded-xl border border-[#E8A5A9]/70">
            <button
              onClick={() => setViewMode('board')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white text-[#800000] shadow-2xs'
                  : 'text-[#746B70] hover:text-[#292329]'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#800000] shadow-2xs'
                  : 'text-[#746B70] hover:text-[#292329]'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Content: Board or List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#F8EDEF] p-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-[#292329]">Connecting to Firebase Firestore...</h3>
          <p className="text-xs text-[#746B70]">Establishing real-time snapshot listener on /tasks</p>
        </div>
      ) : viewMode === 'board' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const Icon = col.icon;
            return (
              <div
                key={col.id}
                className="bg-white rounded-2xl border border-[#F8EDEF] shadow-xs overflow-hidden flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-[#F8EDEF] ${col.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${col.color}`} />
                    <h3 className="text-xs font-bold text-[#292329] uppercase tracking-wide">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-[#E8A5A9]/50 text-[#800000] tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[720px]">
                  {colTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#746B70] border-2 border-dashed border-[#F8EDEF] rounded-xl my-2">
                      No tasks in {col.label}.
                      <button
                        onClick={() => openCreateModal(col.id)}
                        className="block mt-2 mx-auto text-xs font-bold text-[#800000] hover:underline cursor-pointer"
                      >
                        + Add task
                      </button>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priorityConfig =
                        PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];
                      const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
                      const totalSubtasks = (task.subtasks || []).length;

                      return (
                        <div
                          key={task.id}
                          className="p-4 bg-[#FAF9F9] hover:bg-white border border-[#F8EDEF] hover:border-[#E8A5A9] rounded-xl shadow-2xs hover:shadow-sm transition-all space-y-3 group cursor-pointer"
                          onClick={() => openEditModal(task)}
                        >
                          {/* Tags & Priority */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${priorityConfig.bg} ${priorityConfig.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
                              {priorityConfig.label}
                            </span>
                            <span className="text-[10px] font-mono text-[#746B70] truncate">
                              {task.category}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-bold text-[#292329] line-clamp-2 leading-snug group-hover:text-[#800000] transition-colors">
                            {task.title}
                          </h4>

                          {/* Description snippet */}
                          {task.description && (
                            <p className="text-[11px] text-[#746B70] line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks Progress */}
                          {totalSubtasks > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-[#746B70]">
                                <span>Checklist</span>
                                <span>
                                  {completedSubtasks}/{totalSubtasks}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-full transition-all"
                                  style={{
                                    width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer: Due date & Assignee & Quick Move */}
                          <div
                            className="pt-2 border-t border-[#F8EDEF] flex items-center justify-between text-[11px] text-[#746B70]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-[#800000] text-white flex items-center justify-center text-[9px] font-bold">
                                {(task.assigneeName || 'U').charAt(0)}
                              </div>
                              <span className="truncate max-w-[90px] font-medium text-[#292329]">
                                {task.assigneeName?.split(' ')[0]}
                              </span>
                            </div>

                            {/* Quick Status Shift Buttons */}
                            <div className="flex items-center gap-1">
                              {col.id !== 'todo' && (
                                <button
                                  type="button"
                                  title="Move to previous status"
                                  onClick={() => {
                                    const prevIdx = COLUMNS.findIndex((c) => c.id === col.id) - 1;
                                    if (prevIdx >= 0) handleStatusChange(task.id, COLUMNS[prevIdx].id);
                                  }}
                                  className="p-1 text-[#746B70] hover:text-[#800000] hover:bg-white rounded transition-colors"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  type="button"
                                  title="Advance to next status"
                                  onClick={() => {
                                    const nextIdx = COLUMNS.findIndex((c) => c.id === col.id) + 1;
                                    if (nextIdx < COLUMNS.length) handleStatusChange(task.id, COLUMNS[nextIdx].id);
                                  }}
                                  className="p-1 text-[#746B70] hover:text-emerald-700 hover:bg-white rounded transition-colors"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Column Quick Add Footer */}
                <div className="p-3 border-t border-[#F8EDEF] bg-[#FAF9F9]">
                  <button
                    onClick={() => openCreateModal(col.id)}
                    className="w-full py-2 text-xs font-semibold text-[#800000] hover:bg-[#F8EDEF] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="bg-white rounded-2xl border border-[#F8EDEF] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F9] border-b border-[#F8EDEF] text-[#746B70] font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Task Title & Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Assignee</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8EDEF]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-xs text-[#746B70]">
                      No tasks found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const priorityConfig =
                      PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];
                    const colConfig = COLUMNS.find((c) => c.id === task.status) || COLUMNS[0];
                    const completedSubtasks = (task.subtasks || []).filter((s) => s.completed).length;
                    const totalSubtasks = (task.subtasks || []).length;

                    return (
                      <tr
                        key={task.id}
                        onClick={() => openEditModal(task)}
                        className="hover:bg-[#F8EDEF]/30 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#292329] text-xs">{task.title}</div>
                          <div className="text-[10px] text-[#746B70] font-mono mt-0.5">
                            Category: {task.category} · Created by {task.creatorName}
                          </div>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg border border-[#E8A5A9]/70 bg-white text-[#800000] focus:outline-none cursor-pointer"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review / QA</option>
                            <option value="done">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityConfig.bg} ${priorityConfig.text}`}
                          >
                            {priorityConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#800000] text-white flex items-center justify-center text-[9px] font-bold">
                              {(task.assigneeName || 'U').charAt(0)}
                            </div>
                            <span className="text-xs text-[#292329] font-medium">
                              {task.assigneeName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-mono text-[#746B70]">
                          {task.dueDate || 'No date'}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[11px] font-mono font-bold text-[#292329]">
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 text-[#746B70] hover:text-[#800000] rounded mr-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-[#746B70] hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#570018]/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#F8EDEF] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#570018] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold">
                  {editingTask ? 'Edit Task (Syncs to Firestore)' : 'Create New Collaborative Task'}
                </h3>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-[#E5D6DA] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTask} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solve Reinforced Concrete T-Beam Design Moment Capacity"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/25"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Detailed Description & Derivation Steps
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide reference formulas, syllabus topic, required output format, or validation notes..."
                  className="w-full p-3 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/25"
                />
              </div>

              {/* Status, Priority, Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl font-medium"
                  >
                    <option value="todo">📋 To Do</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="review">🔍 Review / QA</option>
                    <option value="done">✅ Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl font-medium"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">
                    Assign to Team Member
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl font-medium"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({(u.program || 'Engineering').slice(0, 10)}.)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292329] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#F8EDEF]">
                <label className="block text-xs font-bold text-[#292329]">
                  Subtasks & Acceptance Checklist
                </label>
                <div className="space-y-1.5">
                  {subtasks.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F9] border border-[#F8EDEF]"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={(e) => {
                            setSubtasks((prev) =>
                              prev.map((s) => (s.id === st.id ? { ...s, completed: e.target.checked } : s))
                            );
                          }}
                          className="w-4 h-4 text-[#800000] rounded focus:ring-[#800000]"
                        />
                        <span
                          className={`text-xs ${
                            st.completed ? 'line-through text-[#746B70]' : 'text-[#292329]'
                          }`}
                        >
                          {st.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setSubtasks((prev) => prev.filter((s) => s.id !== st.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtaskInModal();
                      }
                    }}
                    placeholder="Add checklist item and press Enter..."
                    className="flex-1 px-3 py-1.5 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskInModal}
                    className="px-3 py-1.5 bg-[#800000] text-white font-bold text-xs rounded-xl hover:bg-[#6B1E35] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-[#292329] mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="NSCP-2015, ETABS, Capstone, Soil-Mechanics"
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl font-mono"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-[#F8EDEF] flex items-center justify-between gap-3">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(editingTask.id)}
                    className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#746B70] border border-[#E8A5A9] rounded-xl hover:bg-[#F8EDEF] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] hover:to-[#A01A33] rounded-xl shadow-sm hover:shadow-md hover:shadow-[#800000]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95 ring-1 ring-amber-300/40"
                  >
                    {submitting
                      ? 'Syncing to Firestore...'
                      : editingTask
                      ? 'Save & Broadcast Changes'
                      : 'Create & Sync Task'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
