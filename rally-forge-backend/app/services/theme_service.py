"""Background theme customization service"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import json
from app.models.user import User


# Military branches with official colors
MILITARY_BRANCHES = {
    "army": {
        "name": "United States Army",
        "colors": ["#004225", "#87CEEB", "#FFD700"],
        "primary": "#004225",
        "secondary": "#FFD700",
        "description": "Army green and gold"
    },
    "navy": {
        "name": "United States Navy",
        "colors": ["#002B5C", "#FFC72C", "#FFFFFF"],
        "primary": "#002B5C",
        "secondary": "#FFC72C",
        "description": "Navy blue and gold"
    },
    "marines": {
        "name": "United States Marine Corps",
        "colors": ["#8B0000", "#FFD700", "#FFFFFF"],
        "primary": "#8B0000",
        "secondary": "#FFD700",
        "description": "Marine red and gold"
    },
    "airforce": {
        "name": "United States Air Force",
        "colors": ["#00308D", "#00308D", "#87CEEB"],
        "primary": "#00308D",
        "secondary": "#87CEEB",
        "description": "Air Force blue"
    },
    "coastguard": {
        "name": "United States Coast Guard",
        "colors": ["#DC143C", "#FFFFFF", "#00308D"],
        "primary": "#DC143C",
        "secondary": "#FFFFFF",
        "description": "Coast Guard red and blue"
    },
    "spacforce": {
        "name": "United States Space Force",
        "colors": ["#00308D", "#4B9BFF", "#FFFFFF"],
        "primary": "#00308D",
        "secondary": "#4B9BFF",
        "description": "Space Force blue"
    },
    "nationalguard": {
        "name": "Army National Guard",
        "colors": ["#004225", "#FFD700", "#87CEEB"],
        "primary": "#004225",
        "secondary": "#FFD700",
        "description": "National Guard green and gold"
    }
}

# Pre-designed background themes
BACKGROUND_THEMES = {
    "default": {
        "name": "Default Military",
        "type": "gradient",
        "pattern": "none",
        "colors": ["#1a3a52", "#2d5a7b", "#4a7ba7"],
        "opacity": 1.0,
        "description": "Classic military gradient"
    },
    "camo": {
        "name": "Camouflage",
        "type": "pattern",
        "pattern": "camo",
        "colors": ["#3a5a2a", "#5a7a4a", "#7a9a6a"],
        "opacity": 0.9,
        "description": "Tactical camouflage pattern"
    },
    "slate": {
        "name": "Slate Storm",
        "type": "gradient",
        "pattern": "none",
        "colors": ["#2d3748", "#4a5568", "#718096"],
        "opacity": 1.0,
        "description": "Professional slate gradient"
    },
    "night": {
        "name": "Night Operations",
        "type": "gradient",
        "pattern": "grid",
        "colors": ["#0f172a", "#1e293b", "#334155"],
        "opacity": 0.95,
        "description": "Dark operations theme"
    },
    "flag": {
        "name": "Stars & Stripes",
        "type": "patriotic",
        "pattern": "stripes",
        "colors": ["#b22234", "#ffffff", "#3c3b6b"],
        "opacity": 1.0,
        "description": "Patriotic flag theme"
    }
}


class BackgroundThemeService:
    """Service for managing user background theme customization"""

    def __init__(self, db: Session):
        self.db = db

    def get_default_theme(self) -> Dict[str, Any]:
        """Get the default military theme"""
        return {
            "theme_type": "default",
            "preset": "default",
            "branch": None,
            "custom_insignia_url": None,
            "colors": ["#1a3a52", "#2d5a7b", "#4a7ba7"],
            "opacity": 1.0,
            "pattern": "none"
        }

    def get_user_theme(self, user_id: str) -> Dict[str, Any]:
        """Get user's background theme or default if not set"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.background_theme:
            return self.get_default_theme()

        try:
            if isinstance(user.background_theme, str):
                return json.loads(user.background_theme)
            return user.background_theme
        except:
            return self.get_default_theme()

    def set_branch_theme(self, user_id: str, branch: str) -> Dict[str, Any]:
        """Set background theme based on military branch"""
        if branch not in MILITARY_BRANCHES:
            raise ValueError(f"Invalid branch: {branch}")

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        branch_info = MILITARY_BRANCHES[branch]
        theme = {
            "theme_type": "branch",
            "preset": branch,
            "branch": branch,
            "branch_name": branch_info["name"],
            "colors": branch_info["colors"],
            "opacity": 1.0,
            "pattern": "none",
            "custom_insignia_url": None
        }

        user.background_theme = json.dumps(theme)
        self.db.commit()
        return theme

    def set_preset_theme(self, user_id: str, preset: str) -> Dict[str, Any]:
        """Set background theme from preset"""
        if preset not in BACKGROUND_THEMES:
            raise ValueError(f"Invalid preset: {preset}")

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        preset_info = BACKGROUND_THEMES[preset]
        theme = {
            "theme_type": "preset",
            "preset": preset,
            "preset_name": preset_info["name"],
            "colors": preset_info["colors"],
            "opacity": preset_info["opacity"],
            "pattern": preset_info["pattern"],
            "branch": None,
            "custom_insignia_url": None
        }

        user.background_theme = json.dumps(theme)
        self.db.commit()
        return theme

    def set_custom_insignia(
        self,
        user_id: str,
        insignia_url: str,
        position: str = "center"
    ) -> Dict[str, Any]:
        """Add custom unit/ship insignia to theme"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Get current theme or default
        theme = self.get_user_theme(user_id)

        # Add insignia
        theme["custom_insignia_url"] = insignia_url
        theme["insignia_position"] = position
        theme["theme_type"] = "custom"

        user.background_theme = json.dumps(theme)
        self.db.commit()
        return theme

    def set_custom_colors(
        self,
        user_id: str,
        primary: str,
        secondary: str,
        accent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Set custom color scheme"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        theme = self.get_user_theme(user_id)
        colors = [primary, secondary]
        if accent:
            colors.append(accent)

        theme["colors"] = colors
        theme["custom_colors"] = True
        theme["theme_type"] = "custom"

        user.background_theme = json.dumps(theme)
        self.db.commit()
        return theme

    def reset_theme(self, user_id: str) -> Dict[str, Any]:
        """Reset to default theme"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        user.background_theme = None
        self.db.commit()
        return self.get_default_theme()

    def get_available_branches(self) -> Dict[str, Dict[str, str]]:
        """Get all available military branches"""
        return MILITARY_BRANCHES

    def get_available_presets(self) -> Dict[str, Dict[str, Any]]:
        """Get all available background presets"""
        return BACKGROUND_THEMES
