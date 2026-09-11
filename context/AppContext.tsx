import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Workspace,
  User,
  Project,
  Task,
  Team,
  Document,
  Notification,
  Activity,
  AutomationRule,
  KanbanColumn,
  ProjectViewMode,
  Priority,
  ProjectStatus,
  Subtask,
} from "../types";
import {
  INITIAL_USERS,
  INITIAL_WORKSPACES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TEAMS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_AUTOMATIONS,
  DEFAULT_COLUMNS,
} from "../data/initialData";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  description?: string;
}

interface AppContextType {
  // Current user & workspace
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  setCurrentWorkspaceId: (id: string) => void;
  createWorkspace: (name: string, color: string) => void;

  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeProjectView: ProjectViewMode;
  setActiveProjectView: (view: ProjectViewMode) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;

  // Data
  projects: Project[];
  tasks: Task[];
  teams: Team[];
  documents: Document[];
  notifications: Notification[];
  activities: Activity[];
  automations: AutomationRule[];
  columns: KanbanColumn[];

  // Task operations
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  createTask: (taskData: Partial<Task>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskColumn: (taskId: string, newColumnId: string) => void;
  moveTask: (taskId: string, newColumnId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addComment: (taskId: string, content: string) => void;

  // Project operations
  createProject: (projectData: Partial<Project>, initialTasks?: Array<{ title: string; description?: string; priority?: Priority; columnId?: string; subtasks?: Array<{ title: string; completed: boolean }> }>) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  toggleFavoriteProject: (projectId: string) => void;

  // Documents
  createDocument: (docData: Partial<Document>) => Document;
  updateDocument: (docId: string, updates: Partial<Document>) => void;
  deleteDocument: (docId: string) => void;

  // Teams
  createTeam: (teamData: Partial<Team>) => Team;

  // Automations
  toggleAutomation: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Modals & Triggers
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: (open: boolean) => void;
  isCreateDocOpen: boolean;
  setIsCreateDocOpen: (open: boolean) => void;
  isCreateTeamOpen: boolean;
  setIsCreateTeamOpen: (open: boolean) => void;

  // Theme (Dark Mode Default with Minimalist Glassmorphism)
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;

  // Search & Global Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  quickFilter: "all" | "today" | "overdue" | "my-tasks";
  setQuickFilter: (filter: "all" | "today" | "overdue" | "my-tasks") => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem("flow_workspaces");
    return saved ? JSON.parse(saved) : INITIAL_WORKSPACES;
  });
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>("ws-prime");

  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [activeProjectId, setActiveProjectId] = useState<string | null>("prj-1");
  const [activeProjectView, setActiveProjectView] = useState<ProjectViewMode>("kanban");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [columns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("flow_projects");
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("flow_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem("flow_teams");
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem("flow_documents");
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("flow_notifications");
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem("flow_activities");
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem("flow_automations");
    return saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
  });

