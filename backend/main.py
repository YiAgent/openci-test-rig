from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI(title="Task Board API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory task store
tasks = [
    {"id": "1", "title": "Set up CI/CD pipeline", "description": "Configure GitHub Actions for automated builds", "status": "done"},
    {"id": "2", "title": "Write unit tests", "description": "Add test coverage for core modules", "status": "in_progress"},
    {"id": "3", "title": "Deploy to staging", "description": "Deploy the latest build to the staging environment", "status": "todo"},
]


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""


class TaskUpdate(BaseModel):
    status: str


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/tasks")
async def list_tasks():
    return tasks


@app.post("/tasks", status_code=201)
async def create_task(task: TaskCreate):
    new_task = {
        "id": str(uuid.uuid4()),
        "title": task.title,
        "description": task.description,
        "status": "todo",
    }
    tasks.append(new_task)
    return new_task


@app.patch("/tasks/{task_id}")
async def update_task(task_id: str, update: TaskUpdate):
    for task in tasks:
        if task["id"] == task_id:
            if update.status not in ("todo", "in_progress", "done"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid status '{update.status}'. Must be one of: todo, in_progress, done",
                )
            task["status"] = update.status
            return task
    raise HTTPException(status_code=404, detail="Task not found")


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    for i, task in enumerate(tasks):
        if task["id"] == task_id:
            removed = tasks.pop(i)
            return removed
    raise HTTPException(status_code=404, detail="Task not found")
