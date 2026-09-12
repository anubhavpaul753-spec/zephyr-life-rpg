from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = 'Adventurer'
    career_track: Optional[str] = 'Software Engineer & Builder'
    life_goal: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    level: int
    current_xp: int
    xp_for_next_level: int
    life_credits: int
    current_streak: int
    longest_streak: int
    last_active_date: Optional[date]
    stat_craft: int
    stat_resilience: int
    stat_calm: int
    stat_lovedones: int
    stat_discipline: int
    stat_joy: int
    career_track: str
    life_goal: str

    class Config:
        from_attributes = True

# Quest Schemas
class QuestCreate(BaseModel):
    title: str
    note: Optional[str] = None
    time_label: Optional[str] = 'Flexible'
    pillar: str # 'Craft', 'Resilience', 'Calm', 'LovedOnes', 'Discipline', 'Joy'
    category: Optional[str] = 'routine'
    difficulty: Optional[str] = 'medium'
    xp_reward: Optional[int] = 25
    credits_reward: Optional[int] = 15
    relationship_id: Optional[int] = None

class QuestResponse(BaseModel):
    id: int
    title: str
    note: Optional[str]
    time_label: str
    pillar: str
    category: str
    difficulty: str
    xp_reward: int
    credits_reward: int
    is_completed: bool
    completed_at: Optional[datetime]
    relationship_id: Optional[int]

    class Config:
        from_attributes = True

class QuestCompleteResult(BaseModel):
    success: bool
    quest_id: int
    quest_title: str
    xp_gained: int
    credits_gained: int
    pillar: str
    leveled_up: bool
    new_level: int
    current_xp: int
    xp_for_next_level: int
    current_streak: int
    mentor_feedback: str

# Relationship Schemas
class RelationshipCreate(BaseModel):
    person_name: str
    relationship_type: Optional[str] = 'Family'
    current_friction: Optional[str] = 'Neutral'
    temperament_notes: Optional[str] = None

class RelationshipLogCreate(BaseModel):
    action_taken: str
    user_reflection: Optional[str] = None
    trust_delta: Optional[int] = 5

class RelationshipResponse(BaseModel):
    id: int
    person_name: str
    relationship_type: str
    current_friction: str
    temperament_notes: Optional[str]
    trust_meter: int
    patience_streak: int
    last_interaction_date: Optional[date]

    class Config:
        from_attributes = True

# Career & Crossroads Schemas
class CareerTrackSelect(BaseModel):
    career_track: str
    life_goal: Optional[str] = None

class CrossroadsEvaluateRequest(BaseModel):
    target_title: str
    target_type: Optional[str] = 'skill'
    reason_to_quit: str
    days_invested: Optional[int] = 14

class CrossroadsDecisionRequest(BaseModel):
    target_title: str
    target_type: Optional[str] = 'skill'
    reason_to_quit: str
    chosen_path: str # 'stayed' or 'pivoted'
    lessons_learned: Optional[str] = None

# Shop Schemas
class ShopItemCreate(BaseModel):
    name: str
    description: str
    cost_credits: int
    icon: Optional[str] = '🎁'

class ShopBuyRequest(BaseModel):
    item_key: str
