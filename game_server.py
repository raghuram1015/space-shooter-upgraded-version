from flask import Flask, request, jsonify
import uuid
import time
import math
import random
import threading
import json

app = Flask(__name__)

# Enable CORS
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Store active games in memory
active_games = {}
high_scores = []

# Load high scores from file if exists
try:
    with open('high_scores.json', 'r') as f:
        high_scores = json.load(f)
except:
    # Default high scores
    high_scores = [
        {"name": "AAA", "score": 5000},
        {"name": "BBB", "score": 4000},
        {"name": "CCC", "score": 3000},
        {"name": "DDD", "score": 2000},
        {"name": "EEE", "score": 1000}
    ]

# Game cleanup thread
def cleanup_inactive_games():
    while True:
        current_time = time.time()
        to_remove = []
        
        for game_id, game in active_games.items():
            # Remove games that haven't been updated in 5 minutes
            if current_time - game['last_update'] > 300:
                to_remove.append(game_id)
        
        for game_id in to_remove:
            del active_games[game_id]
        
        time.sleep(60)  # Check every minute

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_inactive_games)
cleanup_thread.daemon = True
cleanup_thread.start()

# Game routes
@app.route('/api/game/start', methods=['POST'])
def start_game():
    """Create a new game session"""
    data = request.json or {}
    difficulty = data.get('difficulty', 'easy')
    ship_type = data.get('ship', 'blue')
    
    # Set difficulty parameters
    speed_multiplier = {
        'easy': 1.0,
        'medium': 1.2,
        'hard': 1.5
    }.get(difficulty, 1.0)
    
    # Set ship parameters
    ship_color = {
        'blue': '#88f',
        'red': '#f55',
        'green': '#5f5'
    }.get(ship_type, '#88f')
    
    # Ship special abilities
    ship_special = {
        'blue': 'shield',
        'red': 'explosion',
        'green': 'rapid_fire'
    }.get(ship_type, 'shield')
    
    game_id = str(uuid.uuid4())
    
    # Initialize game state
    active_games[game_id] = {
        'player': {
            'x': 400,  # Starting x position (middle of screen)
            'y': 550,  # Starting y position (bottom of screen)
            'width': 40,
            'height': 40,
            'speed': 5 * speed_multiplier,
            'lives': 3,
            'powerLevel': 0,
            'hasShield': False,
            'shieldDuration': 0,
            'specialCooldown': 0,
            'specialDuration': 0,
            'color': ship_color,
            'special': ship_special
        },
        'enemies': [],
        'projectiles': [],
        'powerUps': [],
        'particles': [],
        'bosses': [],
        'score': 0,
        'level': 1,
        'difficulty': difficulty,
        'last_enemy_spawn': time.time(),
        'last_powerup_spawn': time.time(),
        'last_update': time.time(),
        'game_over': False
    }
    
    return jsonify({
        'game_id': game_id,
        'status': 'started',
        'difficulty': difficulty,
        'ship': ship_type
    })

