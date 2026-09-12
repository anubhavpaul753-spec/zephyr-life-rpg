from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), default='Adventurer')

    # RPG Progression
    level = Column(Integer, default=1)
    current_xp = Column(Integer, default=0)
    life_credits = Column(Integer, default=20) # Currency for rewards & streak shields
    current_streak = Column(Integer, default=1)
    longest_streak = Column(Integer, default=1)
    last_active_date = Column(Date, default=date.today)

    # 6 Life Pillars (XP points)
    stat_craft = Column(Integer, default=0)        # Coding / Career / Mastery
    stat_resilience = Column(Integer, default=0)   # Physical Health & Gym
    stat_calm = Column(Integer, default=0)         # Emotional Regulation & Peace
    stat_lovedones = Column(Integer, default=0)    # Family, Partner & Empathy
    stat_discipline = Column(Integer, default=0)   # Consistency & Habits
    stat_joy = Column(Integer, default=0)          # Savoring Life & Guilt-free Play

    # Active Career & Life Goal
    career_track = Column(String(100), default='Software Engineer & Builder')
    life_goal = Column(String(255), default='Master full-stack architecture and build a peaceful life.')

    created_at = Column(DateTime, default=datetime.utcnow)
    @property
    def xp_for_next_level(self) -> int:
        import math
        if self.level <= 1:
            return 100
        return math.floor(100 * math.pow(self.level, 1.5))


    # Relationships
    quests = relationship('Quest', back_populates='user', cascade='all, delete-orphan')
    bonds = relationship('RelationshipBond', back_populates='user', cascade='all, delete-orphan')
    inventory = relationship('UserInventory', back_populates='user', cascade='all, delete-orphan')
    logs = relationship('QuestLog', back_populates='user', cascade='all, delete-orphan')
    crossroads = relationship('CrossroadsLog', back_populates='user', cascade='all, delete-orphan')

class Quest(Base):
    __tablename__ = 'quests'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    relationship_id = Column(Integer, ForeignKey('relationship_bonds.id', ondelete='SET NULL'), nullable=True)

    title = Column(String(200), nullable=False)
    note = Column(Text, nullable=True)
    time_label = Column(String(50), default='Flexible')
    pillar = Column(String(30), nullable=False) # 'Craft', 'Resilience', 'Calm', 'LovedOnes', 'Discipline', 'Joy'
    category = Column(String(30), default='routine') # 'routine', 'family', 'joy', 'micro', 'custom'
    difficulty = Column(String(20), default='medium') # 'micro', 'easy', 'medium', 'hard', 'epic'

    xp_reward = Column(Integer, default=25)
    credits_reward = Column(Integer, default=15)
    trust_boost = Column(Integer, default=0) # If linked to a bond

    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    @property
    def xp_for_next_level(self) -> int:
        import math
        if self.level <= 1:
            return 100
        return math.floor(100 * math.pow(self.level, 1.5))


    user = relationship('User', back_populates='quests')

class QuestLog(Base):
    __tablename__ = 'quest_logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    quest_id = Column(Integer, nullable=True)
    quest_title = Column(String(200), nullable=False)
    pillar = Column(String(30), nullable=False)
    xp_earned = Column(Integer, nullable=False)
    credits_earned = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='logs')

class RelationshipBond(Base):
    __tablename__ = 'relationship_bonds'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    person_name = Column(String(100), nullable=False) # e.g. 'Dad', 'Mom', 'Sarah (Partner)'
    relationship_type = Column(String(50), default='Family') # 'Parent', 'Partner', 'Sibling', 'Friend'
    current_friction = Column(String(30), default='Neutral') # 'Strained', 'Distant', 'Neutral', 'Warm'
    temperament_notes = Column(Text, nullable=True) # 'Quick to worry, needs emotional listening'

    trust_meter = Column(Integer, default=30) # 0 to 100%
    patience_streak = Column(Integer, default=1)
    last_interaction_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)
    @property
    def xp_for_next_level(self) -> int:
        import math
        if self.level <= 1:
            return 100
        return math.floor(100 * math.pow(self.level, 1.5))


    user = relationship('User', back_populates='bonds')
    logs = relationship('RelationshipLog', back_populates='bond', cascade='all, delete-orphan')

class RelationshipLog(Base):
    __tablename__ = 'relationship_logs'

    id = Column(Integer, primary_key=True, index=True)
    bond_id = Column(Integer, ForeignKey('relationship_bonds.id', ondelete='CASCADE'), nullable=False)

    action_taken = Column(String(255), nullable=False)
    user_reflection = Column(Text, nullable=True)
    trust_delta = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    @property
    def xp_for_next_level(self) -> int:
        import math
        if self.level <= 1:
            return 100
        return math.floor(100 * math.pow(self.level, 1.5))


    bond = relationship('RelationshipBond', back_populates='logs')

class ShopItem(Base):
    __tablename__ = 'shop_items'

    id = Column(Integer, primary_key=True, index=True)
    item_key = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(30), default='treat') # 'shield', 'treat', 'theme', 'badge'
    cost_credits = Column(Integer, nullable=False)
    icon = Column(String(10), default='🎁')
    is_custom = Column(Boolean, default=False)
    user_id = Column(Integer, nullable=True) # If custom treat created by user

class UserInventory(Base):
    __tablename__ = 'user_inventory'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    item_key = Column(String(50), nullable=False)
    item_name = Column(String(100), nullable=False)
    category = Column(String(30), nullable=False)
    acquired_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='inventory')

class CrossroadsLog(Base):
    __tablename__ = 'crossroads_logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    target_title = Column(String(150), nullable=False) # e.g. 'Learning Full-Stack Python'
    target_type = Column(String(50), default='skill')
    reason_to_quit = Column(Text, nullable=False)
    chosen_path = Column(String(20), nullable=False) # 'stayed' or 'pivoted'
    wisdom_xp_earned = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)
    @property
    def xp_for_next_level(self) -> int:
        import math
        if self.level <= 1:
            return 100
        return math.floor(100 * math.pow(self.level, 1.5))


    user = relationship('User', back_populates='crossroads')
