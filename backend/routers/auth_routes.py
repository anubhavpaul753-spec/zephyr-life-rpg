from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
import models
import schemas
from auth import hash_password, verify_password, create_access_token, get_current_user
from rpg_engine import get_required_xp_for_level

router = APIRouter(prefix='/api/auth', tags=['Authentication'])

DEFAULT_STARTER_QUESTS = [
    {'title': 'Morning Hydration & Sunlight', 'time_label': '07:15 AM', 'pillar': 'Resilience', 'difficulty': 'easy', 'xp_reward': 15, 'credits_reward': 10, 'note': 'Drink a glass of cold water and let morning sunlight in.'},
    {'title': 'Focused Deep Work Block', 'time_label': '09:00 AM', 'pillar': 'Craft', 'difficulty': 'hard', 'xp_reward': 45, 'credits_reward': 30, 'note': 'High-cognitive work on your primary technical project.'},
    {'title': 'Daily Movement / Resistance Training', 'time_label': '05:00 PM', 'pillar': 'Resilience', 'difficulty': 'medium', 'xp_reward': 35, 'credits_reward': 20, 'note': 'Gym session or functional bodyweight movement.'},
    {'title': 'Connection Check-in with Loved One', 'time_label': '07:30 PM', 'pillar': 'LovedOnes', 'difficulty': 'easy', 'xp_reward': 20, 'credits_reward': 15, 'note': 'Active listening without defensiveness or unsolicited advice.'},
    {'title': 'Evening Wind Down & Sleep by 11 PM', 'time_label': '10:30 PM', 'pillar': 'Discipline', 'difficulty': 'medium', 'xp_reward': 25, 'credits_reward': 15, 'note': 'Disconnect screens and prepare for restorative recovery.'}
]

@router.post('/register', response_model=schemas.Token)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        (models.User.username == user_in.username) | (models.User.email == user_in.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Username or Email already registered'
        )

    hashed_pw = hash_password(user_in.password)
    new_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name or user_in.username,
        career_track=user_in.career_track or 'Software Engineer & Builder',
        life_goal=user_in.life_goal or 'Master technical mastery and cultivate grounded presence.',
        level=1,
        current_xp=0,
        life_credits=25,
        current_streak=1,
        longest_streak=1,
        last_active_date=date.today()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Seed baseline starter quests for this user
    for q_data in DEFAULT_STARTER_QUESTS:
        quest = models.Quest(
            user_id=new_user.id,
            title=q_data['title'],
            time_label=q_data['time_label'],
            pillar=q_data['pillar'],
            difficulty=q_data['difficulty'],
            xp_reward=q_data['xp_reward'],
            credits_reward=q_data['credits_reward'],
            note=q_data['note'],
            is_completed=False
        )
        db.add(quest)

    # Seed initial family bond (Dad or Mom)
    initial_bond = models.RelationshipBond(
        user_id=new_user.id,
        person_name='Dad',
        relationship_type='Parent',
        current_friction='Neutral',
        temperament_notes='Appreciates calm listening and steady follow-through.',
        trust_meter=35,
        patience_streak=1
    )
    db.add(initial_bond)
    db.commit()

    token = create_access_token({'sub': str(new_user.id)})
    user_dict = {
        'id': new_user.id,
        'username': new_user.username,
        'email': new_user.email,
        'full_name': new_user.full_name,
        'level': new_user.level,
        'current_xp': new_user.current_xp,
        'life_credits': new_user.life_credits,
        'current_streak': new_user.current_streak,
        'career_track': new_user.career_track
    }
    return {'access_token': token, 'token_type': 'bearer', 'user': user_dict}

@router.post('/login', response_model=schemas.Token)
def login(login_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        (models.User.username == login_in.username) | (models.User.email == login_in.username)
    ).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid username or password'
        )

    token = create_access_token({'sub': str(user.id)})
    user_dict = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'level': user.level,
        'current_xp': user.current_xp,
        'life_credits': user.life_credits,
        'current_streak': user.current_streak,
        'career_track': user.career_track
    }
    return {'access_token': token, 'token_type': 'bearer', 'user': user_dict}

@router.get('/me', response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
