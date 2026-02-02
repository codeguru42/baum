# Generated manually for renaming player1/player2 to player_black/player_white

from django.db import migrations, models
import django.db.models.deletion


def convert_winner_values(apps, schema_editor):
    """Convert winner from 'player1'/'player2' to 'black'/'white' based on colors."""
    Game = apps.get_model('tournament', 'Game')
    for game in Game.objects.all():
        # If player1 was black, then player1 winner -> black winner
        # If player1 was white, then player1 winner -> white winner
        if game.winner == 'player1':
            game.winner = game.player1_color
        elif game.winner == 'player2':
            game.winner = game.player2_color
        game.save()


def reverse_winner_values(apps, schema_editor):
    """Reverse the winner conversion - convert 'black'/'white' back to 'player1'/'player2'."""
    Game = apps.get_model('tournament', 'Game')
    for game in Game.objects.all():
        # Cannot accurately reverse without color fields, so set to 'player1' as default
        if game.winner in ['black', 'white']:
            game.winner = 'player1'  # Default fallback
        game.save()


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0002_game_valid_for_prizes'),
    ]

    operations = [
        # Rename player1 to player_black
        migrations.RenameField(
            model_name='game',
            old_name='player1',
            new_name='player_black',
        ),
        # Rename player2 to player_white
        migrations.RenameField(
            model_name='game',
            old_name='player2',
            new_name='player_white',
        ),
        # Convert winner values BEFORE removing color fields
        migrations.RunPython(convert_winner_values, reverse_winner_values),
        # Remove player1_color field
        migrations.RemoveField(
            model_name='game',
            name='player1_color',
        ),
        # Remove player2_color field
        migrations.RemoveField(
            model_name='game',
            name='player2_color',
        ),
        # Alter winner field choices
        migrations.AlterField(
            model_name='game',
            name='winner',
            field=models.CharField(
                choices=[('black', 'Black'), ('white', 'White')],
                max_length=10
            ),
        ),
    ]
