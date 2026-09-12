from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix='/api/career', tags=['Dream Career & Mastery Trees'])

CAREER_CATALOG = [
    {
        'id': 'swe',
        'title': 'Software Engineer & Builder',
        'description': 'Master full-stack architecture, clean code, and production reliability.',
        'tiers': [
            {'tier': 1, 'name': 'Foundations', 'req_craft': 50, 'desc': 'Master core data structures, HTTP APIs, and database schemas.'},
            {'tier': 2, 'name': 'Portfolio Builder', 'req_craft': 150, 'desc': 'Design and deploy 2 production-grade full-stack web applications.'},
            {'tier': 3, 'name': 'Industry Ready', 'req_craft': 300, 'desc': 'System design mastery, performance tuning, and technical interview readiness.'},
            {'tier': 4, 'name': 'The Dream Offer', 'req_craft': 500, 'desc': 'Land high-impact role with competitive compensation and work autonomy.'}
        ]
    },
    {
        'id': 'founder',
        'title': 'Entrepreneur & Startup Founder',
        'description': 'Validate genuine human problems, build profitable solutions, and create sustainable freedom.',
        'tiers': [
            {'tier': 1, 'name': 'Validation', 'req_craft': 50, 'desc': 'Interview 20 potential customers and confirm painful problem.'},
            {'tier': 2, 'name': 'MVP Launch', 'req_craft': 150, 'desc': 'Ship functional minimum viable product and acquire first 10 active users.'},
            {'tier': 3, 'name': 'Revenue Engine', 'req_craft': 300, 'desc': 'Achieve product-market fit with reliable recurring revenue.'},
            {'tier': 4, 'name': 'Sustainable Autonomy', 'req_craft': 500, 'desc': 'Scale operations and provide complete financial independence for family.'}
        ]
    }
]

@router.get('/tracks')
def get_career_tracks(current_user: models.User = Depends(get_current_user)):
    return {
        'active_track': current_user.career_track,
        'user_craft_stat': current_user.stat_craft,
        'catalog': CAREER_CATALOG
    }

@router.post('/select')
def select_career_track(
    select_in: schemas.CareerTrackSelect,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.career_track = select_in.career_track
    if select_in.life_goal:
        current_user.life_goal = select_in.life_goal
    db.commit()
    return {'success': True, 'career_track': current_user.career_track, 'life_goal': current_user.life_goal}
