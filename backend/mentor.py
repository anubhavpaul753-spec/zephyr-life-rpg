import os
from config import GROQ_API_KEY

FALLBACK_REFLECTIONS = {
    'Craft': [
        'Deep focus compounds quietly. One difficult problem solved today saves months of confusion later.',
        'Technical competence is built line by line. Respect the discipline you put into your craft today.'
    ],
    'Resilience': [
        'Physical vitality is the foundation for everything else. You honored your body today.',
        'Heavy lifting and clean fuel clear mental fog faster than thinking ever will.'
    ],
    'Calm': [
        'Holding your peace under emotional friction is true strength. You chose calmness over reactivity.',
        'Slowing down to breathe when life feels rushed is how resilience is cultivated.'
    ],
    'LovedOnes': [
        'Listening without defending yourself isn\'t weakness; it\'s emotional maturity. That rebuilds trust.',
        'Personal leveling up means nothing if it doesn\'t bring peace to those around you. Well done.'
    ],
    'Discipline': [
        'Consistency isn\'t glamorous, but it\'s the only thing that transforms an ordinary life. Keep the streak.',
        'You showed up even when motivation was low. That is self-respect in action.'
    ],
    'Joy': [
        'Life is meant to be savored, not just grinded away. Unhurried play replenishes your inner fire.',
        'Guilt-free rest is earned. Enjoy the stillness today.'
    ],
    'LevelUp': [
        'A higher level brings quiet responsibility. Do not let ego celebrate early; respect the routine that brought you here.',
        'You climbed another step. Look back at where you started, acknowledge your effort, then reset and keep building.'
    ]
}

MENTOR_SYSTEM_PROMPT = """You are the Grounded Mentor for Project Mirror (a real-life RPG).
- Tone: Mature, firm, deeply human, stoic, compassionate.
- Never use toxic cheerleading, corporate buzzwords, emojis, or fantasy jargon (no dragons/wizards).
- If they made progress: Acknowledge effort with quiet dignity (1-2 sentences).
- If they slipped up: Firmly address the excuse without insulting.
- Maximum length: Strictly 2 sentences."""

def generate_mentor_feedback(pillar: str, is_level_up: bool = False, quest_title: str = '') -> str:
    """Generates mentor guidance using Groq LLaMA 3.3, with instant curated fallback."""
    import random

    if GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=GROQ_API_KEY)
            prompt = f'User completed task: "{quest_title}" in life pillar: "{pillar}". Level up: {is_level_up}.'
            response = client.chat.completions.create(
                model='llama-3.3-70b-versatile',
                messages=[
                    {'role': 'system', 'content': MENTOR_SYSTEM_PROMPT},
                    {'role': 'user', 'content': prompt}
                ],
                max_tokens=80,
                temperature=0.6
            )
            text = response.choices[0].message.content.strip()
            if text:
                return text
        except Exception:
            pass

    if is_level_up:
        return random.choice(FALLBACK_REFLECTIONS['LevelUp'])
    reflections = FALLBACK_REFLECTIONS.get(pillar, FALLBACK_REFLECTIONS['Discipline'])
    return random.choice(reflections)
