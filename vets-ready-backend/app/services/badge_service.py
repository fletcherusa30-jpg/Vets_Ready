"""Badge achievement tracking service"""

from enum import Enum
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.claim import Claim


class BadgeType(str, Enum):
    """Military badge types"""

    HALO_WING = "HALO-Inspired Wing Badge"
    AIRBORNE = "Airborne-Inspired Badge"
    INFANTRY = "Infantry-Inspired Badge"
    ARMOR = "Armor-Inspired Badge"
    ARTILLERY = "Artillery-Inspired Badge"
    AVIATION = "Aviation-Inspired Wings"
    SPECIAL_OPS = "Special-Operations-Inspired Emblem"
    TACTICAL_SHIELD = "Tactical Shield Emblem"
    CAMO = "Camo-Themed Badge"
    WWII = "WWII-Style Vintage Badge"


BADGE_UNLOCK_CONDITIONS = {
    BadgeType.HALO_WING: "Complete airborne specialty analysis",
    BadgeType.AIRBORNE: "Analyze 3+ airborne-related disabilities",
    BadgeType.INFANTRY: "Analyze 5+ claims total",
    BadgeType.ARMOR: "Achieve 50%+ combined disability rating",
    BadgeType.ARTILLERY: "Analyze artillery or combat-related conditions",
    BadgeType.AVIATION: "Analyze aviation-related service disabilities",
    BadgeType.SPECIAL_OPS: "Achieve 70%+ combined disability rating",
    BadgeType.TACTICAL_SHIELD: "Complete 10+ claim analyses",
    BadgeType.CAMO: "Analyze all 8 disability condition types",
    BadgeType.WWII: "Complete profile as WWII-era veteran",
}


class BadgeService:
    """Service for managing user achievements and badges"""

    def __init__(self, db: Session):
        self.db = db

    def check_and_award_badges(self, user_id: str) -> List[str]:
        """
        Check user progress and award eligible badges.
        Returns list of newly awarded badges.
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        newly_awarded = []
        eligible_badges = self._get_eligible_badges(user)

        # Only award new badges
        current_badges = self._parse_badges_from_user(user)
        for badge in eligible_badges:
            if badge not in current_badges:
                newly_awarded.append(badge)
                self._award_badge_to_user(user, badge)

        return newly_awarded

    def _get_eligible_badges(self, user: User) -> List[str]:
        """Determine which badges user has unlocked"""
        eligible = []
        claims = self.db.query(Claim).filter(Claim.user_id == user.id).all()

        if not claims:
            return eligible

        # Badge 1: 5+ claims analyzed
        if len(claims) >= 5:
            eligible.append(BadgeType.INFANTRY)

        # Badge 2: 10+ claims analyzed (Tactical Shield)
        if len(claims) >= 10:
            eligible.append(BadgeType.TACTICAL_SHIELD)

        # Badge 3: Analyze all 8 condition types (Camo)
        analyzed_codes = set()
        for claim in claims:
            analyzed_codes.update([c.code for c in claim.conditions])
        if len(analyzed_codes) >= 8:
            eligible.append(BadgeType.CAMO)

        # Badge 4: Achieve 50%+ rating (Armor)
        max_rating = max([c.combined_rating for c in claims], default=0)
        if max_rating >= 50:
            eligible.append(BadgeType.ARMOR)

        # Badge 5: Achieve 70%+ rating (Special Ops)
        if max_rating >= 70:
            eligible.append(BadgeType.SPECIAL_OPS)

        # Badge 6: HALO Wing (airborne specialty)
        airborne_codes = ["F4310", "S06", "H9311"]  # PTSD, TBI, Tinnitus as examples
        airborne_analyzed = sum(1 for claim in claims for c in claim.conditions if c.code in airborne_codes)
        if airborne_analyzed >= 3:
            eligible.append(BadgeType.HALO_WING)

        # Badge 7: Airborne (3+ airborne-related)
        if airborne_analyzed >= 3:
            eligible.append(BadgeType.AIRBORNE)

        # Badge 8: Aviation (aviation codes)
        aviation_keywords = ["aviation", "pilot", "flight"]
        aviation_analyzed = sum(
            1
            for claim in claims
            for c in claim.conditions
            if any(kw in c.name.lower() for kw in aviation_keywords)
        )
        if aviation_analyzed >= 1:
            eligible.append(BadgeType.AVIATION)

        # Badge 9: Artillery (artillery codes)
        artillery_keywords = ["artillery", "explosive", "blast"]
        artillery_analyzed = sum(
            1
            for claim in claims
            for c in claim.conditions
            if any(kw in c.name.lower() for kw in artillery_keywords)
        )
        if artillery_analyzed >= 1:
            eligible.append(BadgeType.ARTILLERY)

        return list(set(eligible))  # Remove duplicates

    def _parse_badges_from_user(self, user: User) -> List[str]:
        """Extract badge list from user.badges JSON field"""
        if not user.badges:
            return []
        if isinstance(user.badges, list):
            return user.badges
        if isinstance(user.badges, str):
            import json

            try:
                return json.loads(user.badges)
            except:
                return []
        return []

    def _award_badge_to_user(self, user: User, badge: str):
        """Add badge to user's badges list"""
        current_badges = self._parse_badges_from_user(user)
        if badge not in current_badges:
            current_badges.append(badge)
            import json

            user.badges = json.dumps(current_badges)
            self.db.commit()

    def get_user_badges(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's unlocked badges with metadata"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        badge_list = self._parse_badges_from_user(user)
        return [
            {
                "name": badge,
                "condition": BADGE_UNLOCK_CONDITIONS.get(badge, "Unknown"),
                "type": "military",
            }
            for badge in badge_list
        ]

    def reset_badges(self, user_id: str):
        """Reset all user badges (for testing)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.badges = None
            self.db.commit()
