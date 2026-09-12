import math
from datetime import date, timedelta
import models

def get_required_xp_for_level(level: int) -> int:
    """Non-linear RPG formula: 100 * (level ^ 1.5)"""
    if level <= 1:
        return 100
    return math.floor(100 * math.pow(level, 1.5))

def process_quest_completion(user: models.User, quest: models.Quest) -> dict:
    """Calculates level-up, pillar XP, streaks, and returns progression delta."""
    xp_gain = quest.xp_reward
    credits_gain = quest.credits_reward
    pillar = quest.pillar

    # 1. Update Pillar specific stat
    if pillar == 'Craft':
        user.stat_craft += xp_gain
    elif pillar == 'Resilience':
        user.stat_resilience += xp_gain
    elif pillar == 'Calm':
        user.stat_calm += xp_gain
    elif pillar == 'LovedOnes':
        user.stat_lovedones += xp_gain
    elif pillar == 'Discipline':
        user.stat_discipline += xp_gain
    elif pillar == 'Joy':
        user.stat_joy += xp_gain

    # 2. Add Life Credits
    user.life_credits += credits_gain

    # 3. Update Streaks (Consecutive active days)
    today = date.today()
    if user.last_active_date:
        if user.last_active_date == today:
            pass # Already counted for today
        elif user.last_active_date == today - timedelta(days=1):
            user.current_streak += 1
            if user.current_streak > user.longest_streak:
                user.longest_streak = user.current_streak
        else:
            # Streak broken! Reset to 1
            user.current_streak = 1
    else:
        user.current_streak = 1

    user.last_active_date = today

    # 4. Non-Linear Level Progression
    user.current_xp += xp_gain
    leveled_up = False
    new_level = user.level

    while True:
        req_xp = get_required_xp_for_level(user.level)
        if user.current_xp >= req_xp:
            user.level += 1
            user.current_xp -= req_xp
            leveled_up = True
            new_level = user.level
            # Level-up bonus credits
            user.life_credits += 25
        else:
            break

    return {
        'xp_gained': xp_gain,
        'credits_gained': credits_gain,
        'pillar': pillar,
        'leveled_up': leveled_up,
        'new_level': new_level,
        'current_xp': user.current_xp,
        'xp_for_next_level': get_required_xp_for_level(user.level),
        'current_streak': user.current_streak
    }

def calculate_trajectory(user: models.User, average_daily_xp: int = 50) -> dict:
    """Calculates a realistic 30-day and 90-day future self projection."""
    current_level = user.level
    projected_xp_30 = user.current_xp + (average_daily_xp * 30)
    projected_level_30 = current_level

    temp_xp = projected_xp_30
    while True:
        req = get_required_xp_for_level(projected_level_30)
        if temp_xp >= req:
            projected_level_30 += 1
            temp_xp -= req
        else:
            break

    projected_xp_90 = user.current_xp + (average_daily_xp * 90)
    projected_level_90 = current_level
    temp_xp_90 = projected_xp_90
    while True:
        req = get_required_xp_for_level(projected_level_90)
        if temp_xp_90 >= req:
            projected_level_90 += 1
            temp_xp_90 -= req
        else:
            break

    return {
        'current_level': current_level,
        'projected_level_30_days': projected_level_30,
        'projected_level_90_days': projected_level_90,
        'consistency_message': f'At {average_daily_xp} XP/day consistency, you will climb from Level {current_level} to Level {projected_level_90} in 90 days.'
    }
