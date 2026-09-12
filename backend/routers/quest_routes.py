from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from database import get_db
import models
import schemas
from auth import get_current_user
from rpg_engine import process_quest_completion
from mentor import generate_mentor_feedback

router = APIRouter(prefix='/api/quests', tags=['Quests & Tasks'])

@router.get('', response_model=List[schemas.QuestResponse])
def get_quests(
    pillar: Optional[str] = None,
    completed: Optional[bool] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Quest).filter(models.Quest.user_id == current_user.id)
    if pillar:
        query = query.filter(models.Quest.pillar == pillar)
    if completed is not None:
        query = query.filter(models.Quest.is_completed == completed)
    return query.order_by(models.Quest.id.asc()).all()

@router.post('', response_model=schemas.QuestResponse)
def create_quest(
    quest_in: schemas.QuestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    valid_pillars = {'Craft', 'Resilience', 'Calm', 'LovedOnes', 'Discipline', 'Joy'}
    pillar = quest_in.pillar if quest_in.pillar in valid_pillars else 'Discipline'

    quest = models.Quest(
        user_id=current_user.id,
        title=quest_in.title,
        note=quest_in.note,
        time_label=quest_in.time_label or 'Flexible',
        pillar=pillar,
        category=quest_in.category or 'routine',
        difficulty=quest_in.difficulty or 'medium',
        xp_reward=quest_in.xp_reward or 25,
        credits_reward=quest_in.credits_reward or 15,
        relationship_id=quest_in.relationship_id,
        is_completed=False
    )
    db.add(quest)
    db.commit()
    db.refresh(quest)
    return quest

@router.delete('/{quest_id}')
def delete_quest(
    quest_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quest = db.query(models.Quest).filter(
        models.Quest.id == quest_id,
        models.Quest.user_id == current_user.id
    ).first()
    if not quest:
        raise HTTPException(status_code=404, detail='Quest not found')
    db.delete(quest)
    db.commit()
    return {'success': True, 'message': 'Quest deleted'}

@router.post('/{quest_id}/complete', response_model=schemas.QuestCompleteResult)
def complete_quest(
    quest_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quest = db.query(models.Quest).filter(
        models.Quest.id == quest_id,
        models.Quest.user_id == current_user.id
    ).first()
    if not quest:
        raise HTTPException(status_code=404, detail='Quest not found')
    if quest.is_completed:
        raise HTTPException(status_code=400, detail='Quest already completed today')

    progression = process_quest_completion(current_user, quest)

    quest.is_completed = True
    quest.completed_at = datetime.utcnow()

    quest_log = models.QuestLog(
        user_id=current_user.id,
        quest_id=quest.id,
        quest_title=quest.title,
        pillar=quest.pillar,
        xp_earned=progression['xp_gained'],
        credits_earned=progression['credits_gained']
    )
    db.add(quest_log)

    if quest.relationship_id:
        bond = db.query(models.RelationshipBond).filter(
            models.RelationshipBond.id == quest.relationship_id,
            models.RelationshipBond.user_id == current_user.id
        ).first()
        if bond:
            bond.trust_meter = min(100, bond.trust_meter + 5)
            bond.patience_streak += 1

    db.commit()
    db.refresh(current_user)

    mentor_msg = generate_mentor_feedback(
        pillar=quest.pillar,
        is_level_up=progression['leveled_up'],
        quest_title=quest.title
    )

    return {
        'success': True,
        'quest_id': quest.id,
        'quest_title': quest.title,
        'xp_gained': progression['xp_gained'],
        'credits_gained': progression['credits_gained'],
        'pillar': progression['pillar'],
        'leveled_up': progression['leveled_up'],
        'new_level': progression['new_level'],
        'current_xp': progression['current_xp'],
        'xp_for_next_level': progression['xp_for_next_level'],
        'current_streak': progression['current_streak'],
        'mentor_feedback': mentor_msg
    }

@router.post('/reset-routine')
def reset_routine(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.Quest).filter(models.Quest.user_id == current_user.id).update({'is_completed': False, 'completed_at': None})
    db.commit()
    return {'success': True, 'message': 'Daily routine reset for today.'}