@app.route('/api/game/<game_id>/update', methods=['POST'])
def update_game(game_id):
    """Update game state based on player input"""
    if game_id not in active_games:
        return jsonify({'error': 'Game not found'}), 404
    
    data = request.json or {}
    input_data = data.get('input', {})
    delta_time = data.get('deltaTime', 16)  # Default to 16ms if not provided
    
    keys = input_data.get('keys', {})
    is_shooting = input_data.get('isShooting', False)
    is_using_special = input_data.get('isUsingSpecial', False)
    
    game = active_games[game_id]
    
    if game['game_over']:
        return jsonify({
            'status': 'game_over',
            'score': game['score']
        })
    
    # Calculate time delta
    current_time = time.time()
    game['last_update'] = current_time
    
    # Update player position based on keys (Arrow keys and WASD)
    player = game['player']
    if (keys.get('ArrowLeft') or keys.get('a') or keys.get('A')) and player['x'] > 0:
        player['x'] -= player['speed'] * (delta_time / 16)
    if (keys.get('ArrowRight') or keys.get('d') or keys.get('D')) and player['x'] < 800 - player['width']:
        player['x'] += player['speed'] * (delta_time / 16)
    if (keys.get('ArrowUp') or keys.get('w') or keys.get('W')) and player['y'] > 0:
        player['y'] -= player['speed'] * (delta_time / 16)
    if (keys.get('ArrowDown') or keys.get('s') or keys.get('S')) and player['y'] < 600 - player['height']:
        player['y'] += player['speed'] * (delta_time / 16)
    
    # Handle player shooting
    if is_shooting:
        # Add cooldown logic
        if not player.get('last_shot') or current_time - player.get('last_shot', 0) > 0.3:
            # Create main projectile
            new_projectile = {
                'x': player['x'] + player['width'] / 2 - 2,
                'y': player['y'] - 10,
                'width': 4,
                'height': 15,
                'speed': 10,
                'isPlayerProjectile': True,
                'damage': 1 + player['powerLevel'] // 3
            }
            game['projectiles'].append(new_projectile)
            
            # Add side projectiles if power level is high enough
            if player['powerLevel'] >= 2:
                game['projectiles'].append({
                    'x': player['x'] + 5,
                    'y': player['y'],
                    'width': 3,
                    'height': 10,
                    'speed': 9,
                    'isPlayerProjectile': True,
                    'damage': 1
                })
                
                game['projectiles'].append({
                    'x': player['x'] + player['width'] - 8,
                    'y': player['y'],
                    'width': 3,
                    'height': 10,
                    'speed': 9,
                    'isPlayerProjectile': True,
                    'damage': 1
                })
            
            player['last_shot'] = current_time
    
    # Handle special ability
    if is_using_special and player['powerLevel'] >= 5 and player.get('specialCooldown', 0) <= 0:
        # Activate special ability based on ship type
        if player['special'] == 'shield':
            # Shield
            player['hasShield'] = True
            player['shieldDuration'] = 5000
        elif player['special'] == 'explosion':
            # Screen clearing explosion
            for enemy in game['enemies']:
                create_explosion(game, enemy['x'] + enemy['width'] / 2, enemy['y'] + enemy['height'] / 2)
                game['score'] += enemy.get('points', 10)
            game['enemies'] = []
        elif player['special'] == 'rapid_fire':
            # Rapid fire mode
            player['specialDuration'] = 3000
        
        # Reset power level and set cooldown
        player['powerLevel'] = 0
        player['specialCooldown'] = 10000
    
    # Update special ability timers
    if player.get('specialCooldown', 0) > 0:
        player['specialCooldown'] -= delta_time
    
    if player.get('specialDuration', 0) > 0:
        player['specialDuration'] -= delta_time
        
        # Special effects for duration-based abilities
        if player['special'] == 'rapid_fire' and player['specialDuration'] > 0:
            # Rapid fire for green ship
            if is_shooting:
                if not player.get('lastSpecialShot') or current_time - player.get('lastSpecialShot', 0) > 0.1:
                    for i in range(3):
                        game['projectiles'].append({
                            'x': player['x'] + player['width'] / 2 - 2 + (i - 1) * 10,
                            'y': player['y'] - 5,
                            'width': 3,
                            'height': 10,
                            'speed': 12,
                            'isPlayerProjectile': True,
                            'damage': 1
                        })
                    player['lastSpecialShot'] = current_time
    
    # Update shield duration
    if player.get('hasShield', False):
        player['shieldDuration'] -= delta_time
        if player['shieldDuration'] <= 0:
            player['hasShield'] = False
    
    # Spawn enemies
    difficulty_multiplier = {
        'easy': 1.0,
        'medium': 1.3,
        'hard': 1.6
    }.get(game['difficulty'], 1.0)
    
    enemy_spawn_rate = (0.02 + (game['level'] * 0.005)) * difficulty_multiplier
    adjusted_spawn_rate = enemy_spawn_rate * (delta_time / 16)
    
    if random.random() < adjusted_spawn_rate:
        new_enemy = {
            'x': random.uniform(0, 760),  # Random x position
            'y': -40,  # Start above the screen
            'width': 40,
            'height': 40,
            'speed': (2 + game['level'] * 0.5) * difficulty_multiplier,
            'points': 10 * game['level'],
            'health': 1 + game['level'] // 3,
            'color': f"hsl({random.uniform(0, 360)}, 70%, 50%)"
        }
        game['enemies'].append(new_enemy)
        
        # Random enemy shooting
        if random.random() > 0.7:
            enemy_projectile = {
                'x': new_enemy['x'] + new_enemy['width'] / 2 - 2,
                'y': new_enemy['y'] + new_enemy['height'],
                'width': 4,
                'height': 15,
                'speed': 5 * difficulty_multiplier,
                'isPlayerProjectile': False
            }
            game['projectiles'].append(enemy_projectile)
    
    # Spawn boss every 5 levels
    if game['level'] % 5 == 0 and len(game['bosses']) == 0 and random.random() < 0.005:
        boss_level = game['level'] // 5
        game['bosses'].append({
            'x': 400 - 75,  # Center of screen
            'y': -100,
            'width': 150,
            'height': 100,
            'speed': 1 * difficulty_multiplier,
            'health': 20 * boss_level,
            'maxHealth': 20 * boss_level,
            'points': 500 * boss_level,
            'shootTimer': 0,
            'moveDirection': 1
        })
    
    # Spawn power-ups
    powerup_spawn_rate = 0.001 * (delta_time / 16)
    if random.random() < powerup_spawn_rate:
        game['powerUps'].append({
            'x': random.uniform(0, 780),
            'y': -20,
            'width': 20,
            'height': 20,
            'speed': 2,
            'type': 'power' if random.random() < 0.7 else 'life'
        })
    
    # Update projectiles
    for projectile in list(game['projectiles']):
        if projectile['isPlayerProjectile']:
            projectile['y'] -= projectile['speed'] * (delta_time / 16)
            # Remove if off screen
            if projectile['y'] < -projectile['height']:
                game['projectiles'].remove(projectile)
        else:
            projectile['y'] += projectile['speed'] * (delta_time / 16)
            # Remove if off screen
            if projectile['y'] > 600:
                game['projectiles'].remove(projectile)
    
    # Update enemies
    for enemy in list(game['enemies']):
        enemy['y'] += enemy['speed'] * (delta_time / 16)
        
        # Random movement for some enemies
        if random.random() < 0.01:
            enemy['x'] += (random.random() - 0.5) * 5
        
        # Keep enemies within bounds
        if enemy['x'] < 0:
            enemy['x'] = 0
        if enemy['x'] > 800 - enemy['width']:
            enemy['x'] = 800 - enemy['width']
        
        # Remove if off screen
        if enemy['y'] > 600:
            game['enemies'].remove(enemy)
    
    # Update bosses
    for boss in list(game['bosses']):
        # Move boss down until it reaches a certain position
        if boss['y'] < 50:
            boss['y'] += boss['speed'] * (delta_time / 16)
        else:
            # Side-to-side movement
            boss['x'] += boss['speed'] * boss['moveDirection'] * (delta_time / 16)
            
            # Change direction at edges
            if boss['x'] <= 0:
                boss['moveDirection'] = 1
            elif boss['x'] + boss['width'] >= 800:
                boss['moveDirection'] = -1
            
            # Boss shooting
            boss['shootTimer'] = boss.get('shootTimer', 0) + delta_time
            if boss['shootTimer'] > 1000:
                # Pattern shooting
                for j in range(5):
                    game['projectiles'].append({
                        'x': boss['x'] + (boss['width'] / 5) * j + 10,
                        'y': boss['y'] + boss['height'],
                        'width': 6,
                        'height': 15,
                        'speed': 4 * difficulty_multiplier,
                        'isPlayerProjectile': False
                    })
                boss['shootTimer'] = 0
    
    # Update power-ups
    for powerup in list(game['powerUps']):
        powerup['y'] += powerup['speed'] * (delta_time / 16)
        
        if powerup['y'] > 600:
            game['powerUps'].remove(powerup)
    
    # Update particles
    for particle in list(game['particles']):
        particle['x'] += particle['vx'] * (delta_time / 16)
        particle['y'] += particle['vy'] * (delta_time / 16)
        particle['life'] -= delta_time
        
        if particle['life'] <= 0:
            game['particles'].remove(particle)
    
    # Check collisions
    check_collisions(game)
    
    # Check for level up
    if game['score'] // 500 > game['level'] - 1:
        game['level'] = game['score'] // 500 + 1
    
    # Return updated game state
    return jsonify({
        'player': game['player'],
        'enemies': game['enemies'],
        'projectiles': game['projectiles'],
        'powerUps': game['powerUps'],
        'particles': game['particles'],
        'bosses': game['bosses'],
        'score': game['score'],
        'level': game['level'],
        'game_over': game['game_over']
    })

