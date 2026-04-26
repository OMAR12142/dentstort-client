import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Trash2,
  MessageCircle,
  Plus,
} from 'lucide-react';
import { useTasks, useToggleTask, useDeleteTask } from '../hooks/useTasks';
import AddTaskModal from '../components/AddTaskModal';
import Card from '../components/Card';
import { CardSkeleton } from '../components/Skeleton';

export default function TasksPage() {
  const { data: tasksData, isLoading } = useTasks();
  const { mutate: toggleTask } = useToggleTask();
  const { mutate: deleteTask } = useDeleteTask();
  const [showAddTask, setShowAddTask] = useState(false);

  const tasks = tasksData?.tasks || [];
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  const getTaskTypeBadge = (type) => {
    const badges = {
      Lab_Work: { label: 'Lab Work', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
      Follow_Up: { label: 'Follow Up', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      Financial: { label: 'Financial', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
      General: { label: 'General', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
    };
    return badges[type] || badges.General;
  };

  const TaskItem = ({ task, idx }) => {
    const badge = getTaskTypeBadge(task.type);
    const isFollowUp = task.type === 'Follow_Up';
    const whatsappLink =
      isFollowUp && task.patient_id?.phone
        ? `https://wa.me/${task.patient_id.phone.replace(/\D/g, '').startsWith('0') ? '20' + task.patient_id.phone.replace(/\D/g, '').substring(1) : task.patient_id.phone.replace(/\D/g, '').startsWith('20') ? task.patient_id.phone.replace(/\D/g, '') : '20' + task.patient_id.phone.replace(/\D/g, '')}`
        : null;
    const isOverdue = task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date();

    return (
      <motion.div
        key={task._id}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="flex items-start justify-between gap-3 p-4 rounded-lg bg-base-100/50 hover:bg-base-100 transition-colors group"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => toggleTask(task._id)}
            className="mt-0.5 shrink-0 text-base-content/40 hover:text-primary transition-colors"
            title={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.isCompleted ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : (
              <Circle size={20} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-medium break-words flex-1 min-w-0 ${
                task.isCompleted ? 'text-base-content/40 line-through' : 'text-base-content'
              }`}>
                {task.text}
              </p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color} shrink-0`}>
                {badge.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-base-content/60 mt-2 flex-wrap">
              {task.clinic_id?.name && (
                <span className="px-2 py-0.5 bg-base-300/50 rounded break-words max-w-[150px]">
                  📍 {task.clinic_id.name}
                </span>
              )}
              {task.patient_id?.name && task.type === 'Follow_Up' && (
                <span className="px-2 py-0.5 bg-base-300/50 rounded break-words max-w-[150px]">
                  👤 {task.patient_id.name}
                </span>
              )}
              {task.dueDate && (
                <span className={`px-2 py-0.5 rounded ${
                  isOverdue
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold'
                    : 'bg-base-300/50'
                }`}>
                  {isOverdue ? '⚠ Overdue — ' : '📅 '}
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-base-content/40 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-all duration-200"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          )}
          <button
            onClick={() => deleteTask(task._id)}
            className="p-2 text-base-content/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Smart Shift Tasks</h1>
        <p className="text-base-content/70 text-sm mt-0.5">
          Manage your day-to-day tasks, lab work, and follow-ups seamlessly.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <>
          {tasks.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ListTodo size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-base-content mb-2">No tasks yet</h3>
              <p className="text-base-content/70 text-sm mb-6">
                Create your first task to start organizing your workflow.
              </p>
              <button
                onClick={() => setShowAddTask(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} /> Add First Task
              </button>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <p className="text-xs text-base-content/70 uppercase font-semibold mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold text-base-content">{tasks.length}</p>
                </Card>
                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 sm:p-5 border border-primary/20 dark:border-primary/30">
                  <p className="text-xs text-primary/70 uppercase font-bold mb-1 tracking-wider">Active</p>
                  <p className="text-2xl font-black text-primary">{activeTasks.length}</p>
                </div>
                <div className="bg-success/5 dark:bg-success/10 rounded-2xl p-4 sm:p-5 border border-success/20 dark:border-success/30">
                  <p className="text-xs text-success/70 uppercase font-bold mb-1 tracking-wider">Completed</p>
                  <p className="text-2xl font-black text-success">{completedTasks.length}</p>
                </div>
              </div>

              {/* Active Tasks */}
              {activeTasks.length > 0 && (
                <Card>
                  <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <ListTodo size={20} className="text-primary/60" />
                    Active Tasks ({activeTasks.length})
                  </h2>
                  <div className="space-y-3">
                    {activeTasks.map((task, idx) => (
                      <TaskItem key={task._id} task={task} idx={idx} />
                    ))}
                  </div>
                </Card>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <Card>
                  <h2 className="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                    Completed Tasks ({completedTasks.length})
                  </h2>
                  <div className="space-y-3">
                    {completedTasks.map((task, idx) => (
                      <TaskItem key={task._id} task={task} idx={idx} />
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Add Task Fab */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddTask(true)}
        className="fixed bottom-24 lg:bottom-12 right-6 w-14 h-14 rounded-full flex items-center justify-center bg-primary text-white hover:bg-primary/90 transition-colors z-40"
        title="Add Task"
      >
        <Plus size={24} />
      </motion.button>

      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  );
}
