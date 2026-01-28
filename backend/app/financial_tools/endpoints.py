"""
Financial Tools REST Endpoints
Budget planning and retirement projection endpoints
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from .models import (
    Budget,
    RetirementInputs,
    RetirementProjection,
    IncomeEntry,
    ExpenseEntry,
    IncomeSource,
    ExpenseCategory,
)


class FinancialToolsEndpoints:
    """Financial planning API endpoints"""

    def __init__(self):
        self.budgets: Dict[str, Budget] = {}
        self.retirement_inputs: Dict[str, RetirementInputs] = {}
        self.retirement_projections: Dict[str, RetirementProjection] = {}

    def create_budget(self, user_id: str, budget_data: Dict[str, Any]) -> Budget:
        """
        POST /budget/create
        Create a new budget plan
        """
        budget = Budget(
            id=f"budget_{user_id}_{datetime.now().timestamp()}",
            user_id=user_id,
            name=budget_data.get("name", "Monthly Budget"),
            period=budget_data.get("period", "monthly"),
            income_entries=self._parse_income_entries(budget_data.get("income", [])),
            expense_entries=self._parse_expense_entries(budget_data.get("expenses", [])),
            notes=budget_data.get("notes", ""),
        )

        # Calculate totals
        budget.total_income = sum(entry.amount for entry in budget.income_entries)
        budget.total_expenses = sum(entry.amount for entry in budget.expense_entries)
        budget.net_income = budget.total_income - budget.total_expenses

        self.budgets[budget.id] = budget
        return budget

    def update_budget(self, budget_id: str, updates: Dict[str, Any]) -> Budget:
        """Update an existing budget"""
        if budget_id not in self.budgets:
            raise ValueError(f"Budget {budget_id} not found")

        budget = self.budgets[budget_id]

        if "name" in updates:
            budget.name = updates["name"]
        if "income" in updates:
            budget.income_entries = self._parse_income_entries(updates["income"])
        if "expenses" in updates:
            budget.expense_entries = self._parse_expense_entries(updates["expenses"])
        if "notes" in updates:
            budget.notes = updates["notes"]

        # Recalculate totals
        budget.total_income = sum(entry.amount for entry in budget.income_entries)
        budget.total_expenses = sum(entry.amount for entry in budget.expense_entries)
        budget.net_income = budget.total_income - budget.total_expenses
        budget.updated_at = datetime.now()

        return budget

    def get_budget(self, budget_id: str) -> Optional[Budget]:
        """Get a budget by ID"""
        return self.budgets.get(budget_id)

    def list_budgets(self, user_id: str) -> List[Budget]:
        """List all budgets for a user"""
        return [b for b in self.budgets.values() if b.user_id == user_id]

    def delete_budget(self, budget_id: str) -> bool:
        """Delete a budget"""
        if budget_id in self.budgets:
            del self.budgets[budget_id]
            return True
        return False

    def create_retirement_plan(self, user_id: str, inputs: Dict[str, Any]) -> RetirementInputs:
        """
        POST /retirement/plan
        Create a retirement planning scenario
        """
        retirement_input = RetirementInputs(
            id=f"retirement_{user_id}_{datetime.now().timestamp()}",
            user_id=user_id,
            current_age=inputs.get("current_age", 30),
            retirement_age=inputs.get("retirement_age", 65),
            life_expectancy=inputs.get("life_expectancy", 90),
            current_savings=inputs.get("current_savings", 0.0),
            annual_contribution=inputs.get("annual_contribution", 0.0),
            expected_return_rate=inputs.get("expected_return_rate", 0.07),
            current_income=inputs.get("current_income", 0.0),
            va_disability_income=inputs.get("va_disability_income", 0.0),
            social_security_estimate=inputs.get("social_security_estimate", 0.0),
            military_retirement_income=inputs.get("military_retirement_income", 0.0),
            inflation_rate=inputs.get("inflation_rate", 0.03),
            lifestyle_expenses=inputs.get("lifestyle_expenses", 0.0),
            healthcare_expenses=inputs.get("healthcare_expenses", 0.0),
        )

        self.retirement_inputs[retirement_input.id] = retirement_input

        # Generate projection
        projection = self._calculate_projection(retirement_input)
        self.retirement_projections[retirement_input.id] = projection

        return retirement_input

    def get_retirement_projection(self, plan_id: str) -> Optional[RetirementProjection]:
        """Get retirement projection for a plan"""
        return self.retirement_projections.get(plan_id)

    def calculate_savings_goal(
        self,
        target_amount: float,
        years: int,
        current_savings: float,
        annual_return: float = 0.07,
    ) -> Dict[str, Any]:
        """
        Calculate required monthly savings to reach a goal
        """
        # Using future value of annuity formula
        monthly_rate = annual_return / 12
        months = years * 12

        # Calculate future value of current savings
        future_current = current_savings * ((1 + annual_return) ** years)

        # Calculate required annuity
        remaining = target_amount - future_current
        if monthly_rate == 0:
            monthly_contribution = remaining / months
        else:
            monthly_contribution = remaining / (((1 + monthly_rate) ** months - 1) / monthly_rate)

        return {
            "target_amount": target_amount,
            "years": years,
            "monthly_contribution": max(0, monthly_contribution),
            "total_contributions": max(0, monthly_contribution * months),
            "investment_growth": max(0, target_amount - current_savings - monthly_contribution * months),
        }

    def analyze_spending(self, budget_id: str) -> Dict[str, Any]:
        """Analyze spending patterns"""
        if budget_id not in self.budgets:
            raise ValueError(f"Budget {budget_id} not found")

        budget = self.budgets[budget_id]

        # Group expenses by category
        expenses_by_category = {}
        for expense in budget.expense_entries:
            category = expense.category.value
            if category not in expenses_by_category:
                expenses_by_category[category] = 0
            expenses_by_category[category] += expense.amount

        # Calculate percentages
        total = budget.total_expenses or 1
        percentages = {cat: (amount / total) * 100 for cat, amount in expenses_by_category.items()}

        # Get recommendations
        recommendations = self._get_spending_recommendations(expenses_by_category, budget.total_income)

        return {
            "expenses_by_category": expenses_by_category,
            "percentages": percentages,
            "total_income": budget.total_income,
            "total_expenses": budget.total_expenses,
            "savings_rate": ((budget.total_income - budget.total_expenses) / budget.total_income * 100)
            if budget.total_income > 0
            else 0,
            "recommendations": recommendations,
        }

    # Private helper methods

    def _parse_income_entries(self, income_data: List[Dict]) -> List[IncomeEntry]:
        """Parse income data"""
        entries = []
        for inc in income_data:
            entry = IncomeEntry(
                source=IncomeSource(inc.get("source", "employment")),
                amount=inc.get("amount", 0.0),
                frequency=inc.get("frequency", "monthly"),
                is_recurring=inc.get("is_recurring", True),
                notes=inc.get("notes"),
            )
            entries.append(entry)
        return entries

    def _parse_expense_entries(self, expense_data: List[Dict]) -> List[ExpenseEntry]:
        """Parse expense data"""
        entries = []
        for exp in expense_data:
            entry = ExpenseEntry(
                category=ExpenseCategory(exp.get("category", "other")),
                amount=exp.get("amount", 0.0),
                frequency=exp.get("frequency", "monthly"),
                is_recurring=exp.get("is_recurring", True),
                notes=exp.get("notes"),
            )
            entries.append(entry)
        return entries

    def _calculate_projection(self, inputs: RetirementInputs) -> RetirementProjection:
        """Calculate retirement projection"""
        years_to_retirement = inputs.retirement_age - inputs.current_age
        years_in_retirement = inputs.life_expectancy - inputs.retirement_age

        # Calculate savings at retirement
        annual_return = inputs.expected_return_rate
        savings_growth = inputs.current_savings * ((1 + annual_return) ** years_to_retirement)

        # Add contributions
        if annual_return == 0:
            contribution_growth = inputs.annual_contribution * years_to_retirement
        else:
            contribution_growth = inputs.annual_contribution * (
                ((1 + annual_return) ** years_to_retirement - 1) / annual_return
            )

        projected_savings = savings_growth + contribution_growth

        # Calculate retirement income
        annual_income = (
            inputs.va_disability_income
            + inputs.social_security_estimate
            + inputs.military_retirement_income
            + (projected_savings / years_in_retirement if years_in_retirement > 0 else 0)
        )

        annual_expenses = inputs.lifestyle_expenses + inputs.healthcare_expenses

        # Adjust for inflation
        annual_expenses *= (1 + inputs.inflation_rate) ** years_to_retirement

        shortfall = annual_income - annual_expenses

        # Determine confidence
        if shortfall > 0:
            confidence = "high"
        elif shortfall > -annual_expenses * 0.1:
            confidence = "medium"
        else:
            confidence = "low"

        recommendations = self._get_retirement_recommendations(shortfall, projected_savings, annual_income)

        return RetirementProjection(
            id=f"proj_{inputs.id}",
            user_id=inputs.user_id,
            retirement_age=inputs.retirement_age,
            projected_savings_at_retirement=projected_savings,
            annual_income_at_retirement=annual_income,
            annual_expenses_at_retirement=annual_expenses,
            shortfall_or_surplus=shortfall,
            years_savings_will_last=projected_savings / annual_expenses if annual_expenses > 0 else 0,
            confidence_level=confidence,
            recommendations=recommendations,
        )

    def _get_spending_recommendations(self, expenses_by_category: Dict, income: float) -> List[str]:
        """Get spending recommendations"""
        recommendations = []

        # Check savings rate
        total_expenses = sum(expenses_by_category.values())
        savings_rate = (income - total_expenses) / income if income > 0 else 0

        if savings_rate < 0.1:
            recommendations.append("Aim for at least 10% savings rate")

        # Check housing expense ratio
        housing = expenses_by_category.get("housing", 0)
        if income > 0 and housing / income > 0.3:
            recommendations.append("Housing costs exceed 30% of income - consider reducing")

        # Check debt
        debt = expenses_by_category.get("debt", 0)
        if debt > income * 0.2:
            recommendations.append("Debt payments are high - prioritize debt reduction")

        return recommendations

    def _get_retirement_recommendations(self, shortfall: float, savings: float, income: float) -> List[str]:
        """Get retirement recommendations"""
        recommendations = []

        if shortfall < 0:
            recommendations.append(f"Increase savings by ${abs(shortfall):,.0f} annually to cover shortfall")

        if savings < income * 5:
            recommendations.append("Build emergency fund of 6-12 months expenses")

        recommendations.append("Maximize VA benefits and pension programs")
        recommendations.append("Consult with financial advisor about investment strategy")

        return recommendations
