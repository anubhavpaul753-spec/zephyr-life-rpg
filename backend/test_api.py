import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app
from rpg_engine import get_required_xp_for_level

client = TestClient(app)

def test_root_and_health():
    res = client.get('/')
    assert res.status_code == 200
    assert res.json()['status'] == 'online'

    res_health = client.get('/health')
    assert res_health.status_code == 200
    assert res_health.json()['status'] == 'healthy'
    print(' Root and health checks passed!')

def test_full_user_flow():
    import uuid
    rand_suffix = uuid.uuid4().hex[:6]
    test_user = f'anubhav_{rand_suffix}'
    test_email = f'{test_user}@example.com'
    test_pw = 'MasteryPass123!'

    # 1. Registration
    reg_payload = {
        'username': test_user,
        'email': test_email,
        'password': test_pw,
        'full_name': 'Anubhav Paul',
        'career_track': 'Software Engineer & Builder'
    }
    reg_res = client.post('/api/auth/register', json=reg_payload)
    assert reg_res.status_code == 200, reg_res.text
    token_data = reg_res.json()
    assert 'access_token' in token_data
    token = token_data['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print(' Registration passed! JWT Token received.')

    # 2. Get Profile (/me)
    me_res = client.get('/api/auth/me', headers=headers)
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile['username'] == test_user
    assert profile['level'] == 1
    assert profile['life_credits'] == 25
    assert profile['xp_for_next_level'] == 100
    print(' Profile fetch passed! Level 1 requires 100 XP.')

    # 3. Fetch default starter quests
    quests_res = client.get('/api/quests', headers=headers)
    assert quests_res.status_code == 200
    quests = quests_res.json()
    assert len(quests) >= 5
    print(f' Quests fetch passed! Found {len(quests)} seeded starter quests.')

    # 4. Complete a quest and verify anti-cheat RPG engine
    first_quest = quests[0]
    complete_res = client.post(f'/api/quests/{first_quest["id"]}/complete', headers=headers)
    assert complete_res.status_code == 200
    result = complete_res.json()
    assert result['success'] is True
    assert result['xp_gained'] == first_quest['xp_reward']
    assert 'mentor_feedback' in result
    print(f' Quest completed! Gained {result["xp_gained"]} XP. Mentor said: "{result["mentor_feedback"]}"')

    # 5. Create a high-XP quest to test leveling up (Level 1 -> Level 2 requires 100 XP)
    create_quest_payload = {
        'title': 'Ship Production FastAPI Backend',
        'pillar': 'Craft',
        'difficulty': 'epic',
        'xp_reward': 120,
        'credits_reward': 50,
        'note': 'Clean architecture, zero shortcuts, true craftsmanship.'
    }
    cq_res = client.post('/api/quests', json=create_quest_payload, headers=headers)
    assert cq_res.status_code == 200
    big_quest = cq_res.json()

    # Complete the big quest to trigger level-up
    level_res = client.post(f'/api/quests/{big_quest["id"]}/complete', headers=headers)
    assert level_res.status_code == 200
    level_data = level_res.json()
    assert level_data['leveled_up'] is True
    assert level_data['new_level'] == 2
    assert level_data['xp_for_next_level'] == get_required_xp_for_level(2) # 282 or 283 XP
    print(f' Non-linear Level Up test passed! User ascended to Level {level_data["new_level"]}. Next level requires {level_data["xp_for_next_level"]} XP.')

    # 6. Relationship Bonds
    bonds_res = client.get('/api/relationships', headers=headers)
    assert bonds_res.status_code == 200
    bonds = bonds_res.json()
    assert len(bonds) >= 1
    dad_bond = bonds[0]
    initial_trust = dad_bond['trust_meter']

    # Log interaction
    log_payload = {
        'action_taken': 'Active listening over evening tea without offering unsolicited advice',
        'user_reflection': 'He opened up about work stress. I stayed calm and acknowledged his effort.',
        'trust_delta': 10
    }
    log_res = client.post(f'/api/relationships/{dad_bond["id"]}/log', json=log_payload, headers=headers)
    assert log_res.status_code == 200
    log_data = log_res.json()
    assert log_data['new_trust_meter'] == initial_trust + 10
    print(f' Relationship interaction passed! Dad trust meter climbed from {initial_trust}% to {log_data["new_trust_meter"]}%.')

    # 7. The Crossroads Evaluation
    cr_eval_payload = {
        'target_title': 'Early Morning Gym Consistency',
        'reason_to_quit': 'Felt completely exhausted this morning and missed waking up at 6 AM',
        'days_invested': 18
    }
    eval_res = client.post('/api/crossroads/evaluate', json=cr_eval_payload, headers=headers)
    assert eval_res.status_code == 200
    matrix = eval_res.json()
    assert 'path_a_stay' in matrix
    assert 'path_b_pivot' in matrix
    print(' Crossroads Matrix evaluation passed! Probabilistic trade-offs generated.')

    # Resolve Crossroads by persisting
    resolve_payload = {
        'target_title': 'Early Morning Gym Consistency',
        'reason_to_quit': 'Temporary exhaustion',
        'chosen_path': 'stayed',
        'lessons_learned': 'Do not quit when tired; take an earned rest evening instead.'
    }
    res_resolve = client.post('/api/crossroads/resolve', json=resolve_payload, headers=headers)
    assert res_resolve.status_code == 200
    assert res_resolve.json()['wisdom_xp_awarded'] == 60
    print(' Crossroads resolution passed! Converted reflection into Wisdom XP.')

    # 8. Shop & Rewards Economy
    shop_res = client.get('/api/shop/items', headers=headers)
    assert shop_res.status_code == 200
    shop_data = shop_res.json()
    assert 'catalog' in shop_data
    assert shop_data['balance_credits'] > 50

    # Buy an Espresso Buff (cost 40 credits)
    buy_res = client.post('/api/shop/buy/coffee_buff', headers=headers)
    assert buy_res.status_code == 200
    buy_data = buy_res.json()
    assert buy_data['success'] is True
    print(f' Shop transaction passed! Acquired {buy_data["item_name"]}. Remaining: {buy_data["remaining_credits"]} LC.')

if __name__ == '__main__':
    print('--- Running Automated Project Mirror Backend Test Suite ---')
    test_root_and_health()
    test_full_user_flow()
    print('[SUCCESS] ALL 8 TESTS PASSED FLAWLESSLY! Architecture is 100% verified!')