  // Modals
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  // Theme State (Dark mode default, glassmorphism)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("flow_theme");
    return saved === "light" ? "light" : "dark"; // Default is strictly "dark"
  });

  useEffect(() => {
    localStorage.setItem("flow_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      addToast({
        type: "info",
        title: next === "dark" ? "Modo Escuro Ativo" : "Modo Claro Ativo",
        description: next === "dark" ? "Design glassmorphic escuro ativado." : "Design claro ativado.",
      });
      return next;
    });
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<"all" | "today" | "overdue" | "my-tasks">("all");

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("flow_workspaces", JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem("flow_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("flow_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("flow_documents", JSON.stringify(documents));
  }, [documents]);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const logActivity = (action: string, targetType: "task" | "project" | "document" | "comment", targetTitle: string) => {
    const newAct: Activity = {
      id: "act-" + Date.now(),
      workspaceId: currentWorkspaceId,
      userId: currentUser.id,
      action,
      targetType,
      targetTitle,
      timestamp: "Agora mesmo",
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 30)]);
  };

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Workspace creation
  const createWorkspace = (name: string, color: string) => {
    const newWs: Workspace = {
      id: "ws-" + Date.now(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      color,
      ownerId: currentUser.id,
      memberCount: 1,
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setCurrentWorkspaceId(newWs.id);
    addToast({
      type: "success",
      title: "Workspace Criado",
      description: `O espaço de trabalho "${name}" está pronto a utilizar.`,
    });
  };

  // Task operations
  const createTask = (taskData: Partial<Task>): Task => {
    const newTask: Task = {
      id: "tsk-" + Date.now(),
      workspaceId: currentWorkspaceId,
      projectId: taskData.projectId || activeProjectId || (projects[0]?.id ?? "prj-1"),
      columnId: taskData.columnId || "col-todo",
      title: taskData.title || "Nova Tarefa",
      description: taskData.description || "",
      priority: taskData.priority || "MÉDIA",
      assigneeId: taskData.assigneeId || currentUser.id,
      collaboratorIds: taskData.collaboratorIds || [],
      labels: taskData.labels || ["Geral"],
      startDate: taskData.startDate || new Date().toISOString().split("T")[0],
      dueDate: taskData.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      estimatedHours: taskData.estimatedHours || 4,
      loggedHours: 0,
      subtasks: taskData.subtasks || [],
      dependencies: taskData.dependencies || [],
      attachmentsCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    logActivity("criou a tarefa", "task", newTask.title);
    addToast({
      type: "success",
      title: "Tarefa Criada",
      description: `"${newTask.title}" adicionada com sucesso.`,
    });

    // Check automation for task_created
    const autoAssign = automations.find((a) => a.active && a.trigger === "task_created");
    if (autoAssign && !taskData.assigneeId) {
      const proj = projects.find((p) => p.id === newTask.projectId);
      if (proj) {
        updateTask(newTask.id, { assigneeId: proj.ownerId });
      }
    }

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
          // If column changed to done, mark completed
          if (updates.columnId === "col-done") {
            updated.isCompleted = true;
          } else if (updates.columnId && updates.columnId !== "col-done") {
            updated.isCompleted = false;
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (taskToDelete) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      logActivity("eliminou a tarefa", "task", taskToDelete.title);
      addToast({
        type: "info",
        title: "Tarefa Eliminada",
        description: `"${taskToDelete.title}" foi removida.`,
      });
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
    }
  };

  const moveTaskColumn = (taskId: string, newColumnId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Check dependencies if moving to review or done
    if ((newColumnId === "col-done" || newColumnId === "col-review") && task.dependencies.length > 0) {
      const pendingDependencies = tasks.filter((t) => task.dependencies.includes(t.id) && !t.isCompleted);
      if (pendingDependencies.length > 0) {
        addToast({
          type: "warning",
          title: "Atenção a Dependências!",
          description: `A tarefa depende de "${pendingDependencies.map((p) => p.title).join(", ")}" que ainda não foi concluída.`,
        });
      }
    }

    const colObj = columns.find((c) => c.id === newColumnId);
    updateTask(taskId, {
      columnId: newColumnId,
      isCompleted: newColumnId === "col-done",
    });
    logActivity(`moveu a tarefa para '${colObj?.title || newColumnId}'`, "task", task.title);

    // Automation: if status changed to review
    if (newColumnId === "col-review") {
      const autoReview = automations.find((a) => a.active && a.trigger === "status_changed_review");
      if (autoReview) {
        addToast({
          type: "info",
          title: "Automação Ativa",
          description: "Notificação de revisão enviada ao gestor.",
        });
      }
    }
  };

  const moveTask = (taskId: string, newColumnId: string) => {
    moveTaskColumn(taskId, newColumnId);
  };

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const willBeCompleted = !task.isCompleted;
    const newColumnId = willBeCompleted ? "col-done" : "col-todo";
    updateTask(taskId, {
      isCompleted: willBeCompleted,
      columnId: newColumnId,
    });
    addToast({
      type: "success",
      title: willBeCompleted ? "Tarefa Concluída!" : "Tarefa Reaberta",
      description: `"${task.title}" marcada como ${willBeCompleted ? "concluída" : "a fazer"}.`,
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSubtasks = t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st));
          const allCompleted = newSubtasks.length > 0 && newSubtasks.every((st) => st.completed);

          // If all completed, check automation rule
          let targetColumn = t.columnId;
          const autoDone = automations.find((a) => a.active && a.trigger === "task_completed");
          if (allCompleted && autoDone) {
            targetColumn = "col-done";
            addToast({
              type: "success",
              title: "Automação Executada",
              description: `Todas as subtarefas concluídas. "${t.title}" movida para Concluído!`,
            });
          }

          return {
            ...t,
            subtasks: newSubtasks,
            columnId: targetColumn,
            isCompleted: targetColumn === "col-done",
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSub: Subtask = {
            id: "sub-" + Date.now(),
            title,
            completed: false,
          };
          return {
            ...t,
            subtasks: [...t.subtasks, newSub],
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const addComment = (taskId: string, content: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            commentsCount: t.commentsCount + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
    const targetTask = tasks.find((t) => t.id === taskId);
    logActivity("adicionou um comentário em", "task", targetTask?.title || "Tarefa");
    addToast({
      type: "success",
      title: "Comentário Publicado",
      description: "O teu comentário foi partilhado com a equipa.",
    });
  };

  // Project operations
  const createProject = (
    projectData: Partial<Project>,
    initialTasks?: Array<{ title: string; description?: string; priority?: Priority; columnId?: string; subtasks?: Array<{ title: string; completed: boolean }> }>
  ): Project => {
    const newProject: Project = {
      id: "prj-" + Date.now(),
      workspaceId: currentWorkspaceId,
      teamId: projectData.teamId || teams[0]?.id,
      name: projectData.name || "Novo Projeto",
      description: projectData.description || "Descrição do projeto",
      icon: projectData.icon || "Folder",
      color: projectData.color || "#6366f1",
      ownerId: currentUser.id,
      startDate: projectData.startDate || new Date().toISOString().split("T")[0],
      targetDate: projectData.targetDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: projectData.status || "Em andamento",
      priority: projectData.priority || "ALTA",
      progress: 0,
      memberIds: [currentUser.id, users[1]?.id, users[2]?.id].filter(Boolean),
      isFavorite: false,
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    logActivity("criou o projeto", "project", newProject.name);

    // If initial tasks are provided (e.g. by AI generator)
    if (initialTasks && initialTasks.length > 0) {
      const generatedTasks: Task[] = initialTasks.map((t, idx) => ({
        id: `tsk-gen-${Date.now()}-${idx}`,
        workspaceId: currentWorkspaceId,
        projectId: newProject.id,
        columnId: t.columnId || (idx === 0 ? "col-todo" : idx === 1 ? "col-in-progress" : "col-backlog"),
        title: t.title,
        description: t.description || "",
        priority: t.priority || "MÉDIA",
        assigneeId: currentUser.id,
        collaboratorIds: [users[1]?.id].filter(Boolean),
        labels: [newProject.name.split(" ")[0] || "Geral"],
        startDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + (idx + 3) * 86400000).toISOString().split("T")[0],
        estimatedHours: 4,
        loggedHours: 0,
        subtasks: (t.subtasks || []).map((st, sIdx) => ({
          id: `sub-gen-${Date.now()}-${idx}-${sIdx}`,
          title: st.title,
          completed: st.completed || false,
        })),
        dependencies: [],
        attachmentsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setTasks((prev) => [...generatedTasks, ...prev]);
    }

    addToast({
      type: "success",
      title: "Projeto Criado!",
      description: `"${newProject.name}" foi criado e estruturado com sucesso.`,
    });

    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p)));
  };

  const deleteProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
      logActivity("eliminou o projeto", "project", proj.name);
      addToast({
        type: "info",
        title: "Projeto Eliminado",
        description: `"${proj.name}" e as suas tarefas foram removidos.`,
      });
      if (activeProjectId === projectId) {
        setActiveProjectId(projects.find((p) => p.id !== projectId)?.id || null);
      }
    }
  };

  const toggleFavoriteProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p)));
  };

  // Documents
  const createDocument = (docData: Partial<Document>): Document => {
    const newDoc: Document = {
      id: "doc-" + Date.now(),
      workspaceId: currentWorkspaceId,
      projectId: docData.projectId,
      title: docData.title || "Documento Sem Título",
      content: docData.content || "# Novo Documento\n\nComece a escrever aqui...",
      authorId: currentUser.id,
      category: docData.category || "Geral",
      tags: docData.tags || ["Documento"],
      updatedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logActivity("criou o documento", "document", newDoc.title);
    addToast({
      type: "success",
      title: "Documento Criado",
      description: `"${newDoc.title}" pronto para edição.`,
    });
    return newDoc;
  };

  const updateDocument = (docId: string, updates: Partial<Document>) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)));
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Teams
  const createTeam = (teamData: Partial<Team>): Team => {
    const newTeam: Team = {
      id: "team-" + Date.now(),
      workspaceId: currentWorkspaceId,
      name: teamData.name || "Nova Equipa",
      description: teamData.description || "",
      leaderId: teamData.leaderId || currentUser.id,
      memberIds: teamData.memberIds || [currentUser.id],
      color: teamData.color || "#8b5cf6",
    };
    setTeams((prev) => [...prev, newTeam]);
    addToast({
      type: "success",
      title: "Equipa Criada",
      description: `A equipa "${newTeam.name}" foi adicionada ao Workspace.`,
    });
    return newTeam;
  };

  // Automations
  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = !a.active;
          addToast({
            type: "info",
            title: next ? "Automação Ativada" : "Automação Pausada",
            description: `Regra "${a.name}" foi ${next ? "ativada" : "desativada"}.`,
          });
          return { ...a, active: next };
        }
        return a;
      })
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({
      type: "info",
      title: "Notificações",
      description: "Todas as notificações marcadas como lidas.",
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        workspaces,
        currentWorkspace,
        setCurrentWorkspaceId,
        createWorkspace,

        currentView,
        setCurrentView,
        activeProjectId,
        setActiveProjectId,
        activeProjectView,
        setActiveProjectView,
        isSidebarCollapsed,
        setIsSidebarCollapsed,

        projects,
        tasks,
        teams,
        documents,
        notifications,
        activities,
        automations,
        columns,

        selectedTaskId,
        setSelectedTaskId,
        createTask,
        updateTask,
        deleteTask,
        moveTaskColumn,
        moveTask,
        toggleTaskCompletion,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        addComment,

        createProject,
        updateProject,
        deleteProject,
        toggleFavoriteProject,

        createDocument,
        updateDocument,
        deleteDocument,

        createTeam,
        toggleAutomation,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isCreateProjectOpen,
        setIsCreateProjectOpen,
        isCreateDocOpen,
        setIsCreateDocOpen,
        isCreateTeamOpen,
        setIsCreateTeamOpen,

        searchQuery,
        setSearchQuery,
        quickFilter,
        setQuickFilter,

        theme,
        setTheme,
        toggleTheme,

        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
