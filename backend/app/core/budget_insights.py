"""
Budget Insights and Scenario Simulator Engine
Generates financial insights, recommendations, and scenario simulations
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from backend.app.models.database import (
    BudgetProfile, IncomeSource, ExpenseItem, SubscriptionItem,
    ExpenseCategoryType, IncomeSourceType
)


class InsightsEngine:
    """Generates financial insights and recommendations"""

    def __init__(self, db: Session):
        self.db = db

    def generate_insights(self, budget_profile: BudgetProfile) -> Dict[str, Any]:
        """Generate comprehensive financial insights"""
        insights = {
            'savings_rate': budget_profile.savings_rate,
            'spending_trend': self._analyze_spending_trend(budget_profile),
            'emergency_fund_months': self._calculate_emergency_fund_months(budget_profile),
            'spending_alerts': self._generate_spending_alerts(budget_profile),
            'category_insights': self._analyze_categories(budget_profile),
            'subscription_waste': self._detect_subscription_waste(budget_profile),
            'recommendations': self._generate_recommendations(budget_profile),
            'veteran_specific_insights': self._generate_veteran_insights(budget_profile)
        }
        return insights

    def _analyze_spending_trend(self, budget_profile: BudgetProfile) -> str:
        """Analyze spending trend"""
        # In production, would analyze historical data
        if budget_profile.monthly_expense_total > budget_profile.monthly_income_total * 0.8:
            return "Increasing"
        elif budget_profile.monthly_expense_total < budget_profile.monthly_income_total * 0.5:
            return "Decreasing"
        else:
            return "Stable"

    def _calculate_emergency_fund_months(self, budget_profile: BudgetProfile) -> float:
        """Calculate months of expenses covered by emergency fund (if available)"""
        # In production, would check savings account balance
        # For now, use simple heuristic based on savings rate
        if budget_profile.savings_rate < 10:
            return 0.5
        elif budget_profile.savings_rate < 20:
            return 1.0
        else:
            return (budget_profile.savings_rate / 100) * 12

    def _generate_spending_alerts(self, budget_profile: BudgetProfile) -> List[Dict]:
        """Generate spending alerts"""
        alerts = []

        # Alert if expenses exceed 90% of income
        expense_ratio = (budget_profile.monthly_expense_total / budget_profile.monthly_income_total
                        if budget_profile.monthly_income_total > 0 else 0)
        if expense_ratio > 0.9:
            alerts.append({
                'type': 'high_expense_ratio',
                'severity': 'critical',
                'message': f'Expenses are {expense_ratio*100:.0f}% of income. Consider reducing spending.',
                'amount': budget_profile.monthly_expense_total - (budget_profile.monthly_income_total * 0.9)
            })

        # Alert if negative cashflow
        if budget_profile.monthly_net_cashflow < 0:
            alerts.append({
                'type': 'negative_cashflow',
                'severity': 'critical',
                'message': f'Monthly deficit of ${abs(budget_profile.monthly_net_cashflow):.2f}. Spending exceeds income.',
                'amount': abs(budget_profile.monthly_net_cashflow)
            })

        # Alert if low savings rate
        if budget_profile.savings_rate < 5:
            alerts.append({
                'type': 'low_savings_rate',
                'severity': 'warning',
                'message': f'Savings rate is {budget_profile.savings_rate:.1f}%. Aim for 10-20%.',
                'target_rate': 15.0
            })

        return alerts

    def _analyze_categories(self, budget_profile: BudgetProfile) -> Dict[str, Any]:
        """Analyze spending by category"""
        expenses = self.db.query(ExpenseItem).filter_by(
            budget_profile_id=budget_profile.id
        ).all()

        category_totals = {}
        for expense in expenses:
            category = expense.category.value
            if category not in category_totals:
                category_totals[category] = {'amount': 0.0, 'count': 0}
            category_totals[category]['amount'] += expense.monthly_amount
            category_totals[category]['count'] += 1

        # Add percentages
        total_expenses = budget_profile.monthly_expense_total
        for category in category_totals:
            category_totals[category]['percentage'] = (
                (category_totals[category]['amount'] / total_expenses * 100)
                if total_expenses > 0 else 0
            )

        return category_totals

    def _detect_subscription_waste(self, budget_profile: BudgetProfile) -> float:
        """Detect unused subscriptions and waste"""
        subscriptions = self.db.query(SubscriptionItem).filter_by(
            budget_profile_id=budget_profile.id
        ).all()

        waste = 0.0
        for sub in subscriptions:
            # Flag subscriptions with low or no usage
            if sub.usage_level in ['Low', 'None']:
                waste += sub.monthly_cost

        return waste

    def _generate_recommendations(self, budget_profile: BudgetProfile) -> List[Dict]:
        """Generate financial recommendations"""
        recommendations = []

        # Recommendation: Reduce subscriptions
        waste = self._detect_subscription_waste(budget_profile)
        if waste > 0:
            recommendations.append({
                'priority': 'high',
                'category': 'subscriptions',
                'title': 'Cancel unused subscriptions',
                'description': f'You could save ${waste:.2f}/month by canceling low-usage subscriptions.',
                'potential_savings': waste,
                'action': 'Review subscriptions marked as Low or None usage'
            })

        # Recommendation: Build emergency fund
        if budget_profile.savings_rate > 10:
            recommendations.append({
                'priority': 'high',
                'category': 'savings',
                'title': 'Build 3-6 month emergency fund',
                'description': 'Having 3-6 months of expenses saved provides financial security.',
                'action': 'Set up automatic transfers to savings account'
            })

        # Recommendation: Debt payoff strategy
        debt_expenses = self.db.query(ExpenseItem).filter_by(
            budget_profile_id=budget_profile.id,
            is_debt_payment=True
        ).all()
        if debt_expenses:
            total_debt_payment = sum(e.monthly_amount for e in debt_expenses)
            recommendations.append({
                'priority': 'high',
                'category': 'debt',
                'title': 'Accelerate debt payoff',
                'description': f'You are paying ${total_debt_payment:.2f}/month toward debt. Consider the avalanche method.',
                'action': 'Apply extra payments to highest interest rate debt first'
            })

        # Recommendation: Increase income
        if budget_profile.savings_rate < 15:
            recommendations.append({
                'priority': 'medium',
                'category': 'income',
                'title': 'Explore additional income sources',
                'description': 'Increasing income could significantly improve financial security.',
                'action': 'Consider side income or career advancement opportunities'
            })

        return recommendations

    def _generate_veteran_insights(self, budget_profile: BudgetProfile) -> List[Dict]:
        """Generate veteran-specific financial insights"""
        insights = []

        # Check for VA disability compensation
        income_sources = self.db.query(IncomeSource).filter_by(
            budget_profile_id=budget_profile.id,
            source_type=IncomeSourceType.VA_DISABILITY
        ).all()

        if income_sources:
            insights.append({
                'title': 'VA Disability Compensation',
                'description': 'Your VA disability compensation is tax-free income.',
                'action': 'Ensure your tax filing reflects non-taxable income'
            })
        else:
            insights.append({
                'title': 'Check VA Benefits Eligibility',
                'description': 'As a veteran, you may qualify for additional VA benefits.',
                'action': 'Visit VA.gov or contact your local VA office'
            })

        # GI Bill housing
        gi_bill_sources = self.db.query(IncomeSource).filter_by(
            budget_profile_id=budget_profile.id,
            source_type=IncomeSourceType.GI_BILL_HOUSING
        ).all()

        if gi_bill_sources:
            total_gi_housing = sum(s.monthly_amount for s in gi_bill_sources)
            insights.append({
                'title': 'Optimize GI Bill Housing',
                'description': f'You are receiving ${total_gi_housing:.2f}/month in GI Bill housing allowance.',
                'action': 'Ensure housing costs are optimized; you may have flexibility in location'
            })

        # Military retirement planning
        insights.append({
            'title': 'Military Retirement Planning',
            'description': 'Veterans with 20+ years of service should plan for retirement pay implications.',
            'action': 'Consider consulting with a military financial advisor'
        })

        return insights


class ScenarioSimulator:
    """Simulates financial scenarios and "what-if" analysis"""

    def __init__(self, db: Session):
        self.db = db

    def simulate_scenario(
        self,
        budget_profile: BudgetProfile,
        income_change: float = 0.0,
        expense_change: float = 0.0,
        expense_reduction_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Simulate a financial scenario

        Args:
            budget_profile: The budget profile to simulate
            income_change: Absolute income change (e.g., +500 for $500 more)
            expense_change: Absolute expense change (e.g., -200 for $200 less)
            expense_reduction_category: Reduce specific category by percentage

        Returns:
            Dictionary with simulated results
        """
        # Current state
        current_income = budget_profile.monthly_income_total
        current_expenses = budget_profile.monthly_expense_total

        # Simulated state
        sim_income = current_income + income_change
        sim_expenses = current_expenses + expense_change

        # Calculate simulated metrics
        sim_net = sim_income - sim_expenses
        sim_savings_rate = (sim_net / sim_income * 100) if sim_income > 0 else 0.0

        # Goal impact
        goals = self.db.query(SavingsGoal).filter_by(
            budget_profile_id=budget_profile.id
        ).all()

        goal_impact = []
        for goal in goals:
            if sim_savings_rate > 0:
                monthly_contribution = sim_income * (sim_savings_rate / 100)
                months_to_goal = (goal.target_amount - goal.current_amount) / monthly_contribution if monthly_contribution > 0 else 999
                projected_date = datetime.utcnow() + timedelta(days=months_to_goal * 30)
                goal_impact.append({
                    'goal_id': goal.id,
                    'goal_name': goal.name,
                    'months_to_completion': months_to_goal,
                    'projected_completion': projected_date.isoformat()
                })

        return {
            'scenario_description': self._describe_scenario(income_change, expense_change),
            'simulated_monthly_income': sim_income,
            'simulated_monthly_expenses': sim_expenses,
            'simulated_net_cashflow': sim_net,
            'simulated_savings_rate': sim_savings_rate,
            'vs_current': {
                'income_change': income_change,
                'expense_change': expense_change,
                'cashflow_change': sim_net - budget_profile.monthly_net_cashflow,
                'savings_rate_change': sim_savings_rate - budget_profile.savings_rate
            },
            'goal_impact': goal_impact
        }

    def _describe_scenario(self, income_change: float, expense_change: float) -> str:
        """Create human-readable scenario description"""
        parts = []
        if income_change > 0:
            parts.append(f"Income increases by ${income_change:.2f}")
        elif income_change < 0:
            parts.append(f"Income decreases by ${abs(income_change):.2f}")

        if expense_change > 0:
            parts.append(f"Expenses increase by ${expense_change:.2f}")
        elif expense_change < 0:
            parts.append(f"Expenses decrease by ${abs(expense_change):.2f}")

        return " and ".join(parts) if parts else "No changes"


# Importing at end to avoid circular imports
from backend.app.models.database import SavingsGoal