def check_collisions(game):
    """Check for collisions between game objects"""
    player = game['player']
    
    # Player projectiles hitting enemies
    for projectile in list(game['projectiles']):
        if projectile.get('isPlayerProjectile', False):
            # Check collision with regular enemies
            for enemy in list(game['enemies']):
                # Check collision
                if (projectile['x'] < enemy['x'] + enemy['width'] and
                    projectile['x'] + projectile['width'] > enemy['x'] and
                    projectile['y'] < enemy['y'] + enemy['height'] and
                    projectile['y'] + projectile['height'] > enemy['y']):
                    
                    # Remove projectile
                    if projectile in game['projectiles']:
                        game['projectiles'].remove(projectile)
                    
                    # Reduce enemy health
                    enemy['health'] = enemy.get('health', 1) - (projectile.get('damage', 1))
                    
                    if enemy['health'] <= 0:
                        # Enemy destroyed
                        if enemy in game['enemies']:
                            game['enemies'].remove(enemy)
                        
                        # Add score
                        game['score'] += enemy.get('points', 10)
                        
                        # Create explosion
                        create_explosion(game, enemy['x'] + enemy['width'] / 2, enemy['y'] + enemy['height'] / 2)
                        
                        # Random power-up drop
                        if random.random() < 0.1:
                            game['powerUps'].append({
                                'x': enemy['x'] + enemy['width'] / 2 - 10,
                                'y': enemy['y'],
                                'width': 20,
                                'height': 20,
                                'speed': 2,
                                'type': 'power' if random.random() < 0.7 else 'life'
                            })
                    break
            
            # Check collision with bosses
            for boss in list(game['bosses']):
                if (projectile['x'] < boss['x'] + boss['width'] and
                    projectile['x'] + projectile['width'] > boss['x'] and
                    projectile['y'] < boss['y'] + boss['height'] and
                    projectile['y'] + projectile['height'] > boss['y']):
                    
                    # Remove projectile
                    if projectile in game['projectiles']:
                        game['projectiles'].remove(projectile)
                    
                    # Reduce boss health
                    boss['health'] -= projectile.get('damage', 1)
                    
                    # Create hit effect
                    for _ in range(5):
                        game['particles'].append({
                            'x': projectile['x'],
                            'y': projectile['y'],
                            'vx': (random.random() - 0.5) * 3,
                            'vy': (random.random() - 0.5) * 3,
                            'radius': random.random() * 3 + 1,
                            'color': '#ff0',
                            'life': 300
                        })
                    
                    if boss['health'] <= 0:
                        # Boss destroyed
                        if boss in game['bosses']:
                            game['bosses'].remove(boss)
                        
                        # Add score
                        game['score'] += boss.get('points', 500)
                        
                        # Big explosion for boss
                        for _ in range(30):
                            create_explosion(
                                game,
                                boss['x'] + random.random() * boss['width'],
                                boss['y'] + random.random() * boss['height']
                            )
                        
                        # Drop power-ups
                        for _ in range(3):
                            game['powerUps'].append({
                                'x': boss['x'] + random.random() * boss['width'],
                                'y': boss['y'] + random.random() * boss['height'],
                                'width': 20,
                                'height': 20,
                                'speed': 2,
                                'type': 'power' if random.random() < 0.7 else 'life'
                            })
                    break
        else:
            # Enemy projectiles hitting player
            if not player.get('hasShield', False) and not game['game_over']:
                if (projectile['x'] < player['x'] + player['width'] and
                    projectile['x'] + projectile['width'] > player['x'] and
                    projectile['y'] < player['y'] + player['height'] and
                    projectile['y'] + projectile['height'] > player['y']):
                    
                    # Remove projectile
                    if projectile in game['projectiles']:
                        game['projectiles'].remove(projectile)
                    
                    # Reduce player lives
                    player['lives'] -= 1
                    
                    # Create hit effect
                    create_explosion(game, player['x'] + player['width'] / 2, player['y'] + player['height'] / 2)
                    
                    # Check game over
                    if player['lives'] <= 0:
                        game['game_over'] = True
    
    # Enemies hitting player
    if not player.get('hasShield', False) and not game['game_over']:
        for enemy in list(game['enemies']):
            if (enemy['x'] < player['x'] + player['width'] and
                enemy['x'] + enemy['width'] > player['x'] and
                enemy['y'] < player['y'] + player['height'] and
                enemy['y'] + enemy['height'] > player['y']):
                
                # Remove enemy
                if enemy in game['enemies']:
                    game['enemies'].remove(enemy)
                
                # Reduce player lives
                player['lives'] -= 1
                
                # Create explosion
                create_explosion(game, enemy['x'] + enemy['width'] / 2, enemy['y'] + enemy['height'] / 2)
                
                # Check game over
                if player['lives'] <= 0:
                    game['game_over'] = True
    
    # Player collecting power-ups
    for powerup in list(game['powerUps']):
        if (powerup['x'] < player['x'] + player['width'] and
            powerup['x'] + powerup['width'] > player['x'] and
            powerup['y'] < player['y'] + player['height'] and
            powerup['y'] + powerup['height'] > player['y']):
            
            # Apply power-up effect
            if powerup['type'] == 'power':
                player['powerLevel'] = min(10, player['powerLevel'] + 1)
            elif powerup['type'] == 'life':
                player['lives'] = min(5, player['lives'] + 1)
            
            # Remove power-up
            if powerup in game['powerUps']:
                game['powerUps'].remove(powerup)
            
            # Create collection effect
            for _ in range(10):
                game['particles'].append({
                    'x': powerup['x'] + powerup['width'] / 2,
                    'y': powerup['y'] + powerup['height'] / 2,
                    'vx': (random.random() - 0.5) * 4,
                    'vy': (random.random() - 0.5) * 4,
                    'radius': random.random() * 3 + 1,
                    'color': '#5f5' if powerup['type'] == 'power' else '#f55',
                    'life': 500
                })

