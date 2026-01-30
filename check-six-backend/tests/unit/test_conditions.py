"""
Unit tests for conditions module
"""
import pytest
from app.services.conditions import ConditionsService
from app.schemas.conditions import ConditionCreate


@pytest.mark.unit
class TestConditionsService:
    """Tests for ConditionsService"""

    def test_create_condition(self, db, sample_conditions):
        """Test creating a new condition"""
        service = ConditionsService(db)

        # Get initial count
        initial_count = len(sample_conditions)

        # Create new condition
        new_condition = service.create(ConditionCreate(
            name="Hearing Loss",
            code="H9091",
            description="Age-related hearing loss",
            disability_rating=20
        ))

        assert new_condition.name == "Hearing Loss"
        assert new_condition.code == "H9091"
        assert new_condition.disability_rating == 20

    def test_get_condition(self, db, sample_conditions):
        """Test retrieving a condition"""
        service = ConditionsService(db)
        condition = service.get_by_code("F4310")

        assert condition is not None
        assert condition.name == "PTSD"

    def test_list_conditions(self, db, sample_conditions):
        """Test listing all conditions"""
        service = ConditionsService(db)
        conditions = service.list()

        assert len(conditions) == 3
        assert any(c.name == "PTSD" for c in conditions)

    def test_update_condition(self, db, sample_conditions):
        """Test updating a condition"""
        service = ConditionsService(db)
        condition = service.get_by_code("F4310")

        updated = service.update(
            condition.id,
            ConditionCreate(
                name="PTSD",
                code="F4310",
                description="Updated description",
                disability_rating=40
            )
        )

        assert updated.disability_rating == 40
        assert updated.description == "Updated description"

    def test_delete_condition(self, db, sample_conditions):
        """Test deleting a condition"""
        service = ConditionsService(db)
        condition = service.get_by_code("F4310")

        service.delete(condition.id)

        # Verify deletion
        assert service.get_by_code("F4310") is None

    def test_condition_not_found(self, db):
        """Test retrieving non-existent condition"""
        service = ConditionsService(db)
        condition = service.get_by_code("NONEXISTENT")

        assert condition is None
