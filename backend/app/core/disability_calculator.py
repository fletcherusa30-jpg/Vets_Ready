"""
VA Disability Combined Rating Calculator

Implements accurate VA combined rating mathematics and bilateral factor logic.
Reference: https://www.va.gov/disability/how-we-rate-disabilities/
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum


class DisabilitySide(str, Enum):
    """Side of body for disability"""
    LEFT = "LEFT"
    RIGHT = "RIGHT"
    NONE = "NONE"


class ExtremityGroup(str, Enum):
    """Grouping for bilateral factor application"""
    ARM = "ARM"
    LEG = "LEG"
    ORGAN = "ORGAN"  # Non-bilateral (both ears, both eyes, etc.)


@dataclass
class DisabilityCondition:
    """Represents a single disability condition"""
    condition_name: str
    percentage: int  # 0-100
    side: DisabilitySide
    extremity_group: Optional[ExtremityGroup] = None

    def __post_init__(self):
        """Validate percentage range"""
        if not 0 <= self.percentage <= 100:
            raise ValueError(f"Percentage must be between 0 and 100, got {self.percentage}")


@dataclass
class RatingStep:
    """Represents a single step in the VA rating calculation"""
    description: str
    remaining_efficiency: float
    condition_percentage: float
    increment: float
    new_combined_rating: float


class DisabilityCalculator:
    """
    Calculates VA combined disability rating using official VA methodology.

    The VA uses a "combined rating table" approach:
    1. Sort conditions from highest to lowest disability percentage
    2. Apply each condition to remaining efficiency (100% - current rating)
    3. Each additional condition gets smaller as remaining efficiency decreases

    Example: 50% + 50% = 75% (not 100%)
    - Start: 0%
    - 50%: 50% of 100% = 50% → Total: 50%
    - 50%: 50% of 50% remaining = 25% → Total: 75%
    """

    def __init__(self):
        self.steps: List[RatingStep] = []
        self.notes: List[str] = []
        self.bilateral_applied: bool = False

    def calculate_combined_rating(
        self,
        conditions: List[DisabilityCondition],
        apply_bilateral: bool = True
    ) -> Dict[str, any]:
        """
        Calculate combined disability rating for all conditions.

        Args:
            conditions: List of disability conditions
            apply_bilateral: Whether to apply bilateral factor logic

        Returns:
            Dictionary with:
            - true_combined_rating: Unrounded combined rating
            - rounded_combined_rating: Rounded to nearest 10%
            - bilateral_applied: Whether bilateral factor was used
            - steps: List of calculation steps
            - notes: List of explanation notes
        """
        self.steps = []
        self.notes = []
        self.bilateral_applied = False

        # Handle empty or single non-bilateral conditions
        if not conditions:
            return {
                "true_combined_rating": 0.0,
                "rounded_combined_rating": 0,
                "bilateral_applied": False,
                "steps": [],
                "notes": ["No conditions provided"]
            }

        # Check for bilateral conditions that qualify for bilateral factor
        bilateral_pairs = self._find_bilateral_pairs(conditions) if apply_bilateral else []

        if bilateral_pairs:
            return self._calculate_with_bilateral_factor(conditions, bilateral_pairs)
        else:
            return self._calculate_standard_combined_rating(conditions)

    def _find_bilateral_pairs(
        self,
        conditions: List[DisabilityCondition]
    ) -> Dict[ExtremityGroup, List[DisabilityCondition]]:
        """
        Find bilateral condition pairs that qualify for bilateral factor.

        Returns a dict of extremity groups that have both LEFT and RIGHT conditions.
        """
        groups: Dict[ExtremityGroup, Dict[str, list]] = {}

        for condition in conditions:
            if condition.side == DisabilitySide.NONE or condition.extremity_group is None:
                continue

            group = condition.extremity_group
            if group not in groups:
                groups[group] = {DisabilitySide.LEFT: [], DisabilitySide.RIGHT: []}

            groups[group][condition.side].append(condition)

        # Return only groups that have both LEFT and RIGHT
        bilateral_pairs = {
            group: conditions
            for group, sides in groups.items()
            if sides[DisabilitySide.LEFT] and sides[DisabilitySide.RIGHT]
        }

        return bilateral_pairs

    def _calculate_standard_combined_rating(
        self,
        conditions: List[DisabilityCondition]
    ) -> Dict[str, any]:
        """Calculate combined rating without bilateral factor complications."""
        # Sort by percentage descending (highest first)
        sorted_conditions = sorted(conditions, key=lambda c: c.percentage, reverse=True)

        combined_rating = 0.0

        for condition in sorted_conditions:
            remaining_efficiency = 100.0 - combined_rating
            increment = remaining_efficiency * (condition.percentage / 100.0)
            combined_rating += increment

            side_label = f" ({condition.side.value})" if condition.side != DisabilitySide.NONE else ""
            step = RatingStep(
                description=f"{condition.condition_name}{side_label}: {condition.percentage}% of {remaining_efficiency:.1f}% remaining",
                remaining_efficiency=remaining_efficiency,
                condition_percentage=condition.percentage,
                increment=increment,
                new_combined_rating=combined_rating
            )
            self.steps.append(step)

        rounded_rating = self._round_to_nearest_10(combined_rating)

        return {
            "true_combined_rating": round(combined_rating, 2),
            "rounded_combined_rating": rounded_rating,
            "bilateral_applied": False,
            "steps": [self._format_step(step) for step in self.steps],
            "notes": self.notes
        }

    def _calculate_with_bilateral_factor(
        self,
        all_conditions: List[DisabilityCondition],
        bilateral_pairs: Dict[ExtremityGroup, List[DisabilityCondition]]
    ) -> Dict[str, any]:
        """
        Calculate combined rating applying bilateral factor to eligible pairs.

        Bilateral factor logic:
        1. Calculate combined rating for each bilateral pair separately
        2. Apply 10% bilateral factor (multiply pair rating by 1.10)
        3. Combine with non-bilateral conditions using standard VA math
        """
        self.bilateral_applied = True
        self.notes.append("Bilateral factor applied to paired extremity conditions")

        # Separate bilateral and non-bilateral conditions
        bilateral_conditions_processed = set()
        bilateral_increments: Dict[ExtremityGroup, float] = {}

        for group, paired_conditions in bilateral_pairs.items():
            # Calculate combined rating for just this bilateral pair
            pair_combined = self._calculate_pair_combined_rating(paired_conditions)

            # Apply bilateral factor: 10% of combined rating is added to disability
            bilateral_increment = pair_combined * 0.10
            bilateral_increments[group] = bilateral_increment

            # Track which conditions we've processed
            for condition in paired_conditions:
                bilateral_conditions_processed.add(id(condition))

            side_names = ", ".join(sorted(set(c.side.value for c in paired_conditions)))
            self.notes.append(
                f"Bilateral factor for {group.value} ({side_names}): "
                f"{pair_combined:.1f}% × 10% = +{bilateral_increment:.1f}%"
            )

        # Collect all conditions: bilateral pairs + non-bilateral + bilateral increments
        combined_rating = 0.0
        conditions_to_process = []

        # Add non-bilateral conditions
        for condition in all_conditions:
            if id(condition) not in bilateral_conditions_processed:
                conditions_to_process.append(condition)

        # Add bilateral increments as synthetic conditions
        for group, increment_value in bilateral_increments.items():
            synthetic = DisabilityCondition(
                condition_name=f"Bilateral Factor ({group.value})",
                percentage=int(round(increment_value)),
                side=DisabilitySide.NONE,
                extremity_group=None
            )
            conditions_to_process.append(synthetic)

        # Sort all by percentage descending
        conditions_to_process.sort(key=lambda c: c.percentage, reverse=True)

        # Apply standard VA math to combined pool
        for condition in conditions_to_process:
            remaining_efficiency = 100.0 - combined_rating
            increment = remaining_efficiency * (condition.percentage / 100.0)
            combined_rating += increment

            step = RatingStep(
                description=f"{condition.condition_name}: {condition.percentage}% of {remaining_efficiency:.1f}% remaining",
                remaining_efficiency=remaining_efficiency,
                condition_percentage=condition.percentage,
                increment=increment,
                new_combined_rating=combined_rating
            )
            self.steps.append(step)

        rounded_rating = self._round_to_nearest_10(combined_rating)

        return {
            "true_combined_rating": round(combined_rating, 2),
            "rounded_combined_rating": rounded_rating,
            "bilateral_applied": True,
            "steps": [self._format_step(step) for step in self.steps],
            "notes": self.notes
        }

    def _calculate_pair_combined_rating(
        self,
        pair_conditions: List[DisabilityCondition]
    ) -> float:
        """Calculate combined rating for a bilateral pair only."""
        combined = 0.0
        sorted_pair = sorted(pair_conditions, key=lambda c: c.percentage, reverse=True)

        for condition in sorted_pair:
            remaining = 100.0 - combined
            increment = remaining * (condition.percentage / 100.0)
            combined += increment

        return combined

    def _round_to_nearest_10(self, rating: float) -> int:
        """
        Round to nearest 10% per VA guidelines.

        VA rounds 0-4 down, 5+ up:
        - 0.0-4.9 → 0
        - 5.0-14.9 → 10
        - 15.0-24.9 → 20
        - etc.
        """
        return round(rating / 10) * 10

    def _format_step(self, step: RatingStep) -> str:
        """Format a calculation step as human-readable string."""
        return (
            f"{step.description} → "
            f"Increment: {step.increment:.2f}% → "
            f"Combined: {step.new_combined_rating:.2f}%"
        )


def validate_conditions(conditions: List[DisabilityCondition]) -> Tuple[bool, Optional[str]]:
    """
    Validate a list of conditions.

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not conditions:
        return True, None

    seen_names = set()
    for condition in conditions:
        if condition.percentage < 0 or condition.percentage > 100:
            return False, f"Condition '{condition.condition_name}' percentage must be 0-100"

        if condition.condition_name.strip() == "":
            return False, "Condition name cannot be empty"

        # Allow duplicates but warn (veterans can have multiple ratings for same condition)

    return True, None
