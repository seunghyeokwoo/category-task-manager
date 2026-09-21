from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category: str = Field(default="기타", pattern="^(업무|개인|학습|쇼핑|기타)$")
    priority: str = Field(default="중간", pattern="^(높음|중간|낮음)$")
    due_date: Optional[datetime] = None
    completed: bool = False
    repeat_interval: str = Field(default="none", pattern="^(none|daily|weekly|monthly)$")
    repeat_end_date: Optional[datetime] = None


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, pattern="^(업무|개인|학습|쇼핑|기타)$")
    priority: Optional[str] = Field(None, pattern="^(높음|중간|낮음)$")
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    repeat_interval: Optional[str] = Field(None, pattern="^(none|daily|weekly|monthly)$")
    repeat_end_date: Optional[datetime] = None


class TodoResponse(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
