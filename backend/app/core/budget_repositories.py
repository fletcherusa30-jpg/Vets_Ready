"""
Budget Repository Layer
Handles all data access for budget-related operations
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from uuid import uuid4

from backend.app.models.database import (
    BudgetProfile, IncomeSource, ExpenseItem, SavingsGoal,
    SubscriptionItem, InsightsReport, BudgetStatus, GoalStatus
)


class BudgetRepository:
    """Main budget repository"""

    def __init__(self, db: Session):
        self.db = db

    def create_budget_profile(self, veteran_id: str) -> BudgetProfile:
        """Create new budget profile for veteran"""
        profile = BudgetProfile(
            id=f"BP_{uuid4().hex[:8]}",
            veteran_id=veteran_id,
            status=BudgetStatus.ACTIVE
        )
        self.db.add(profile)
        self.db.commit()
        return profile

    def get_budget_profile(self, veteran_id: str) -> Optional[BudgetProfile]:
        """Get budget profile for veteran"""
        return self.db.query(BudgetProfile).filter(
            BudgetProfile.veteran_id == veteran_id
        ).first()

    def recalculate_budget_totals(self, budget_profile_id: str) -> BudgetProfile:
        """Recalculate all totals for budget profile"""
        profile = self.db.query(BudgetProfile).filter_by(id=budget_profile_id).first()
        if not profile:
            return None

        # Calculate income
        income_sources = self.db.query(IncomeSource).filter_by(
            budget_profile_id=budget_profile_id
        ).all()

        monthly_income = 0.0
        for source in income_sources:
            if source.is_irregular and source.annual_amount:
                monthly_income += source.annual_amount / 12
            else:
                monthly_income += source.monthly_amount

        # Calculate expenses
        expenses = self.db.query(ExpenseItem).filter_by(
            budget_profile_id=budget_profile_id
        ).all()

        monthly_expenses = sum(e.monthly_amount for e in expenses)

        # Calculate net and savings rate
        monthly_net = monthly_income - monthly_expenses
        savings_rate = (monthly_net / monthly_income * 100) if monthly_income > 0 else 0.0

        profile.monthly_income_total = monthly_income
        profile.monthly_expense_total = monthly_expenses
        profile.monthly_net_cashflow = monthly_net
        profile.savings_rate = savings_rate
        profile.last_calculated = datetime.utcnow()

        self.db.commit()
        return profile


class IncomeRepository:
    """Income source repository"""

    def __init__(self, db: Session):
        self.db = db

    def create_income_source(
        self,
        budget_profile_id: str,
        name: str,
        source_type,
        monthly_amount: float,
        is_irregular: bool = False,
        frequency_months: int = 1,
        annual_amount: Optional[float] = None
    ) -> IncomeSource:
        """Create new income source"""
        source = IncomeSource(
            id=f"INC_{uuid4().hex[:8]}",
            budget_profile_id=budget_profile_id,
            name=name,
            source_type=source_type,
            monthly_amount=monthly_amount,
            is_irregular=is_irregular,
            frequency_months=frequency_months,
            annual_amount=annual_amount
        )
        self.db.add(source)
        self.db.commit()
        return source

    def get_income_sources(self, budget_profile_id: str) -> List[IncomeSource]:
        """Get all income sources for budget"""
        return self.db.query(IncomeSource).filter_by(
            budget_profile_id=budget_profile_id
        ).all()

    def update_income_source(self, source_id: str, **kwargs) -> IncomeSource:
        """Update income source"""
        source = self.db.query(IncomeSource).filter_by(id=source_id).first()
        if source:
            for key, value in kwargs.items():
                if hasattr(source, key):
                    setattr(source, key, value)
            source.updated_at = datetime.utcnow()
            self.db.commit()
        return source

    def delete_income_source(self, source_id: str) -> bool:
        """Delete income source"""
        source = self.db.query(IncomeSource).filter_by(id=source_id).first()
        if source:
            self.db.delete(source)
            self.db.commit()
            return True
        return False


class ExpenseRepository:
    """Expense repository"""

    def __init__(self, db: Session):
        self.db = db

    def create_expense(
        self,
        budget_profile_id: str,
        name: str,
        category,
        monthly_amount: float,
        is_fixed: bool = False,
        is_debt_payment: bool = False,
        **kwargs
    ) -> ExpenseItem:
        """Create new expense"""
        expense = ExpenseItem(
            id=f"EXP_{uuid4().hex[:8]}",
            budget_profile_id=budget_profile_id,
            name=name,
            category=category,
            monthly_amount=monthly_amount,
            is_fixed=is_fixed,
            is_debt_payment=is_debt_payment,
            **kwargs
        )
        self.db.add(expense)
        self.db.commit()
        return expense

    def get_expenses(self, budget_profile_id: str) -> List[ExpenseItem]:
        """Get all expenses for budget"""
        return self.db.query(ExpenseItem).filter_by(
            budget_profile_id=budget_profile_id
        ).all()

    def get_expenses_by_category(self, budget_profile_id: str, category) -> List[ExpenseItem]:
        """Get expenses by category"""
        return self.db.query(ExpenseItem).filter_by(
            budget_profile_id=budget_profile_id,
            category=category
        ).all()

    def update_expense(self, expense_id: str, **kwargs) -> ExpenseItem:
        """Update expense"""
        expense = self.db.query(ExpenseItem).filter_by(id=expense_id).first()
        if expense:
            for key, value in kwargs.items():
                if hasattr(expense, key):
                    setattr(expense, key, value)
            expense.updated_at = datetime.utcnow()
            self.db.commit()
        return expense

    def delete_expense(self, expense_id: str) -> bool:
        """Delete expense"""
        expense = self.db.query(ExpenseItem).filter_by(id=expense_id).first()
        if expense:
            self.db.delete(expense)
            self.db.commit()
            return True
        return False


class GoalRepository:
    """Savings goal repository"""

    def __init__(self, db: Session):
        self.db = db

    def create_goal(
        self,
        budget_profile_id: str,
        name: str,
        goal_type,
        target_amount: float,
        target_date: Optional[datetime] = None,
        priority: int = 3
    ) -> SavingsGoal:
        """Create new savings goal"""
        goal = SavingsGoal(
            id=f"GOAL_{uuid4().hex[:8]}",
            budget_profile_id=budget_profile_id,
            name=name,
            goal_type=goal_type,
            target_amount=target_amount,
            target_date=target_date,
            priority=priority,
            status=GoalStatus.ACTIVE
        )
        self.db.add(goal)
        self.db.commit()
        return goal

    def get_goals(self, budget_profile_id: str) -> List[SavingsGoal]:
        """Get all goals for budget"""
        return self.db.query(SavingsGoal).filter_by(
            budget_profile_id=budget_profile_id
        ).order_by(SavingsGoal.priority).all()

    def update_goal(self, goal_id: str, **kwargs) -> SavingsGoal:
        """Update goal"""
        goal = self.db.query(SavingsGoal).filter_by(id=goal_id).first()
        if goal:
            for key, value in kwargs.items():
                if hasattr(goal, key):
                    setattr(goal, key, value)
            goal.updated_at = datetime.utcnow()
            self.db.commit()
        return goal

    def delete_goal(self, goal_id: str) -> bool:
        """Delete goal"""
        goal = self.db.query(SavingsGoal).filter_by(id=goal_id).first()
        if goal:
            self.db.delete(goal)
            self.db.commit()
            return True
        return False


class SubscriptionRepository:
    """Subscription repository"""

    def __init__(self, db: Session):
        self.db = db

    def create_subscription(
        self,
        budget_profile_id: str,
        name: str,
        monthly_cost: float,
        provider: Optional[str] = None,
        is_essential: bool = False
    ) -> SubscriptionItem:
        """Create new subscription"""
        sub = SubscriptionItem(
            id=f"SUB_{uuid4().hex[:8]}",
            budget_profile_id=budget_profile_id,
            name=name,
            monthly_cost=monthly_cost,
            provider=provider,
            is_essential=is_essential
        )
        self.db.add(sub)
        self.db.commit()
        return sub

    def get_subscriptions(self, budget_profile_id: str) -> List[SubscriptionItem]:
        """Get all subscriptions for budget"""
        return self.db.query(SubscriptionItem).filter_by(
            budget_profile_id=budget_profile_id
        ).all()

    def get_active_subscriptions(self, budget_profile_id: str) -> List[SubscriptionItem]:
        """Get active (auto-renewal) subscriptions"""
        return self.db.query(SubscriptionItem).filter_by(
            budget_profile_id=budget_profile_id,
            auto_renewal=True
        ).all()

    def update_subscription(self, subscription_id: str, **kwargs) -> SubscriptionItem:
        """Update subscription"""
        sub = self.db.query(SubscriptionItem).filter_by(id=subscription_id).first()
        if sub:
            for key, value in kwargs.items():
                if hasattr(sub, key):
                    setattr(sub, key, value)
            sub.updated_at = datetime.utcnow()
            self.db.commit()
        return sub

    def delete_subscription(self, subscription_id: str) -> bool:
        """Delete subscription"""
        sub = self.db.query(SubscriptionItem).filter_by(id=subscription_id).first()
        if sub:
            self.db.delete(sub)
            self.db.commit()
            return True
        return False


def get_budget_repositories(db: Session):
    """Get all budget repositories"""
    return {
        'budget': BudgetRepository(db),
        'income': IncomeRepository(db),
        'expense': ExpenseRepository(db),
        'goal': GoalRepository(db),
        'subscription': SubscriptionRepository(db)
    }
