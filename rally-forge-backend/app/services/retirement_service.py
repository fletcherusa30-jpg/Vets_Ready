"""Retirement planning service with AI-powered recommendations"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.user import User


class RetirementService:
    """Service for military retirement calculations and planning"""

    def __init__(self, db: Session):
        self.db = db

    # ===== MILITARY RETIREMENT ELIGIBILITY =====

    def calculate_retirement_eligibility(self, years_of_service: int, rank: str, branch: str) -> Dict[str, Any]:
        """
        Calculate military retirement eligibility

        Military retirement: 20+ years of service at 50% base pay
        """
        eligible = years_of_service >= 20
        years_to_retirement = max(0, 20 - years_of_service)

        return {
            "eligible_for_retirement": eligible,
            "years_of_service": years_of_service,
            "years_to_retirement": years_to_retirement,
            "retirement_percentage": min(years_of_service * 2.5, 100),  # 2.5% per year
            "rank": rank,
            "branch": branch,
            "eligibility_date": self._calculate_retirement_date(years_of_service),
        }

    def _calculate_retirement_date(self, years_of_service: int) -> Optional[str]:
        """Calculate estimated retirement date"""
        if years_of_service >= 20:
            return (datetime.now()).strftime("%Y-%m-%d")
        years_remaining = 20 - years_of_service
        retirement_date = datetime.now() + timedelta(days=years_remaining * 365)
        return retirement_date.strftime("%Y-%m-%d")

    # ===== PENSION CALCULATIONS =====

    def calculate_monthly_pension(self, base_pay: float, years_of_service: int,
                                 disability_rating: int = 0) -> Dict[str, Any]:
        """
        Calculate monthly military retirement pension

        Formula: (Base Pay) × (Years of Service × 2.5%) = Monthly Pension
        Disability rating may increase benefits via VA concurrent receipt
        """
        if years_of_service < 20:
            return {
                "eligible": False,
                "message": f"Need {20 - years_of_service} more years of service",
                "monthly_pension": 0,
                "annual_pension": 0,
            }

        retirement_multiplier = min((years_of_service * 2.5) / 100, 1.0)
        monthly_pension = base_pay * retirement_multiplier
        annual_pension = monthly_pension * 12

        # VA Concurrent Receipt (CRDP/CRSC) - receive both military pension + VA disability
        va_disability_monthly = self._estimate_va_benefits(disability_rating)

        return {
            "eligible": True,
            "years_of_service": years_of_service,
            "base_pay": base_pay,
            "retirement_percentage": retirement_multiplier * 100,
            "monthly_pension": round(monthly_pension, 2),
            "annual_pension": round(annual_pension, 2),
            "monthly_va_disability": round(va_disability_monthly, 2),
            "total_monthly_income": round(monthly_pension + va_disability_monthly, 2),
            "total_annual_income": round((monthly_pension + va_disability_monthly) * 12, 2),
            "cola_multiplier": self._get_cola_adjustment(),  # Cost of Living Adjustment
        }

    def _estimate_va_benefits(self, disability_rating: int) -> float:
        """
        Estimate monthly VA disability payment
        Based on 2024 VA rates (approximate)
        """
        va_rates = {
            0: 0,
            10: 230,
            20: 450,
            30: 700,
            40: 1100,
            50: 1700,
            60: 2100,
            70: 2800,
            80: 3500,
            90: 4200,
            100: 5000,
        }
        return va_rates.get(disability_rating, 0)

    def _get_cola_adjustment(self) -> float:
        """Get Cost of Living Adjustment multiplier"""
        # 2024 COLA: 8.7% (historical data)
        # For realistic simulation, could be 2-3% per year
        return 1.087

    # ===== MONTHLY BUDGET CALCULATOR =====

    def calculate_monthly_budget(self, user_id: str, monthly_income: float,
                                expenses: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculate monthly budget with income vs expenses
        """
        total_expenses = sum(expenses.values())
        surplus_deficit = monthly_income - total_expenses
        savings_rate = (surplus_deficit / monthly_income * 100) if monthly_income > 0 else 0

        expense_breakdown = {
            category: {
                "amount": amount,
                "percentage_of_income": (amount / monthly_income * 100) if monthly_income > 0 else 0
            }
            for category, amount in expenses.items()
        }

        return {
            "monthly_income": round(monthly_income, 2),
            "total_expenses": round(total_expenses, 2),
            "surplus_deficit": round(surplus_deficit, 2),
            "savings_rate": round(savings_rate, 2),
            "expense_breakdown": expense_breakdown,
            "budget_status": "HEALTHY" if surplus_deficit > 0 else "NEEDS ADJUSTMENT",
            "recommendations": self._generate_budget_recommendations(
                monthly_income, total_expenses, expenses
            ),
        }

    def _generate_budget_recommendations(self, income: float, expenses: float,
                                        breakdown: Dict[str, float]) -> List[str]:
        """Generate AI-powered budget recommendations"""
        recommendations = []

        if expenses > income:
            recommendations.append("⚠️ Expenses exceed income - consider reducing discretionary spending")
            recommendations.append("Review housing costs (should be <30% of income)")
            recommendations.append("Consider debt consolidation if applicable")

        # Check expense ratios (recommended percentages)
        if breakdown.get("housing", 0) / income > 0.30:
            recommendations.append("💰 Housing costs >30% of income - consider downsizing")

        if breakdown.get("food", 0) / income > 0.12:
            recommendations.append("🍽️ Food budget >12% of income - meal planning can help")

        if breakdown.get("transportation", 0) / income > 0.15:
            recommendations.append("🚗 Transportation >15% of income - review vehicle costs")

        # Savings recommendations
        surplus = income - expenses
        if surplus > 0:
            if surplus < income * 0.05:
                recommendations.append(f"💡 You're saving {(surplus/income*100):.1f}% - aim for 10-20%")
            else:
                recommendations.append(f"✅ Great job! You're saving {(surplus/income*100):.1f}% of income")
                recommendations.append("Consider emergency fund (3-6 months expenses)")
                recommendations.append("Explore investment options for retirement growth")

        return recommendations

    # ===== RETIREMENT PLANNING SCENARIOS =====

    def project_retirement_lifestyle(self, monthly_income: float, life_expectancy_years: int = 25,
                                    inflation_rate: float = 0.03) -> Dict[str, Any]:
        """
        Project lifestyle throughout retirement years
        """
        months = life_expectancy_years * 12
        total_income = 0
        yearly_breakdown = []

        for year in range(life_expectancy_years):
            # Adjust income for inflation
            yearly_income = monthly_income * 12 * ((1 + inflation_rate) ** year)
            total_income += yearly_income

            yearly_breakdown.append({
                "year": year + 1,
                "annual_income": round(yearly_income, 2),
                "cumulative_income": round(total_income, 2),
                "inflation_adjusted": year > 0,
            })

        return {
            "life_expectancy_years": life_expectancy_years,
            "inflation_rate": inflation_rate * 100,
            "total_projected_income": round(total_income, 2),
            "average_annual_income": round(total_income / life_expectancy_years, 2),
            "yearly_breakdown": yearly_breakdown,
        }

    # ===== AI RETIREMENT RECOMMENDATIONS =====

    def generate_retirement_guide(self, user_id: str, eligibility: Dict[str, Any],
                                 pension: Dict[str, Any], budget: Dict[str, Any],
                                 disability_rating: int = 0) -> Dict[str, Any]:
        """
        Generate AI-powered personalized retirement guide
        """
        recommendations = []
        action_items = []
        warnings = []

        # Eligibility-based recommendations
        if not eligibility["eligible_for_retirement"]:
            action_items.append({
                "priority": "HIGH",
                "action": f"Continue service for {eligibility['years_to_retirement']} more years",
                "reason": "Reach 20-year mark for military pension eligibility"
            })
        else:
            recommendations.append("✅ You're eligible for military retirement pension")

        # Pension optimization
        if disability_rating > 0:
            recommendations.append(
                f"💪 You have a {disability_rating}% disability rating - you qualify for VA concurrent receipt"
            )
            recommendations.append(
                f"📊 You'll receive both military pension AND VA disability benefits (${pension['total_monthly_income']}/month)"
            )

        # Budget analysis
        if budget["surplus_deficit"] < 0:
            warnings.append(f"⚠️ Monthly deficit of ${abs(budget['surplus_deficit']):,.2f} - not sustainable")
            action_items.append({
                "priority": "CRITICAL",
                "action": "Reduce expenses or increase income",
                "reason": "Current budget is unsustainable in long-term retirement"
            })
        elif budget["surplus_deficit"] > 0:
            recommendations.append(
                f"✅ Monthly surplus: ${budget['surplus_deficit']:,.2f} - good retirement position"
            )

        # Healthcare recommendations
        action_items.append({
            "priority": "HIGH",
            "action": "Understand your healthcare benefits",
            "reason": "TRICARE for life at 65+, VA healthcare, Medicare coordination"
        })

        # Savings strategy
        action_items.append({
            "priority": "MEDIUM",
            "action": "Build 6-12 months emergency fund",
            "reason": "Medical emergencies and unexpected expenses in retirement"
        })

        # Tax planning
        action_items.append({
            "priority": "MEDIUM",
            "action": "Consult tax professional for retirement tax planning",
            "reason": "Military pension and VA disability have specific tax implications"
        })

        return {
            "personalized_summary": self._generate_summary(eligibility, pension, budget),
            "key_recommendations": recommendations,
            "action_items": action_items,
            "warnings": warnings,
            "retirement_score": self._calculate_retirement_readiness(eligibility, pension, budget),
            "next_steps": [
                "1. Review military SBP (Survivor Benefit Plan) options",
                "2. Update SGLI beneficiaries if applicable",
                "3. Enroll in healthcare benefits before separation",
                "4. Create detailed budget for first year of retirement",
                "5. Consult financial advisor for long-term planning",
            ]
        }

    def _generate_summary(self, eligibility: Dict[str, Any], pension: Dict[str, Any],
                         budget: Dict[str, Any]) -> str:
        """Generate personalized retirement summary"""
        if not eligibility["eligible_for_retirement"]:
            return (
                f"Continue your service for {eligibility['years_to_retirement']} more years. "
                f"Once you reach 20 years, you'll be eligible for a military pension. "
                f"Start planning your transition now."
            )

        if pension.get("total_monthly_income", 0) > 0:
            return (
                f"Congratulations! You're eligible for retirement with a monthly income of "
                f"${pension['total_monthly_income']:,.0f}. "
                f"Your monthly budget shows a "
                f"{'surplus' if budget['surplus_deficit'] > 0 else 'deficit'} of "
                f"${abs(budget['surplus_deficit']):,.0f}. "
                f"You're on track for a comfortable retirement."
            )

        return "Review your retirement plan with a financial advisor."

    def _calculate_retirement_readiness(self, eligibility: Dict[str, Any],
                                       pension: Dict[str, Any], budget: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate retirement readiness score (0-100)"""
        score = 0
        factors = {}

        # Eligibility factor (30 points)
        if eligibility["eligible_for_retirement"]:
            score += 30
            factors["eligibility"] = 30
        else:
            factors["eligibility"] = max(0, 20 - eligibility["years_to_retirement"] / 2)

        # Income factor (40 points)
        if pension.get("total_monthly_income", 0) > 3000:
            score += 40
            factors["income"] = 40
        elif pension.get("total_monthly_income", 0) > 2000:
            score += 30
            factors["income"] = 30
        else:
            factors["income"] = 15

        # Budget factor (30 points)
        if budget["surplus_deficit"] > 0:
            score += 30
            factors["budget"] = 30
        elif budget["surplus_deficit"] > -500:
            score += 15
            factors["budget"] = 15

        return {
            "overall_score": min(score, 100),
            "factors": factors,
            "rating": self._score_to_rating(min(score, 100)),
            "feedback": self._score_to_feedback(min(score, 100))
        }

    def _score_to_rating(self, score: int) -> str:
        """Convert score to rating"""
        if score >= 85:
            return "EXCELLENT"
        elif score >= 70:
            return "GOOD"
        elif score >= 50:
            return "FAIR"
        else:
            return "NEEDS WORK"

    def _score_to_feedback(self, score: int) -> str:
        """Generate feedback based on score"""
        if score >= 85:
            return "You're in excellent retirement readiness. You have strong financial foundation."
        elif score >= 70:
            return "Good position for retirement. Some areas could use improvement."
        elif score >= 50:
            return "Fair position. Work on building emergency fund and income."
        else:
            return "You need to focus on financial stability before retirement."

    # ===== HELPER CALCULATIONS =====

    def calculate_smc_eligibility(self, disability_rating: int, dependent_count: int = 0) -> Dict[str, Any]:
        """
        Calculate SMC (Special Monthly Compensation) eligibility
        """
        smc_rates = {
            100: {"base": 520, "per_dependent": 100},
            90: {"base": 320, "per_dependent": 50},
            80: {"base": 200, "per_dependent": 30},
            70: {"base": 120, "per_dependent": 20},
        }

        base_rate = smc_rates.get(disability_rating, {}).get("base", 0)
        dependent_bonus = dependent_count * smc_rates.get(disability_rating, {}).get("per_dependent", 0)

        return {
            "eligible_for_smc": disability_rating >= 70,
            "disability_rating": disability_rating,
            "base_smc_monthly": base_rate,
            "dependent_bonus": dependent_bonus,
            "total_smc_monthly": base_rate + dependent_bonus,
            "total_smc_annual": (base_rate + dependent_bonus) * 12,
        }
