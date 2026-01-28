"""
Unit tests for disability rating calculator
"""

import pytest
from backend.app.core.disability_calculator import (
    DisabilityCalculator,
    DisabilityCondition,
    DisabilitySide,
    ExtremityGroup,
    validate_conditions
)


class TestVACombinedRatingMath:
    """Test VA combined rating calculations"""

    def test_single_condition(self):
        """Single condition should equal that percentage"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Tinnitus", 10, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        assert result["true_combined_rating"] == 10.0
        assert result["rounded_combined_rating"] == 10
        assert result["bilateral_applied"] == False

    def test_two_same_conditions(self):
        """50% + 50% should equal 75%"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Condition A", 50, DisabilitySide.NONE),
            DisabilityCondition("Condition B", 50, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        # 50% + (50% of 50%) = 50 + 25 = 75%
        assert result["true_combined_rating"] == 75.0
        assert result["rounded_combined_rating"] == 80  # Rounds up to 80
        assert result["bilateral_applied"] == False

    def test_three_conditions_decreasing(self):
        """30% + 20% + 10% should be applied in order of highest first"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("High", 30, DisabilitySide.NONE),
            DisabilityCondition("Mid", 20, DisabilitySide.NONE),
            DisabilityCondition("Low", 10, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        # 30% + (20% of 70%) + (10% of 56%) = 30 + 14 + 5.6 = 49.6%
        assert result["true_combined_rating"] == pytest.approx(49.6, 0.1)
        assert result["rounded_combined_rating"] == 50

    def test_zero_percent(self):
        """Zero percent should result in zero"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("No Disability", 0, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        assert result["true_combined_rating"] == 0.0
        assert result["rounded_combined_rating"] == 0

    def test_100_percent(self):
        """100% should remain 100%"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Total", 100, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        assert result["true_combined_rating"] == 100.0
        assert result["rounded_combined_rating"] == 100

    def test_rounding_down(self):
        """26% should round down to 20%"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("A", 20, DisabilitySide.NONE),
            DisabilityCondition("B", 10, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        # 20% + (10% of 80%) = 20 + 8 = 28%
        # Should round down to 30%
        assert result["rounded_combined_rating"] == 30

    def test_rounding_up(self):
        """35% should round up to 40%"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("A", 30, DisabilitySide.NONE),
            DisabilityCondition("B", 10, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        # 30% + (10% of 70%) = 30 + 7 = 37%
        # Should round to 40%
        assert result["rounded_combined_rating"] == 40

    def test_empty_conditions(self):
        """Empty conditions should result in 0%"""
        calculator = DisabilityCalculator()
        result = calculator.calculate_combined_rating([])

        assert result["true_combined_rating"] == 0.0
        assert result["rounded_combined_rating"] == 0


class TestBilateralFactor:
    """Test bilateral factor logic"""

    def test_bilateral_legs_same_percentage(self):
        """Left and right legs at 30% each should apply bilateral factor"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Left Knee", 30, DisabilitySide.LEFT, ExtremityGroup.LEG),
            DisabilityCondition("Right Knee", 30, DisabilitySide.RIGHT, ExtremityGroup.LEG)
        ]
        result = calculator.calculate_combined_rating(conditions, apply_bilateral=True)

        # Pair rating: 30% + (30% of 70%) = 30 + 21 = 51%
        # Bilateral factor: 51% * 10% = 5.1%
        # Total: 51% + 5.1% = 56.1%
        assert result["bilateral_applied"] == True
        assert result["true_combined_rating"] == pytest.approx(56.1, 0.1)
        assert result["rounded_combined_rating"] == 60

    def test_bilateral_arms_different_percentages(self):
        """Left and right arms at different percentages with bilateral factor"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Left Arm", 40, DisabilitySide.LEFT, ExtremityGroup.ARM),
            DisabilityCondition("Right Arm", 20, DisabilitySide.RIGHT, ExtremityGroup.ARM),
            DisabilityCondition("Tinnitus", 10, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions, apply_bilateral=True)

        assert result["bilateral_applied"] == True
        assert result["notes"] != None
        # Should have note about bilateral factor
        assert any("bilateral" in note.lower() for note in result["notes"])

    def test_no_bilateral_without_pair(self):
        """Single-sided condition should not trigger bilateral factor"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Left Knee", 30, DisabilitySide.LEFT, ExtremityGroup.LEG),
            DisabilityCondition("Tinnitus", 10, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions, apply_bilateral=True)

        assert result["bilateral_applied"] == False

    def test_bilateral_disabled(self):
        """Bilateral factor should not apply when disabled"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Left Knee", 30, DisabilitySide.LEFT, ExtremityGroup.LEG),
            DisabilityCondition("Right Knee", 30, DisabilitySide.RIGHT, ExtremityGroup.LEG)
        ]
        result = calculator.calculate_combined_rating(conditions, apply_bilateral=False)

        assert result["bilateral_applied"] == False
        # Without bilateral factor: 30% + (30% of 70%) = 51%
        assert result["true_combined_rating"] == 51.0


class TestValidation:
    """Test input validation"""

    def test_valid_conditions(self):
        """Valid conditions should pass validation"""
        conditions = [
            DisabilityCondition("Condition A", 30, DisabilitySide.NONE),
            DisabilityCondition("Condition B", 50, DisabilitySide.NONE)
        ]
        is_valid, error = validate_conditions(conditions)

        assert is_valid == True
        assert error is None

    def test_invalid_percentage_high(self):
        """Percentage > 100 should raise ValueError on creation"""
        with pytest.raises(ValueError):
            DisabilityCondition("Bad Condition", 150, DisabilitySide.NONE)

    def test_invalid_percentage_negative(self):
        """Percentage < 0 should raise ValueError on creation"""
        with pytest.raises(ValueError):
            DisabilityCondition("Bad Condition", -10, DisabilitySide.NONE)

    def test_empty_condition_name(self):
        """Empty condition name should fail validation"""
        conditions = [
            DisabilityCondition("", 30, DisabilitySide.NONE)
        ]
        is_valid, error = validate_conditions(conditions)

        assert is_valid == False
        assert error is not None


class TestCalculationSteps:
    """Test calculation step tracking"""

    def test_steps_generated(self):
        """Steps should be generated and formatted"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Condition A", 50, DisabilitySide.NONE),
            DisabilityCondition("Condition B", 30, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        assert len(result["steps"]) == 2
        assert "Condition A" in result["steps"][0]
        assert "Condition B" in result["steps"][1]

    def test_steps_show_progression(self):
        """Steps should show increasing combined ratings"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("High", 50, DisabilitySide.NONE),
            DisabilityCondition("Low", 10, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        # First step should show 50% combined
        assert "50" in result["steps"][0]
        # Second step should show higher combined rating
        # 50% + (10% of 50%) = 55%
        assert "55" in result["steps"][1]


class TestEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_many_small_conditions(self):
        """Many small conditions should not exceed 100%"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition(f"Condition {i}", 5, DisabilitySide.NONE)
            for i in range(20)
        ]
        result = calculator.calculate_combined_rating(conditions)

        assert result["true_combined_rating"] <= 100.0
        assert result["rounded_combined_rating"] <= 100

    def test_all_conditions_same_percentage(self):
        """All same percentages should apply in order"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition(f"Condition {i}", 20, DisabilitySide.NONE)
            for i in range(3)
        ]
        result = calculator.calculate_combined_rating(conditions)

        # 20% + (20% of 80%) + (20% of 64%) = 20 + 16 + 12.8 = 48.8%
        assert result["true_combined_rating"] == pytest.approx(48.8, 0.1)

    def test_duplicate_condition_names(self):
        """Duplicate condition names should be allowed (veterans can have multiple conditions)"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Back Pain", 30, DisabilitySide.LEFT),
            DisabilityCondition("Back Pain", 20, DisabilitySide.RIGHT)
        ]
        result = calculator.calculate_combined_rating(conditions)

        assert result["true_combined_rating"] == 44.0  # 30 + (20% of 70%)


class TestRealWorldScenarios:
    """Test realistic disability rating scenarios"""

    def test_common_va_disabilities(self):
        """Test with commonly rated disabilities"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("PTSD", 50, DisabilitySide.NONE),
            DisabilityCondition("Tinnitus", 10, DisabilitySide.NONE),
            DisabilityCondition("Headaches", 20, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions)

        # Should be reasonable disability rating
        assert 50 <= result["rounded_combined_rating"] <= 80

    def test_service_connected_combat_injuries(self):
        """Test with bilateral combat injuries"""
        calculator = DisabilityCalculator()
        conditions = [
            DisabilityCondition("Left Leg Amputation", 70, DisabilitySide.LEFT, ExtremityGroup.LEG),
            DisabilityCondition("Right Leg - Below Knee", 60, DisabilitySide.RIGHT, ExtremityGroup.LEG),
            DisabilityCondition("TBI", 20, DisabilitySide.NONE),
            DisabilityCondition("PTSD", 50, DisabilitySide.NONE)
        ]
        result = calculator.calculate_combined_rating(conditions, apply_bilateral=True)

        assert result["bilateral_applied"] == True
        assert result["rounded_combined_rating"] >= 90
