"""
Azure Table Storage client for Availability Calendar data persistence.
"""

from azure.data.tables import TableClient, TableServiceClient
from azure.core.exceptions import ResourceExistsError, ResourceNotFoundError
from datetime import datetime
import os
from typing import List, Dict, Optional


class TableStorageClient:
    """Client for accessing Azure Table Storage"""

    def __init__(self, connection_string: Optional[str] = None):
        """
        Initialize Table Storage client.
        
        Args:
            connection_string: Azure Storage connection string. Defaults to environment variable.
        """
        if connection_string is None:
            connection_string = os.getenv("AzureWebJobsStorage")
        
        if not connection_string:
            raise ValueError("No connection string provided and AzureWebJobsStorage not set")
        
        self.service_client = TableServiceClient.from_connection_string(connection_string)
        self._ensure_tables_exist()

    def _ensure_tables_exist(self):
        """Create tables if they don't exist"""
        tables = ["Availability", "Users"]
        
        for table_name in tables:
            try:
                self.service_client.create_table(table_name=table_name)
            except ResourceExistsError:
                pass  # Table already exists

    def get_table_client(self, table_name: str) -> TableClient:
        """Get a table client for the specified table"""
        return self.service_client.get_table_client(table_name)

    # Users table operations
    
    def get_users(self) -> List[Dict]:
        """Get all users"""
        table_client = self.get_table_client("Users")
        try:
            entities = list(table_client.query_entities(""))
            return [self._entity_to_dict(e) for e in entities]
        except ResourceNotFoundError:
            return []

    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get a specific user"""
        table_client = self.get_table_client("Users")
        try:
            entity = table_client.get_entity(partition_key="user", row_key=user_id)
            return self._entity_to_dict(entity)
        except ResourceNotFoundError:
            return None

    def add_or_update_user(self, user_id: str, name: str, color: str) -> Dict:
        """Add or update a user"""
        table_client = self.get_table_client("Users")
        entity = {
            "PartitionKey": "user",
            "RowKey": user_id,
            "id": user_id,
            "name": name,
            "color": color,
            "createdAt": datetime.utcnow().isoformat()
        }
        table_client.upsert_entity(entity)
        return self._entity_to_dict(entity)

    # Availability table operations

    def get_availability_for_month(self, month: str) -> List[Dict]:
        """
        Get all availability entries for a month.
        
        Args:
            month: ISO month string (YYYY-MM)
        
        Returns:
            List of availability entries
        """
        table_client = self.get_table_client("Availability")
        partition_key = f"calendar-{month}"
        
        try:
            entities = list(table_client.query_entities(f"PartitionKey eq '{partition_key}'"))
            return [self._entity_to_dict(e) for e in entities]
        except ResourceNotFoundError:
            return []

    def toggle_availability(
        self, user_id: str, date: str, name: str, color: str
    ) -> Dict:
        """
        Toggle availability for a persona on a date using composite key (name, color, date).
        Inserts if not exists, deletes if exists.
        
        Args:
            user_id: User identifier (legacy, unused)
            date: ISO date string (YYYY-MM-DD)
            name: Persona name (part of composite key)
            color: Persona color (part of composite key)
        
        Returns:
            Dictionary with action ("added" or "removed") and entry
        """
        table_client = self.get_table_client("Availability")
        
        # Parse date to get month
        month = date[:7]  # YYYY-MM
        partition_key = f"calendar-{month}"
        row_key = f"{name}#{color}#{date}"  # Composite key format
        
        # Check if entry exists
        try:
            existing = table_client.get_entity(partition_key, row_key)
            # Delete if exists
            table_client.delete_entity(partition_key, row_key)
            return {
                "action": "removed",
                "entry": self._entity_to_dict(existing)
            }
        except ResourceNotFoundError:
            # Insert if not exists
            entity = {
                "PartitionKey": partition_key,
                "RowKey": row_key,
                "date": date,
                "name": name,
                "color": color,
                "timestamp": datetime.utcnow().isoformat()
            }
            table_client.create_entity(entity)
            return {
                "action": "added",
                "entry": self._entity_to_dict(entity)
            }

    def delete_availability(self, name: str, color: str, date: str) -> bool:
        """
        Delete an availability entry using composite key (name, color, date).
        
        Args:
            name: Persona name (part of composite key)
            color: Persona color (part of composite key)
            date: ISO date string (YYYY-MM-DD)
        
        Returns:
            True if deleted, False if not found
        """
        table_client = self.get_table_client("Availability")
        
        month = date[:7]
        partition_key = f"calendar-{month}"
        row_key = f"{name}#{color}#{date}"  # Composite key format
        
        try:
            table_client.delete_entity(partition_key, row_key)
            return True
        except ResourceNotFoundError:
            return False

    def get_availability_entry(self, name: str, color: str, date: str) -> Optional[Dict]:
        """Get a specific availability entry using composite key (name, color, date)"""
        table_client = self.get_table_client("Availability")
        
        month = date[:7]
        partition_key = f"calendar-{month}"
        row_key = f"{name}#{color}#{date}"  # Composite key format
        
        try:
            entity = table_client.get_entity(partition_key, row_key)
            return self._entity_to_dict(entity)
        except ResourceNotFoundError:
            return None

    def get_personas_for_month(self, month: str) -> List[Dict]:
        """
        Get all distinct personas (name, color) for a month.
        
        Args:
            month: ISO month string (YYYY-MM)
        
        Returns:
            List of distinct {name, color} objects
        """
        table_client = self.get_table_client("Availability")
        partition_key = f"calendar-{month}"
        
        try:
            entities = list(table_client.query_entities(f"PartitionKey eq '{partition_key}'"))
            # Extract unique (name, color) tuples
            personas = {}
            for entity in entities:
                entity_dict = self._entity_to_dict(entity)
                name = entity_dict.get("name", "")
                color = entity_dict.get("color", "")
                if name and color:
                    key = f"{name}#{color}"
                    personas[key] = {"name": name, "color": color}
            
            return list(personas.values())
        except ResourceNotFoundError:
            return []

    @staticmethod
    def _entity_to_dict(entity) -> Dict:
        """Convert Table Storage entity to dictionary"""
        return dict(entity)
