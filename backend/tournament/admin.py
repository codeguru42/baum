"""
Import admin modules to ensure Django registers them.

Django's admin auto-discovery requires admin modules to be imported.
By importing them here, we ensure the @admin.register decorators are executed.
"""

# Import admin modules to register them with Django admin
import tournament.game.admin  # noqa: F401
import tournament.player.admin  # noqa: F401
