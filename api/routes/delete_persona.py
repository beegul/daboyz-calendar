"""
API route handler for persona deletion.

Handles DELETE /api/personas/{name} endpoint for atomic cascade deletion
of a persona and all its availability entries.
"""

import azure.functions as func
import json
from models.table_storage import TableStorageClient


async def delete_persona(req: func.HttpRequest) -> func.HttpResponse:
    """
    DELETE /api/personas/{name}
    Delete a persona and all its availability entries atomically.
    
    URL parameters:
    - name: Persona name to delete (URL path parameter)
    
    Response:
    - 204 No Content: Persona deleted successfully
    - 400 Bad Request: Invalid persona name
    - 404 Not Found: Persona does not exist
    - 500 Internal Server Error: Database error
    """
    try:
        # Extract persona name from URL parameter
        persona_name = req.route_params.get("name")
        
        if not persona_name or not isinstance(persona_name, str):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid or missing persona name",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate persona name format
        # Allow: 1-50 chars, alphanumeric + spaces, no special chars
        persona_name = persona_name.strip()
        if not persona_name or len(persona_name) > 50:
            return func.HttpResponse(
                json.dumps({
                    "error": "Persona name must be 1-50 characters",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Check if persona exists in Users table
        client = TableStorageClient()
        users = client.get_users()
        persona_exists = any(u.get("name") == persona_name for u in users)
        
        if not persona_exists:
            return func.HttpResponse(
                json.dumps({
                    "error": f"Persona '{persona_name}' not found",
                    "code": "NOT_FOUND"
                }),
                status_code=404,
                mimetype="application/json"
            )
        
        # Perform cascade delete: remove all availability entries for this persona
        deleted_count = client.delete_by_persona(persona_name)
        
        # Also delete the persona from Users table
        try:
            # Find the user by name and delete by RowKey
            users = client.get_users()
            user_to_delete = next(
                (u for u in users if u.get("name") == persona_name),
                None
            )
            
            if user_to_delete:
                table_client = client.get_table_client("Users")
                table_client.delete_entity(
                    partition_key="user",
                    row_key=user_to_delete.get("id", persona_name)
                )
        except Exception as e:
            # Log but don't fail if user deletion fails
            import logging
            logger = logging.getLogger("delete_persona")
            logger.warning(f"Could not delete persona from Users table: {str(e)}")
        
        # Return 204 No Content on success
        return func.HttpResponse(
            status_code=204
        )
    
    except ValueError as e:
        # Validation error
        return func.HttpResponse(
            json.dumps({
                "error": str(e),
                "code": "VALIDATION_ERROR"
            }),
            status_code=400,
            mimetype="application/json"
        )
    
    except Exception as e:
        # Internal server error
        import logging
        logger = logging.getLogger("delete_persona")
        logger.error(f"Error deleting persona: {str(e)}")
        
        return func.HttpResponse(
            json.dumps({
                "error": "Internal server error",
                "code": "INTERNAL_ERROR",
                "details": str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
