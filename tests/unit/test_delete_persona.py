"""
Unit tests for delete_persona route handler.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from api.routes.delete_persona import delete_persona
import json


@pytest.mark.asyncio
async def test_delete_returns_204_on_success():
    """DELETE returns 204 No Content on successful deletion"""
    req = Mock()
    req.route_params = {"name": "TestPersona"}
    
    with patch('api.routes.delete_persona.TableStorageClient') as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Mock persona exists
        mock_client.get_users.return_value = [
            {"name": "TestPersona", "id": "test1", "color": "#FF0000"}
        ]
        mock_client.delete_by_persona.return_value = 5
        mock_client.get_table_client.return_value = MagicMock()
        
        response = await delete_persona(req)
        
        assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_returns_404_if_persona_not_found():
    """DELETE returns 404 if persona does not exist"""
    req = Mock()
    req.route_params = {"name": "NonExistent"}
    
    with patch('api.routes.delete_persona.TableStorageClient') as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Persona doesn't exist
        mock_client.get_users.return_value = []
        
        response = await delete_persona(req)
        
        assert response.status_code == 404
        body = json.loads(response.get_body())
        assert body["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_delete_returns_400_if_invalid_name():
    """DELETE returns 400 if persona name is invalid (empty)"""
    req = Mock()
    req.route_params = {"name": ""}
    
    with patch('api.routes.delete_persona.TableStorageClient') as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        response = await delete_persona(req)
        
        assert response.status_code == 400
        body = json.loads(response.get_body())
        assert body["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_delete_atomically_removes_all_dates():
    """DELETE atomically deletes all availability entries for persona"""
    req = Mock()
    req.route_params = {"name": "Alice"}
    
    with patch('api.routes.delete_persona.TableStorageClient') as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Persona exists
        mock_client.get_users.return_value = [
            {"name": "Alice", "id": "alice1", "color": "#FF0000"}
        ]
        
        # Delete removes 5 entries
        mock_client.delete_by_persona.return_value = 5
        mock_client.get_table_client.return_value = MagicMock()
        
        response = await delete_persona(req)
        
        assert response.status_code == 204
        mock_client.delete_by_persona.assert_called_once_with("Alice")


@pytest.mark.asyncio
async def test_delete_other_personas_unaffected():
    """DELETE only removes entries for specified persona"""
    req = Mock()
    req.route_params = {"name": "Bob"}
    
    with patch('api.routes.delete_persona.TableStorageClient') as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        
        # Multiple personas exist
        mock_client.get_users.return_value = [
            {"name": "Bob", "id": "bob1", "color": "#00FF00"},
            {"name": "Charlie", "id": "charlie1", "color": "#0000FF"}
        ]
        
        # Only Bob's entries deleted
        mock_client.delete_by_persona.return_value = 3
        mock_client.get_table_client.return_value = MagicMock()
        
        response = await delete_persona(req)
        
        assert response.status_code == 204
        # Verify only Bob was deleted
        mock_client.delete_by_persona.assert_called_once_with("Bob")
        # Charlie's entries should not be touched
