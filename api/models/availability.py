"""
Data models and validation helpers for availability data.
"""

from datetime import datetime
from typing import Dict, List, Optional
import re


def validate_month(month: str) -> bool:
    """
    Validate ISO month format (YYYY-MM).
    
    Args:
        month: Month string to validate
    
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^\d{4}-\d{2}$'
    if not re.match(pattern, month):
        return False
    
    try:
        year, month_num = month.split('-')
        month_int = int(month_num)
        if month_int < 1 or month_int > 12:
            return False
        return True
    except (ValueError, IndexError):
        return False


def validate_date(date: str) -> bool:
    """
    Validate ISO date format (YYYY-MM-DD).
    
    Args:
        date: Date string to validate
    
    Returns:
        True if valid date, False otherwise
    """
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    if not re.match(pattern, date):
        return False
    
    try:
        datetime.strptime(date, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def validate_name(name: str) -> bool:
    """
    Validate persona name.
    
    Args:
        name: Name string to validate
    
    Returns:
        True if valid (1-50 chars, alphanumeric + spaces), False otherwise
    """
    if not name or not isinstance(name, str):
        return False
    
    name = name.strip()
    if len(name) < 1 or len(name) > 50:
        return False
    
    # Allow alphanumeric characters and spaces
    pattern = r'^[a-zA-Z0-9\s]+$'
    return bool(re.match(pattern, name))


def validate_color(color: str) -> bool:
    """
    Validate hex color format.
    
    Args:
        color: Color string to validate
    
    Returns:
        True if valid hex format (#RRGGBB), False otherwise
    """
    if not color or not isinstance(color, str):
        return False
    
    # Validate hex color format: #RRGGBB
    pattern = r'^#[0-9a-fA-F]{6}$'
    return bool(re.match(pattern, color))


def get_month_from_date(date: str) -> Optional[str]:
    """
    Extract month (YYYY-MM) from date (YYYY-MM-DD).
    
    Args:
        date: ISO date string
    
    Returns:
        Month string (YYYY-MM) or None if invalid
    """
    if not validate_date(date):
        return None
    
    return date[:7]


def is_date_in_month(date: str, month: str) -> bool:
    """
    Check if a date belongs to a specific month.
    
    Args:
        date: ISO date string (YYYY-MM-DD)
        month: ISO month string (YYYY-MM)
    
    Returns:
        True if date is in month, False otherwise
    """
    if not validate_date(date) or not validate_month(month):
        return False
    
    return date[:7] == month


class AvailabilityEntry:
    """
    Data class for availability entries using composite key (name, color, date).
    """
    
    def __init__(
        self,
        partition_key: str,
        row_key: str,
        date: str,
        name: str,
        color: str,
        timestamp: str,
        user_id: Optional[str] = None  # Legacy field, kept for backward compatibility
    ):
        self.partition_key = partition_key
        self.row_key = row_key
        self.date = date
        self.name = name
        self.color = color
        self.timestamp = timestamp
        self.user_id = user_id  # Legacy
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "partitionKey": self.partition_key,
            "rowKey": self.row_key,
            "date": self.date,
            "name": self.name,
            "color": self.color,
            "timestamp": self.timestamp
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'AvailabilityEntry':
        """Create from dictionary"""
        return cls(
            partition_key=data.get("PartitionKey", ""),
            row_key=data.get("RowKey", ""),
            date=data.get("date", ""),
            name=data.get("name", ""),
            color=data.get("color", ""),
            timestamp=data.get("timestamp", ""),
            user_id=data.get("userId", "")  # Legacy support
        )


class User:
    """
    Data class for user entities.
    """
    
    def __init__(
        self,
        id: str,
        name: str,
        color: str,
        created_at: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.color = color
        self.created_at = created_at or datetime.utcnow().isoformat()
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "createdAt": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'User':
        """Create from dictionary"""
        return cls(
            id=data.get("id", ""),
            name=data.get("name", ""),
            color=data.get("color", ""),
            created_at=data.get("createdAt")
        )
