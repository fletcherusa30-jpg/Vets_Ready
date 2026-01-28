"""FastAPI router for advanced retirement planning endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.repositories import get_repositories
from backend.app.core.budget_repositories import get_budget_repositories
from backend.app.models.database import IncomeSourceType, GoalType
from backend.app.schemas.retirement import (
    RetirementProjectionPayload,
    RetirementProjectionResponse,
    VAIncomeSourceResponse,
    ChartData,
    BudgetContext,
    ProfileContext,
    GoalContext,
    RetirementChartPoint,
    ChartBar,
    InvestmentAccountInput,
    InvestmentAccountProjection,
    IncomeStream,
    RetirementBudgetRequest,
    RetirementBudgetResponse,
    RetirementBudgetSummary,
    RetirementBudgetChart,
)
from backend.app.services.retirement_engine import ProjectionInputs, RetirementProjectionEngine

router = APIRouter(prefix="/api/retirement", tags=["retirement"])
engine = RetirementProjectionEngine()


@router.post("/project/{veteran_id}", response_model=RetirementProjectionResponse, status_code=status.HTTP_200_OK)
def project_retirement(
    veteran_id: str,
    payload: RetirementProjectionPayload,
    db: Session = Depends(get_db),
) -> RetirementProjectionResponse:
    """Project retirement readiness using compound growth and inflation modeling."""

    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found",
        )

    budget_repos = get_budget_repositories(db)
    budget_profile = budget_repos["budget"].get_budget_profile(veteran_id)

    budget_surplus = 0.0
    savings_rate = None
    va_income_monthly = 0.0
    va_income_sources: List[VAIncomeSourceResponse] = []
    goal_source_override = None
    inferred_goal = payload.retirement_income_goal

    if budget_profile:
        budget_surplus = max(budget_profile.monthly_net_cashflow or 0.0, 0.0)
        savings_rate = budget_profile.savings_rate

        incomes = budget_repos["income"].get_income_sources(budget_profile.id)
        for src in incomes:
            monthly_amount = _normalize_income_amount(src.monthly_amount, src.is_irregular, src.annual_amount)
            if src.source_type in {
                IncomeSourceType.VA_DISABILITY,
                IncomeSourceType.MILITARY_RETIREMENT,
                IncomeSourceType.GI_BILL_HOUSING,
            }:
                va_income_monthly += monthly_amount
                va_income_sources.append(
                    VAIncomeSourceResponse(
                        id=src.id,
                        name=src.name,
                        monthly_amount=round(monthly_amount, 2),
                        source_type=src.source_type.value,
                    )
                )

        if inferred_goal is None:
            goals = budget_repos["goal"].get_goals(budget_profile.id)
            for goal in goals:
                if goal.goal_type == GoalType.RETIREMENT and goal.suggested_monthly_contribution:
                    inferred_goal = goal.suggested_monthly_contribution
                    goal_source_override = "budget_goal"
                    break

    inputs = ProjectionInputs(
        current_age=payload.current_age,
        retirement_age=payload.retirement_age,
        current_savings=payload.current_savings,
        monthly_contribution=payload.monthly_contribution,
        annual_growth_rate=payload.expected_growth_rate / 100.0,
        inflation_rate=payload.inflation_rate / 100.0,
        include_va_income=payload.include_va_income,
        retirement_income_goal=inferred_goal,
        budget_surplus=budget_surplus,
        savings_rate=savings_rate,
        va_income_monthly=va_income_monthly,
    )

    result = engine.project(inputs)
    if goal_source_override:
        result.goal_context["goal_source"] = goal_source_override

    profile_context = ProfileContext(
        veteran_id=veteran.id,
        name=f"{veteran.first_name} {veteran.last_name}",
        service_branch=veteran.service_branch.value,
        disability_rating=veteran.disability_rating,
        calculated_age=_calculate_age(veteran.date_of_birth),
    )

    budget_context = BudgetContext(
        monthly_net_cashflow=round(budget_surplus, 2),
        savings_rate=savings_rate,
    )

    inputs_used = {
        "current_age": payload.current_age,
        "retirement_age": payload.retirement_age,
        "current_savings": round(payload.current_savings, 2),
        "effective_monthly_contribution": result.effective_monthly_contribution,
        "expected_growth_rate": payload.expected_growth_rate,
        "inflation_rate": payload.inflation_rate,
    }

    chart_data_dict = result.chart_data
    chart_data = ChartData(
        savings_growth=[RetirementChartPoint(**point) for point in chart_data_dict.get("savings_growth", [])],
        income_comparison=[ChartBar(**bar) for bar in chart_data_dict.get("income_comparison", [])],
        contribution_breakdown=[ChartBar(**bar) for bar in chart_data_dict.get("contribution_breakdown", [])],
    )

    response = RetirementProjectionResponse(
    )

    return response


@router.post("/budget/{veteran_id}", response_model=RetirementBudgetResponse, status_code=status.HTTP_200_OK)
def plan_retirement_budget(
    veteran_id: str,
    payload: RetirementBudgetRequest,
    db: Session = Depends(get_db),
) -> RetirementBudgetResponse:
    """Link budget data, multi-account growth, and income streams for a holistic view."""

    repos = get_repositories(db)
    veteran = repos.veterans.get_by_id(veteran_id)
    if not veteran:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Veteran {veteran_id} not found",
        )

    if not payload.accounts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one investment account is required")

    budget_repos = get_budget_repositories(db)
    budget_profile = budget_repos["budget"].get_budget_profile(veteran_id)

    monthly_surplus = payload.monthly_budget_surplus
    if monthly_surplus is None and budget_profile:
        monthly_surplus = budget_profile.monthly_net_cashflow

    savings_rate = payload.savings_rate
    if savings_rate is None and budget_profile:
        savings_rate = budget_profile.savings_rate

    years_to_retirement = max(payload.retirement_age - payload.current_age, 0)
    inflation_rate = payload.inflation_rate / 100.0

    account_projections, total_future_value, total_real_value = _project_accounts(payload.accounts, years_to_retirement, inflation_rate)

    years_in_retirement = engine.DEFAULT_RETIREMENT_DURATION_YEARS or 25
    drawdown_monthly = (
        total_real_value / (years_in_retirement * 12)
        if years_in_retirement > 0
        else total_real_value
    )

    income_streams = [
        IncomeStream(name="VA Disability", monthly_amount=round(payload.va_disability_income, 2)),
        IncomeStream(name="Military Retirement", monthly_amount=round(payload.military_retirement_income, 2)),
        IncomeStream(name="Social Security", monthly_amount=round(payload.social_security_income, 2)),
    ]
    total_income_streams = sum(stream.monthly_amount for stream in income_streams)

    monthly_income = drawdown_monthly + total_income_streams
    monthly_goal = payload.retirement_income_goal
    shortfall = max(monthly_goal - monthly_income, 0.0)

    readiness_score, _, readiness_band = engine._readiness_score(
        real_future_value=total_real_value,
        monthly_income=monthly_income,
        monthly_goal=monthly_goal,
        savings_rate=savings_rate,
        years_to_retirement=years_to_retirement,
        effective_contribution=sum(acc.monthly_contribution for acc in payload.accounts),
    )

    goal_progress = 0.0 if monthly_goal <= 0 else min(monthly_income / monthly_goal, 1.0)

    summary = RetirementBudgetSummary(
        projected_savings=round(total_future_value, 2),
        projected_savings_real=round(total_real_value, 2),
        monthly_income=round(monthly_income, 2),
        monthly_goal=round(monthly_goal, 2),
        shortfall=round(shortfall, 2),
        readiness_score=readiness_score,
        readiness_band=readiness_band,
        goal_progress=round(goal_progress, 4),
    )

    chart_data = RetirementBudgetChart(
        savings_curve=_build_budget_curve(payload.accounts, years_to_retirement, inflation_rate, payload.current_age),
        income_mix=_build_income_mix(drawdown_monthly, income_streams),
    )

    budget_context = BudgetContext(
        monthly_net_cashflow=round((monthly_surplus or 0.0), 2),
        savings_rate=savings_rate,
    )

    insights = _build_budget_insights(account_projections, income_streams, summary, years_to_retirement)
    goals = _build_budget_goals(summary, budget_context, years_to_retirement)

    return RetirementBudgetResponse(
        veteran_id=veteran.id,
        years_to_retirement=years_to_retirement,
        summary=summary,
        accounts=account_projections,
        income_streams=income_streams,
        budget_link=budget_context,
        chart_data=chart_data,
        insights=insights,
        goals=goals,
    )


def _calculate_age(date_of_birth: datetime) -> int:
    """Calculate age from a datetime of birth."""

    today = datetime.utcnow().date()
    dob = date_of_birth.date() if isinstance(date_of_birth, datetime) else date_of_birth
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _normalize_income_amount(monthly_amount: float, is_irregular: bool, annual_amount: float | None) -> float:
    """Normalize income to a monthly value."""

    if is_irregular and annual_amount:
        return annual_amount / 12
    return monthly_amount or 0.0


def _project_accounts(
    accounts: List[InvestmentAccountInput],
    years_to_retirement: int,
    inflation_rate: float,
) -> tuple[List[InvestmentAccountProjection], float, float]:
    """Compound each account independently and aggregate totals."""

    months = years_to_retirement * 12
    inflation_adjustment = (1 + inflation_rate) ** years_to_retirement if years_to_retirement else 1

    projections_raw: List[dict] = []
    total_future = 0.0
    total_real = 0.0

    for account in accounts:
        monthly_rate = max(account.annual_growth_rate / 100.0, 0.0) / 12
        future_value, contribution_component, current_component = engine._future_value(
            account.balance,
            account.monthly_contribution,
            monthly_rate,
            months,
        )
        inflation_adjusted = future_value / inflation_adjustment if inflation_adjustment else future_value

        total_future += future_value
        total_real += inflation_adjusted

        projections_raw.append(
            {
                "name": account.name,
                "starting_balance": round(account.balance, 2),
                "monthly_contribution": round(account.monthly_contribution, 2),
                "annual_growth_rate": account.annual_growth_rate,
                "projected_balance": round(future_value, 2),
                "inflation_adjusted_balance": round(inflation_adjusted, 2),
                "contribution_component": round(contribution_component, 2),
                "current_component": round(current_component, 2),
            }
        )

    projections: List[InvestmentAccountProjection] = []
    for raw in projections_raw:
        share = 0.0 if total_future == 0 else raw["projected_balance"] / total_future
        projections.append(InvestmentAccountProjection(**raw, share_of_total=round(share, 4)))

    return projections, total_future, total_real


def _build_budget_curve(
    accounts: List[InvestmentAccountInput],
    years_to_retirement: int,
    inflation_rate: float,
    current_age: int,
) -> List[RetirementChartPoint]:
    """Generate combined projection curve across all investment accounts."""

    points: List[RetirementChartPoint] = []
    for year in range(years_to_retirement + 1):
        months = year * 12
        total_balance = 0.0
        for account in accounts:
            monthly_rate = max(account.annual_growth_rate / 100.0, 0.0) / 12
            total_balance += engine._balance_at_month(
                account.balance,
                account.monthly_contribution,
                monthly_rate,
                months,
            )
        inflation_adjustment = (1 + inflation_rate) ** year if year else 1
        real_balance = total_balance / inflation_adjustment if inflation_adjustment else total_balance
        points.append(
            RetirementChartPoint(
                age=current_age + year,
                balance=round(total_balance, 2),
                inflation_adjusted_balance=round(real_balance, 2),
            )
        )

    return points


def _build_income_mix(drawdown_income: float, income_streams: List[IncomeStream]) -> List[ChartBar]:
    """Prepare comparison bars showing each income source."""

    bars: List[ChartBar] = [
        ChartBar(label="Investment Drawdown", value=round(drawdown_income, 2)),
    ]
    for stream in income_streams:
        bars.append(ChartBar(label=stream.name, value=round(stream.monthly_amount, 2)))
    return bars


def _build_budget_insights(
    accounts: List[InvestmentAccountProjection],
    income_streams: List[IncomeStream],
    summary: RetirementBudgetSummary,
    years_to_retirement: int,
) -> List[str]:
    """Generate contextual insights for the retirement budget view."""

    insights: List[str] = []
    if accounts:
        lead = max(accounts, key=lambda acc: acc.share_of_total)
        if lead.share_of_total > 0:
            insights.append(
                f"{lead.name} supplies {lead.share_of_total * 100:.1f}% of your future nest egg."
            )

    if summary.monthly_goal > 0:
        coverage = (summary.monthly_income / summary.monthly_goal) * 100
        insights.append(f"Current plan covers {coverage:.0f}% of your monthly goal.")

    if years_to_retirement <= 10 and summary.shortfall > 0:
        insights.append("With less than 10 years remaining, increasing contributions will have outsized impact.")
    else:
        insights.append("Consistent monthly contributions keep compound growth working in your favor.")

    positive_streams = [stream for stream in income_streams if stream.monthly_amount > 0]
    if positive_streams:
        dominant = max(positive_streams, key=lambda stream: stream.monthly_amount)
        insights.append(
            f"{dominant.name} contributes ${dominant.monthly_amount:,.0f} toward retirement income each month."
        )

    # Remove duplicates while preserving order
    unique_insights: List[str] = []
    for item in insights:
        if item not in unique_insights:
            unique_insights.append(item)
    return unique_insights


def _build_budget_goals(
    summary: RetirementBudgetSummary,
    budget_context: BudgetContext,
    years_to_retirement: int,
) -> List[str]:
    """Create actionable goals grounded in readiness metrics."""

    goals: List[str] = []
    if summary.shortfall > 0:
        goals.append(
            f"Close the ${summary.shortfall:,.0f} monthly gap by raising contributions or delaying retirement by 1-2 years."
        )

    if budget_context.monthly_net_cashflow > 0:
        goals.append(
            f"Redirect at least ${budget_context.monthly_net_cashflow:,.0f} of monthly surplus into your highest-growth account."
        )

    if budget_context.savings_rate is not None and budget_context.savings_rate < 15:
        goals.append("Increase your savings rate toward 15% to hit the DoD readiness benchmark.")
    elif summary.readiness_score >= 70:
        goals.append("Maintain contributions to stay within the on-track readiness band.")

    if not goals:
        goals.append("Review allocations annually to keep your plan aligned with mission goals.")

    return goals
