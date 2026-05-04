"use client";

import { useState, useEffect, FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const statusColors: Record<string, string> = {
  todo: "bg-gray-200 text-gray-800",
  in_progress: "bg-blue-200 text-blue-800",
  done: "bg-green-200 text-green-800",
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch {
      setError("Could not connect to the backend. Is it running?");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      setTitle("");
      setDescription("");
      await fetchTasks();
    } catch {
      setError("Failed to create task");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      await fetchTasks();
    } catch {
      setError("Failed to update task");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      await fetchTasks();
    } catch {
      setError("Failed to delete task");
    }
  };

  const groupedTasks: Record<string, Task[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const nextStatus: Record<string, string> = {
    todo: "in_progress",
    in_progress: "done",
    done: "todo",
  };

  const nextLabel: Record<string, string> = {
    todo: "Start",
    in_progress: "Complete",
    done: "Reopen",
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Task Board</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={addTask} className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Add New Task</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors self-start"
          >
            Add Task
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(groupedTasks).map(([status, statusTasks]) => (
          <div key={status} className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${status === "todo" ? "bg-gray-400" : status === "in_progress" ? "bg-blue-400" : "bg-green-400"}`} />
              {statusLabels[status]}
              <span className="text-sm text-gray-500 ml-1">({statusTasks.length})</span>
            </h2>

            <div className="space-y-3">
              {statusTasks.length === 0 && (
                <p className="text-gray-400 text-sm">No tasks</p>
              )}

              {statusTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateStatus(task.id, nextStatus[task.status])}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                    >
                      {nextLabel[task.status]}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
