from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc, func
from app.models import Todo
from app.schemas import TodoCreate, TodoUpdate


async def get_todos(
    db: AsyncSession,
    category: Optional[str] = None,
    completed: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
):
    query = select(Todo)

    if category:
        query = query.where(Todo.category == category)
    if completed is not None:
        query = query.where(Todo.completed == completed)

    # Sort: incomplete first, then by priority (high -> low), then by due_date
    query = query.order_by(
        asc(Todo.completed),
        func.case(
            (Todo.priority == "높음", 1),
            (Todo.priority == "중간", 2),
            (Todo.priority == "낮음", 3),
            else_=2,
        ),
        asc(Todo.due_date),
        desc(Todo.created_at),
    )

    # Count total
    count_query = select(func.count()).select_from(Todo)
    if category:
        count_query = count_query.where(Todo.category == category)
    if completed is not None:
        count_query = count_query.where(Todo.completed == completed)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    todos = result.scalars().all()

    return {
        "items": todos,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


async def get_todo(db: AsyncSession, todo_id: int):
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    return result.scalar_one_or_none()


async def create_todo(db: AsyncSession, todo: TodoCreate):
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    await db.commit()
    await db.refresh(db_todo)
    return db_todo


async def update_todo(db: AsyncSession, todo_id: int, todo: TodoUpdate):
    db_todo = await get_todo(db, todo_id)
    if not db_todo:
        return None

    update_data = todo.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)

    await db.commit()
    await db.refresh(db_todo)
    return db_todo


async def delete_todo(db: AsyncSession, todo_id: int):
    db_todo = await get_todo(db, todo_id)
    if not db_todo:
        return None

    await db.delete(db_todo)
    await db.commit()
    return db_todo
