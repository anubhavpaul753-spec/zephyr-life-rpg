from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix='/api/crossroads', tags=['The Crossroads Decision Matrix'])

@router.post('/evaluate')
def evaluate_crossroads(
    req: schemas.CrossroadsEvaluateRequest,
    current_user: models.User = Depends(get_current_user)
):
    days = req.days_invested or 14
    return {
        'target_title': req.target_title,
        'reason': req.reason_to_quit,
        'days_invested': days,
        'pause_message': 'Do not quit on an emotionally exhausted day. Take an earned rest day first to verify if this is burnout or a genuine values shift.',
        'path_a_stay': {
            'label': 'Stay the Course & Endure',
            'success_probability': '65% to 80% likelihood of breakthrough with 4-6 more weeks of consistency',
            'cost': 'Requires sustained mental energy and moving past temporary plateaus',
            'reality_check': 'Plateaus are where genuine mastery separates itself from novice novelty.'
        },
        'path_b_pivot': {
            'label': 'Gracefully Pivot / Walk Away',
            'success_probability': 'Frees 6-10 hours/week for aligned pursuits',
            'cost': 'Acknowledges sunk time and starts learning curve anew elsewhere',
            'reality_check': 'Pivoting from a dead-end pursuit is mature self-awareness, not failure.'
        }
    }

@router.post('/resolve')
def resolve_crossroads(
    req: schemas.CrossroadsDecisionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wisdom_xp = 60
    current_user.current_xp += wisdom_xp
    current_user.stat_calm += 20

    log = models.CrossroadsLog(
        user_id=current_user.id,
        target_title=req.target_title,
        target_type=req.target_type or 'skill',
        reason_to_quit=req.reason_to_quit,
        chosen_path=req.chosen_path,
        wisdom_xp_earned=wisdom_xp
    )
    db.add(log)
    db.commit()

    return {
        'success': True,
        'chosen_path': req.chosen_path,
        'wisdom_xp_awarded': wisdom_xp,
        'message': 'Decision recorded with zero shame. Your past effort has been converted into permanent Wisdom & Self-Awareness XP.'
    }
