from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix='/api/relationships', tags=['Relationship Bonds & Loved Ones'])

@router.get('', response_model=List[schemas.RelationshipResponse])
def get_relationships(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.RelationshipBond).filter(
        models.RelationshipBond.user_id == current_user.id
    ).all()

@router.post('', response_model=schemas.RelationshipResponse)
def create_relationship(
    rel_in: schemas.RelationshipCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bond = models.RelationshipBond(
        user_id=current_user.id,
        person_name=rel_in.person_name,
        relationship_type=rel_in.relationship_type or 'Family',
        current_friction=rel_in.current_friction or 'Neutral',
        temperament_notes=rel_in.temperament_notes,
        trust_meter=30,
        patience_streak=1
    )
    db.add(bond)
    db.commit()
    db.refresh(bond)
    return bond

@router.post('/{bond_id}/log')
def log_interaction(
    bond_id: int,
    log_in: schemas.RelationshipLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bond = db.query(models.RelationshipBond).filter(
        models.RelationshipBond.id == bond_id,
        models.RelationshipBond.user_id == current_user.id
    ).first()
    if not bond:
        raise HTTPException(status_code=404, detail='Relationship bond not found')

    trust_delta = log_in.trust_delta or 5
    bond.trust_meter = min(100, max(0, bond.trust_meter + trust_delta))
    bond.patience_streak += 1
    bond.last_interaction_date = date.today()

    current_user.stat_lovedones += 20
    current_user.life_credits += 10

    log = models.RelationshipLog(
        bond_id=bond.id,
        action_taken=log_in.action_taken,
        user_reflection=log_in.user_reflection,
        trust_delta=trust_delta
    )
    db.add(log)
    db.commit()
    db.refresh(bond)

    return {
        'success': True,
        'bond_id': bond.id,
        'person_name': bond.person_name,
        'new_trust_meter': bond.trust_meter,
        'patience_streak': bond.patience_streak,
        'stat_lovedones': current_user.stat_lovedones
    }
