"""
API route handlers for user management.
"""

import azure.functions as func
import json
from datetime import datetime
from models.table_storage import TableStorageClient


async def get_users(req: func.HttpRequest) -> func.HttpResponse:
    """
    GET /api/users
    Returns list of all users
    """
    try:
        client = TableStorageClient()
        users = client.get_users()
        
        return func.HttpResponse(
            json.dumps({
                "users": users
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "error": str(e),
                "code": "INTERNAL_ERROR"
            }),
            status_code=500,
            mimetype="application/json"
        )


async def post_user(req: func.HttpRequest) -> func.HttpResponse:
    """
    POST /api/users
    Add or update a user
    
    Request body:
    {
      "id": "alice",
      "name": "Alice",
      "color": "#2563eb"
    }
    """
    try:
        body = req.get_json()
        
        # Validate required fields
        if not all(k in body for k in ["id", "name", "color"]):
            return func.HttpResponse(
                json.dumps({
                    "error": "Missing required fields: id, name, color",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        user_id = body["id"]
        name = body["name"]
        color = body["color"]
        
        # Validate color format (basic hex check)
        if not color.startswith("#") or len(color) not in (4, 7):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid color format. Use hex format like #2563eb",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        client = TableStorageClient()
        user = client.add_or_update_user(user_id, name, color)
        
        return func.HttpResponse(
            json.dumps({
                "user": user
            }),
            status_code=200,
            mimetype="application/json"
        )
    except ValueError as e:
        return func.HttpResponse(
            json.dumps({
                "error": str(e),
                "code": "VALIDATION_ERROR"
            }),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "error": str(e),
                "code": "INTERNAL_ERROR"
            }),
            status_code=500,
            mimetype="application/json"
        )
