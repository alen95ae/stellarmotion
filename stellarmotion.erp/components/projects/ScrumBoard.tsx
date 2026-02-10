"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
    CheckCircle2,
    Circle,
    Clock,
    AlertOctagon,
    MoreHorizontal,
    Plus,
    Filter,
    Search,
    Zap,
    LayoutGrid,
    List,
    Calendar,
    User,
    AlertTriangle,
    Bug,
    Code2,
    Sparkles,
    Inbox,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
type Priority = "Low" | "Medium" | "High" | "Critical";
type TaskType = "Feature" | "Bug" | "Refactor" | "Design";

interface Member {
    id: string;
    name: string;
    avatar: string; // Initials
    image?: string; // URL
}

interface Task {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    priority: Priority;
    points: number;
    assignee?: Member;
    createdAt: string;
    sprint?: string;
}

interface ColumnData {
    id: string;
    title: string;
    tasks: Task[];
    color: string; // Visual accent color
    icon: React.ReactNode;
    isBacklog?: boolean;
}

// --- Mock Data ---
const MOCK_MEMBERS: Member[] = [
    { id: "m1", name: "Alex Dev", avatar: "AD" },
    { id: "m2", name: "Sarah Design", avatar: "SD" },
    { id: "m3", name: "Mike Manager", avatar: "MM" },
];

const INITIAL_COLUMNS: ColumnData[] = [
    {
        id: "backlog",
        title: "Backlog / Tareas Pendientes",
        color: "bg-slate-500",
        icon: <Inbox className="w-4 h-4 text-slate-500" />,
        isBacklog: true,
        tasks: [
            { id: "t-101", title: "Actualizar dependencias de seguridad", type: "Refactor", priority: "High", points: 2, createdAt: "2024-03-01" },
            { id: "t-102", title: "Investigar API de WhatsApp Business", type: "Feature", priority: "Medium", points: 5, createdAt: "2024-03-02" },
            { id: "t-103", title: "Corregir padding en móvil", type: "Bug", priority: "Low", points: 1, createdAt: "2024-03-03" },
            { id: "t-104", title: "Diseñar flow de onboarding", type: "Design", priority: "High", points: 8, createdAt: "2024-03-04" },
        ],
    },
    {
        id: "todo",
        title: "Por Hacer",
        color: "bg-blue-500",
        icon: <Circle className="w-4 h-4 text-blue-500" />,
        tasks: [
            { id: "t-2", title: "Modo oscuro automático", type: "Feature", priority: "Low", points: 2, createdAt: "2024-03-02" },
            { id: "t-3", title: "Integración con Slack", type: "Feature", priority: "Medium", points: 5, createdAt: "2024-03-03", assignee: MOCK_MEMBERS[2] },
        ],
    },
    {
        id: "in-progress",
        title: "En Progreso",
        color: "bg-indigo-500",
        icon: <Zap className="w-4 h-4 text-indigo-500" />,
        tasks: [
            { id: "t-6", title: "Refactorizar API Maps", type: "Refactor", priority: "High", points: 5, createdAt: "2024-03-04", assignee: MOCK_MEMBERS[0] },
            { id: "t-7", title: "Nuevos iconos Dashboard", type: "Design", priority: "Medium", points: 3, createdAt: "2024-03-04", assignee: MOCK_MEMBERS[1] },
        ],
    },
    {
        id: "review",
        title: "Revisión / QA",
        color: "bg-purple-500",
        icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
        tasks: [
            { id: "t-9", title: "Validación formularios", type: "Feature", priority: "Medium", points: 3, createdAt: "2024-03-02", assignee: MOCK_MEMBERS[1] },
        ],
    },
    {
        id: "complete",
        title: "Completado",
        color: "bg-green-500",
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        tasks: [
            { id: "t-11", title: "Setup repositorio", type: "Refactor", priority: "High", points: 1, createdAt: "2024-02-28", assignee: MOCK_MEMBERS[0] },
        ],
    },
];

