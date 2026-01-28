"""Retirement projection engine with compound growth and inflation modeling."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class ProjectionInputs:
    """Normalized inputs required to run a retirement projection."""

    current_age: int
    retirement_age: int
    current_savings: float
    monthly_contribution: float
    annual_growth_rate: float
    inflation_rate: float
    include_va_income: bool
    retirement_income_goal: Optional[float]
    budget_surplus: float = 0.0
    savings_rate: Optional[float] = None
    va_income_monthly: float = 0.0


@dataclass
class ProjectionResult:
    """Structured output of the retirement projection engine."""

    projected_savings: float
    projected_savings_real: float
    monthly_income: float
    readiness_score: int
    readiness_breakdown: Dict[str, float]
    readiness_band: str
    goal_progress: float
    years_to_retirement: int
    years_covered: float
    shortfall: float
    chart_data: Dict[str, List[Dict[str, float]]]
    status_message: str
    action_required: Optional[str]
    insights: List[str]
    contribution_source: str
    effective_monthly_contribution: float
    goal_context: Dict[str, float]


class RetirementProjectionEngine:
    """Provides modular, testable retirement projections."""

    DEFAULT_RETIREMENT_DURATION_YEARS = 25
    TARGET_SAVINGS_RATE = 0.15

    def project(self, inputs: ProjectionInputs) -> ProjectionResult:
        """Run the retirement projection using compound growth and inflation."""

        years_to_retirement = max(inputs.retirement_age - inputs.current_age, 0)
        months_to_retirement = years_to_retirement * 12
        annual_growth = max(inputs.annual_growth_rate, 0.0)
        monthly_rate = annual_growth / 12
        inflation_rate = max(inputs.inflation_rate, 0.0)
        years_in_retirement = self.DEFAULT_RETIREMENT_DURATION_YEARS

        effective_contribution, contribution_source = self._resolve_contribution(
            inputs.monthly_contribution,
            inputs.budget_surplus,
        )

        future_value, contribution_component, current_component = self._future_value(
            inputs.current_savings,
            effective_contribution,
            monthly_rate,
            months_to_retirement,
        )

        inflation_adjustment = (1 + inflation_rate) ** years_to_retirement if years_to_retirement else 1
        real_future_value = future_value / inflation_adjustment

        va_income = inputs.va_income_monthly if inputs.include_va_income else 0.0
        monthly_drawdown = (
            real_future_value / (years_in_retirement * 12)
            if years_in_retirement > 0
            else real_future_value
        )
        monthly_income = monthly_drawdown + va_income

        monthly_goal = inputs.retirement_income_goal or 0.0
        if monthly_goal <= 0:
            monthly_goal = max(monthly_income, 0.0)
            goal_source = "projection"
        else:
            goal_source = "user"

        years_covered = self._years_covered(
            real_future_value,
            monthly_goal,
            va_income,
            years_in_retirement,
        )
        shortfall = max(monthly_goal - monthly_income, 0.0)

        readiness_score, breakdown, band = self._readiness_score(
            real_future_value,
            monthly_income,
            monthly_goal,
            inputs.savings_rate,
            years_to_retirement,
            effective_contribution,
        )
        goal_progress = 1.0 if monthly_goal == 0 else min(monthly_income / monthly_goal, 1.0)

        chart_data = self._build_chart_data(
            inputs.current_age,
            years_to_retirement,
            monthly_rate,
            inflation_rate,
            inputs.current_savings,
            effective_contribution,
            future_value,
            contribution_component,
            current_component,
            monthly_income,
            monthly_goal,
        )

        status_message, action_required, insights = self._messages(
            shortfall,
            years_covered,
            years_in_retirement,
            years_to_retirement,
            effective_contribution,
        )

        return ProjectionResult(
            projected_savings=round(future_value, 2),
            projected_savings_real=round(real_future_value, 2),
            monthly_income=round(monthly_income, 2),
            readiness_score=readiness_score,
            readiness_breakdown=breakdown,
            readiness_band=band,
            goal_progress=round(goal_progress, 4),
            years_to_retirement=years_to_retirement,
            years_covered=round(years_covered, 2),
            shortfall=round(shortfall, 2),
            chart_data=chart_data,
            status_message=status_message,
            action_required=action_required,
            insights=insights,
            contribution_source=contribution_source,
            effective_monthly_contribution=round(effective_contribution, 2),
            goal_context={
                "monthly_goal": round(monthly_goal, 2),
                "goal_source": goal_source,
            },
        )

    def _resolve_contribution(self, monthly_contribution: float, budget_surplus: float) -> tuple[float, str]:
        """Determine the effective monthly contribution."""

        if monthly_contribution > 0:
            return monthly_contribution, "user"
        if budget_surplus > 0:
            return budget_surplus, "budget_surplus"
        return 0.0, "none"

    def _future_value(
        self,
        current_savings: float,
        monthly_contribution: float,
        monthly_rate: float,
        months: int,
    ) -> tuple[float, float, float]:
        """Compound current savings and recurring contributions."""

        compound_factor = (1 + monthly_rate) ** months if months else 1
        principal_component = current_savings * compound_factor

        if monthly_rate == 0:
            contribution_component = monthly_contribution * months
        else:
            contribution_component = monthly_contribution * (((1 + monthly_rate) ** months - 1) / monthly_rate)

        total = principal_component + contribution_component
        return total, contribution_component, principal_component

    def _years_covered(
        self,
        real_future_value: float,
        monthly_goal: float,
        va_income: float,
        years_in_retirement: int,
    ) -> float:
        """Estimate how long the retirement balance can sustain the goal."""

        annual_need_from_portfolio = max((monthly_goal - va_income), 0.0) * 12
        if annual_need_from_portfolio <= 0:
            return float(years_in_retirement)
        return min(real_future_value / annual_need_from_portfolio, float(years_in_retirement))

    def _readiness_score(
        self,
        real_future_value: float,
        monthly_income: float,
        monthly_goal: float,
        savings_rate: Optional[float],
        years_to_retirement: int,
        effective_contribution: float,
    ) -> tuple[int, Dict[str, float], str]:
        """Calculate readiness score (0-100) using modular components."""

        target_savings = monthly_goal * 12 * self.DEFAULT_RETIREMENT_DURATION_YEARS if monthly_goal else real_future_value
        target_savings = max(target_savings, 1)
        savings_ratio = real_future_value / target_savings
        savings_points = self._linear_points(savings_ratio, 0.5, 1.0, 40)

        coverage_ratio = (monthly_income / monthly_goal) if monthly_goal else 1.0
        coverage_points = self._linear_points(coverage_ratio, 0.5, 1.0, 30)

        rate = (savings_rate / 100.0) if savings_rate is not None else None
        if rate is None:
            baseline_income = max(monthly_goal, monthly_income, effective_contribution * 4, 1.0)
            rate = min(effective_contribution / baseline_income, 1.0)
        rate_points = self._linear_points(rate, self.TARGET_SAVINGS_RATE / 2, self.TARGET_SAVINGS_RATE, 20)

        time_points = self._linear_points(years_to_retirement, 5, 20, 10)

        total = round(min(savings_points + coverage_points + rate_points + time_points, 100))
        band = self._band_from_score(total)
        breakdown = {
            "savings": round(savings_points, 2),
            "income": round(coverage_points, 2),
            "savings_rate": round(rate_points, 2),
            "time": round(time_points, 2),
        }
        return total, breakdown, band

    def _linear_points(self, value: float, min_ref: float, max_ref: float, max_points: float) -> float:
        """Linear interpolation between two reference values."""

        if value >= max_ref:
            return max_points
        if value <= min_ref:
            return 0.0
        if max_ref == min_ref:
            return max_points if value >= max_ref else 0.0
        span = max_ref - min_ref
        return ((value - min_ref) / span) * max_points

    def _band_from_score(self, score: int) -> str:
        if score >= 85:
            return "strong"
        if score >= 70:
            return "on_track"
        if score >= 40:
            return "needs_improvement"
        return "at_risk"

    def _build_chart_data(
        self,
        current_age: int,
        years_to_retirement: int,
        monthly_rate: float,
        inflation_rate: float,
        current_savings: float,
        monthly_contribution: float,
        future_value: float,
        contribution_component: float,
        principal_component: float,
        monthly_income: float,
        monthly_goal: float,
    ) -> Dict[str, List[Dict[str, float]]]:
        """Prepare deterministic data for charts."""

        points: List[Dict[str, float]] = []
        for year in range(years_to_retirement + 1):
            months = year * 12
            balance = self._balance_at_month(
                current_savings,
                monthly_contribution,
                monthly_rate,
                months,
            )
            inflation_adjustment = (1 + inflation_rate) ** year if year else 1
            real_balance = balance / inflation_adjustment
            points.append(
                {
                    "age": current_age + year,
                    "balance": round(balance, 2),
                    "inflation_adjusted_balance": round(real_balance, 2),
                }
            )

        income_comparison = [
            {"label": "Projected Monthly Income", "value": round(monthly_income, 2)},
            {"label": "Monthly Goal", "value": round(monthly_goal, 2)},
        ]

        contribution_breakdown = [
            {"label": "Current Savings", "value": round(principal_component, 2)},
            {"label": "Future Contributions", "value": round(contribution_component, 2)},
        ]

        return {
            "savings_growth": points,
            "income_comparison": income_comparison,
            "contribution_breakdown": contribution_breakdown,
        }

    def _balance_at_month(
        self,
        current_savings: float,
        monthly_contribution: float,
        monthly_rate: float,
        months: int,
    ) -> float:
        """Balance at a specific month using compound interest."""

        compound_factor = (1 + monthly_rate) ** months if months else 1
        balance = current_savings * compound_factor
        if monthly_rate == 0:
            balance += monthly_contribution * months
        else:
            balance += monthly_contribution * (((1 + monthly_rate) ** months - 1) / monthly_rate)
        return balance

    def _messages(
        self,
        shortfall: float,
        years_covered: float,
        target_years: int,
        years_to_retirement: int,
        effective_contribution: float,
    ) -> tuple[str, Optional[str], List[str]]:
        """Generate status and actionable insights."""

        insights: List[str] = []
        if shortfall <= 0:
            status = "You're on track for your current goal."
            action = None
            insights.append("Maintain your current savings pattern to preserve readiness.")
        else:
            status = "You need to increase monthly income to reach the goal."
            action = f"Increase savings or VA-adjusted income by ${shortfall:,.2f} per month."
            insights.append("Consider boosting contributions or delaying retirement to close the gap.")

        if years_covered < target_years:
            insights.append(
                f"At current pace, savings last about {years_covered:.1f} years. Explore reducing expenses or extending work horizon."
            )
        else:
            insights.append("Your portfolio can cover the full retirement window under current assumptions.")

        if years_to_retirement > 0 and effective_contribution <= 0:
            insights.append("No monthly contribution detected; redirect surplus income toward retirement goals.")

        return status, action, insights