def create_explosion(game, x, y):
    """Create explosion particles at the given position"""
    for _ in range(15):
        game['particles'].append({
            'x': x,
            'y': y,
            'vx': (random.random() - 0.5) * 5,
            'vy': (random.random() - 0.5) * 5,
            'radius': random.random() * 4 + 2,
            'color': f"hsl({random.uniform(0, 60)}, 100%, 50%)",
            'life': 500
        })

@app.route('/api/game/<game_id>/end', methods=['POST'])
def end_game(game_id):
    """End the game and return final score"""
    if game_id not in active_games:
        return jsonify({'error': 'Game not found'}), 404
    
    data = request.json or {}
    final_score = data.get('score', active_games[game_id]['score'])
    
    # Check for high score
    if len(high_scores) < 10 or final_score > min(score['score'] for score in high_scores):
        # This is potentially a high score
        return jsonify({
            'status': 'high_score',
            'score': final_score
        })
    
    # Clean up game data
    del active_games[game_id]
    
    return jsonify({
        'status': 'game_ended',
        'score': final_score
    })

@app.route('/api/high-scores', methods=['GET'])
def get_high_scores():
    """Get the list of high scores"""
    return jsonify(high_scores)

@app.route('/api/high-scores', methods=['POST'])
def save_high_score():
    """Save a new high score"""
    data = request.json
    
    if not data or 'name' not in data or 'score' not in data:
        return jsonify({'error': 'Invalid data'}), 400
    
    name = data['name'][:10]  # Limit name to 10 characters
    score = int(data['score'])
    
    high_scores.append({
        'name': name,
        'score': score
    })
    
    # Sort and limit to top 10
    high_scores.sort(key=lambda x: x['score'], reverse=True)
    if len(high_scores) > 10:
        high_scores.pop()
    
    # Save to file
    try:
        with open('high_scores.json', 'w') as f:
            json.dump(high_scores, f)
    except:
        pass
    
    return jsonify({
        'status': 'success',
        'high_scores': high_scores
    })

# Additional helper functions
def create_stars(count=100):
    """Create a list of stars for the background"""
    stars = []
    for _ in range(count):
        stars.append({
            'x': random.uniform(0, 800),
            'y': random.uniform(0, 600),
            'radius': random.uniform(0.5, 1.5),
            'opacity': random.uniform(0.2, 0.8),
            'speed': random.uniform(0.1, 0.5)
        })
    return stars

# Run the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)