// --- Helpers ---
const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
        case "Critical": return "bg-red-50 text-red-700 border-red-200 border";
        case "High": return "bg-orange-50 text-orange-700 border-orange-200 border";
        case "Medium": return "bg-blue-50 text-blue-700 border-blue-200 border";
        case "Low": return "bg-slate-50 text-slate-700 border-slate-200 border";
        default: return "bg-slate-50 text-slate-700 border-slate-200 border";
    }
};

const getTypeStyles = (type: TaskType) => {
    switch (type) {
        case "Feature": return "text-emerald-700 bg-emerald-50 border-emerald-200";
        case "Bug": return "text-rose-700 bg-rose-50 border-rose-200";
        case "Refactor": return "text-indigo-700 bg-indigo-50 border-indigo-200";
        case "Design": return "text-violet-700 bg-violet-50 border-violet-200";
        default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
};

// --- Component ---
const ScrumBoard = () => {
    const [columns, setColumns] = useState<ColumnData[]>(INITIAL_COLUMNS);
    const [isClient, setIsClient] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [backlogOpen, setBacklogOpen] = useState(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColIndex = columns.findIndex(col => col.id === source.droppableId);
        const destColIndex = columns.findIndex(col => col.id === destination.droppableId);

        const sourceCol = columns[sourceColIndex];
        const destCol = columns[destColIndex];

        const sourceTasks = [...sourceCol.tasks];
        const destTasks = source.droppableId === destination.droppableId ? sourceTasks : [...destCol.tasks];

        const [removed] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, removed);

        const newColumns = [...columns];
        newColumns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
        if (source.droppableId !== destination.droppableId) {
            newColumns[destColIndex] = { ...destCol, tasks: destTasks };
        }
        setColumns(newColumns);
    };

    const handleNewTask = () => {
        const newTask: Task = {
            id: `new-${Date.now()}`,
            title: "Nueva Tarea",
            type: "Feature",
            priority: "Medium",
            points: 1,
            createdAt: new Date().toISOString(),
        };
        const newColumns = columns.map(col =>
            col.id === 'backlog' ? { ...col, tasks: [newTask, ...col.tasks] } : col
        );
        setColumns(newColumns);
        if (!backlogOpen) setBacklogOpen(true);
    };

    if (!isClient) return <div className="p-8 text-sm text-gray-500 flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 animate-pulse rounded-full"></div> Cargando tablero...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-white/50 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-dashed border-gray-200/80 bg-white/80">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Proyecto Alpha
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 font-normal">Sprint 24</Badge>
                    </h1>
                    <p className="text-gray-500 text-xs mt-0.5">Gestión de flujo de trabajo y tareas activas</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                            placeholder="Buscar tarea..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-xs w-full md:w-56 bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-blue-500 border-gray-200"
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-gray-500">
                        <Filter className="w-3.5 h-3.5" />
                    </Button>
                    <Button onClick={handleNewTask} size="sm" className="h-8 bg-[#e94446] hover:bg-[#d63a3a] text-white text-xs font-medium px-3 shadow-sm shadow-red-200">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Nueva Tarea
                    </Button>
                </div>
            </div>

            {/* Board Layout */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex flex-1 overflow-hidden">

                    {/* Backlog Sidebar - Separated visually */}
                    <div className={`transition-all duration-300 ease-in-out flex flex-col ${backlogOpen ? 'w-[260px] min-w-[260px]' : 'w-[40px] min-w-[40px]'} border-r border-gray-200 bg-slate-50/50 backdrop-blur-md z-10 relative`}>
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 min-h-[49px]">
                            {backlogOpen && (
                                <div className="flex items-center gap-2 font-medium text-xs text-slate-700 uppercase tracking-wide">
                                    <Inbox className="w-3.5 h-3.5 text-slate-500" />
                                    Backlog
                                    <Badge variant="secondary" className="ml-auto h-4 px-1 min-w-[1.25rem] text-[10px] bg-slate-200 text-slate-600">
                                        {columns.find(c => c.id === 'backlog')?.tasks.length}
                                    </Badge>
                                </div>
                            )}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-slate-200 text-slate-400 ml-auto" onClick={() => setBacklogOpen(!backlogOpen)}>
                                {backlogOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </Button>
                        </div>

                        {backlogOpen ? (
                            <Droppable droppableId="backlog">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 ${snapshot.isDraggingOver ? 'bg-slate-100/80 ring-inset ring-2 ring-blue-500/10' : ''}`}
                                    >
                                        {columns.find(c => c.id === 'backlog')?.tasks
                                            .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white p-3 rounded border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:shadow transition-all group select-none ${snapshot.isDragging ? "shadow-xl rotate-2 z-50 ring-1 ring-slate-200 opaciy-90" : ""
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-1.5">
                                                                <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 font-normal border-0 leading-none ${getTypeStyles(task.type)}`}>
                                                                    {task.type}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="text-xs font-medium text-slate-700 leading-snug mb-2 group-hover:text-slate-900">{task.title}</h4>
                                                            <div className="flex items-center justify-between">
                                                                <div className={`text-[9px] px-1 py-[1px] rounded uppercase font-semibold tracking-wider ${getPriorityStyles(task.priority)} bg-opacity-50`}>
                                                                    {task.priority}
                                                                </div>
                                                                {task.points && (
                                                                    <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1 rounded">
                                                                        {task.points}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ) : (
                            <div className="h-full flex flex-col items-center pt-8 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => setBacklogOpen(true)}>
                                <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold text-slate-400 tracking-widest flex items-center gap-2">
                                    BACKLOG
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Board Columns */}
                    <div className="flex-1 overflow-x-auto bg-gray-50/30">
                        <div className="flex gap-4 h-full min-w-max p-4 items-start">
                            {columns.filter(c => !c.isBacklog).map((column) => (
                                <div key={column.id} className="w-[280px] flex flex-col h-full max-h-full rounded-lg bg-gray-100/30 border border-transparent">
                                    {/* Header */}
                                    <div className={`p-2 px-3 flex items-center justify-between mb-2`}>
                                        <div className="flex items-center gap-2 font-medium text-xs text-gray-500 uppercase tracking-wide">
                                            <div className={`w-2 h-2 rounded-full ${column.color.replace('bg-', 'bg-')}`}></div>
                                            {column.title}
                                            <span className="ml-1 text-[10px] bg-gray-200/50 px-1.5 rounded-full text-gray-400">
                                                {column.tasks.length}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200/50 rounded text-gray-400">
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    {/* Tasks */}
                                    <Droppable droppableId={column.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 px-2 pb-2 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 transition-colors rounded-lg ${snapshot.isDraggingOver ? "bg-slate-100/50 ring-1 ring-inset ring-slate-200" : ""
                                                    }`}
                                            >
                                                {column.tasks
                                                    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`group bg-white p-3 rounded-lg border border-gray-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-gray-300/80 transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "shadow-xl ring-2 ring-[#e94446]/10 rotate-1 scale-105 z-50 opacity-100 bg-white" : ""
                                                                        }`}
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-sm flex items-center gap-1 leading-none ${getTypeStyles(task.type)} bg-opacity-30`}>
                                                                            {task.type}
                                                                        </span>
                                                                        {task.assignee && (
                                                                            <Avatar className="h-5 w-5 -mt-1 -mr-1 border border-white">
                                                                                <AvatarFallback className="text-[9px] bg-slate-100 text-slate-500 font-medium">
                                                                                    {task.assignee.avatar}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                        )}
                                                                    </div>

                                                                    <h3 className="text-xs font-medium text-gray-700 mb-3 leading-snug line-clamp-3">
                                                                        {task.title}
                                                                    </h3>

                                                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-gray-100">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`flex items-center text-[9px] px-1.5 py-[2px] rounded border font-medium uppercase tracking-wider ${getPriorityStyles(task.priority)}`}>
                                                                                {task.priority}
                                                                            </div>
                                                                        </div>

                                                                        {task.points && (
                                                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono" title="Story Points">
                                                                                <div className="w-4 h-4 rounded bg-gray-50 border border-gray-100 flex items-center justify-center">
                                                                                    {task.points}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};

export default ScrumBoard;
