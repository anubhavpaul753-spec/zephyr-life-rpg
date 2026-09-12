from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix='/api/shop', tags=['Rewards & Dopamine Economy'])

DEFAULT_SHOP_ITEMS = [
    {'item_key': 'shield_freeze', 'name': 'Streak Freeze Shield', 'description': 'Protects consecutive streak when sick, traveling, or needing an earned rest day.', 'category': 'shield', 'cost_credits': 100, 'icon': '🛡️'},
    {'item_key': 'coffee_buff', 'name': 'Artisan Espresso Boost', 'description': 'High-energy focus buff for deep work mornings.', 'category': 'treat', 'cost_credits': 40, 'icon': '☕'},
    {'item_key': 'game_pass', 'name': 'Guilt-Free Gaming Pass (2 Hours)', 'description': 'Earned leisure time completely free of productivity guilt.', 'category': 'treat', 'cost_credits': 150, 'icon': '🎮'},
    {'item_key': 'cheat_meal', 'name': 'Weekend Feast / Pizza Treat', 'description': 'Earned culinary celebration after hitting weekly consistency.', 'category': 'treat', 'cost_credits': 400, 'icon': '🍕'}
]

@router.get('/items')
def get_shop_items(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    custom_items = db.query(models.ShopItem).filter(models.ShopItem.user_id == current_user.id).all()
    inventory = db.query(models.UserInventory).filter(models.UserInventory.user_id == current_user.id).all()
    return {
        'balance_credits': current_user.life_credits,
        'catalog': DEFAULT_SHOP_ITEMS,
        'custom_items': [
            {'id': i.id, 'item_key': i.item_key, 'name': i.name, 'description': i.description, 'cost_credits': i.cost_credits, 'icon': i.icon}
            for i in custom_items
        ],
        'inventory': [
            {'id': inv.id, 'item_key': inv.item_key, 'item_name': inv.item_name, 'category': inv.category, 'acquired_at': inv.acquired_at}
            for inv in inventory
        ]
    }

@router.post('/custom-treat')
def create_custom_treat(
    treat_in: schemas.ShopItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import uuid
    key = f"custom_{uuid.uuid4().hex[:8]}"
    item = models.ShopItem(
        item_key=key,
        name=treat_in.name,
        description=treat_in.description,
        cost_credits=treat_in.cost_credits,
        icon=treat_in.icon or '🎁',
        is_custom=True,
        user_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.post('/buy/{item_key}')
def buy_item(
    item_key: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    default_match = next((x for x in DEFAULT_SHOP_ITEMS if x['item_key'] == item_key), None)
    if default_match:
        item_name = default_match['name']
        category = default_match['category']
        cost = default_match['cost_credits']
    else:
        custom_item = db.query(models.ShopItem).filter(
            models.ShopItem.item_key == item_key,
            models.ShopItem.user_id == current_user.id
        ).first()
        if not custom_item:
            raise HTTPException(status_code=404, detail='Item not found in shop catalog')
        item_name = custom_item.name
        category = custom_item.category
        cost = custom_item.cost_credits

    if current_user.life_credits < cost:
        raise HTTPException(
            status_code=400,
            detail=f'Insufficient Life Credits. You have {current_user.life_credits} LC, but item costs {cost} LC.'
        )

    current_user.life_credits -= cost
    inv = models.UserInventory(
        user_id=current_user.id,
        item_key=item_key,
        item_name=item_name,
        category=category
    )
    db.add(inv)
    db.commit()

    return {
        'success': True,
        'item_name': item_name,
        'cost_credits': cost,
        'remaining_credits': current_user.life_credits,
        'message': f'Successfully acquired {item_name}! Enjoy your earned reward.'
    }
