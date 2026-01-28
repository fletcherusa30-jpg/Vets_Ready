"""Unit tests for the retirement projection engine."""

from backend.app.services.retirement_engine import ProjectionInputs, RetirementProjectionEngine


class TestRetirementProjectionEngine:
    """Validate compound math, inflation handling, and VA toggles."""

    def setup_method(self):
        self.engine = RetirementProjectionEngine()

    def test_compound_growth_and_inflation_adjustment(self):
        inputs = ProjectionInputs(
            current_age=35,
            retirement_age=65,
            current_savings=75000,
            monthly_contribution=800,
            annual_growth_rate=0.07,
            inflation_rate=0.025,
            include_va_income=True,
            retirement_income_goal=4500,
            budget_surplus=0.0,
            savings_rate=12.5,
            va_income_monthly=1200,
        )

        result = self.engine.project(inputs)

        assert result.projected_savings > inputs.current_savings
        assert result.projected_savings_real < result.projected_savings
        assert 0 <= result.readiness_score <= 100
        assert result.chart_data["savings_growth"], "Expected yearly savings points"

    def test_va_income_toggle_impacts_projection(self):
        base_inputs = dict(
            current_age=40,
            retirement_age=62,
            current_savings=50000,
            monthly_contribution=900,
            annual_growth_rate=0.06,
            inflation_rate=0.02,
            retirement_income_goal=4000,
            budget_surplus=0.0,
            savings_rate=10.0,
            va_income_monthly=1800,
        )

        with_va = self.engine.project(ProjectionInputs(**base_inputs, include_va_income=True))
        without_va = self.engine.project(ProjectionInputs(**base_inputs, include_va_income=False))

        assert with_va.monthly_income > without_va.monthly_income
        assert with_va.shortfall <= without_va.shortfall

    def test_shortfall_generates_actionable_message(self):
        inputs = ProjectionInputs(
            current_age=50,
            retirement_age=60,
            current_savings=20000,
            monthly_contribution=200,
            annual_growth_rate=0.05,
            inflation_rate=0.03,
            include_va_income=False,
            retirement_income_goal=6000,
            budget_surplus=0.0,
            savings_rate=5.0,
            va_income_monthly=0.0,
        )

        result = self.engine.project(inputs)

        assert result.shortfall > 0
        assert result.action_required is not None
        assert any("gap" in insight.lower() or "increase" in insight.lower() for insight in result.insights)
