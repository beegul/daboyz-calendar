"""
API route handlers for availability management.
"""

import azure.functions as func
import json
from datetime import datetime
from models.table_storage import TableStorageClient
from models.availability import validate_month, validate_date, validate_name, validate_color


async def get_availability(req: func.HttpRequest) -> func.HttpResponse:
    """
    GET /api/availability?month={YYYY-MM}
    Returns availability entries for a specific month
    
    Query parameters:
      month (required): ISO month string (YYYY-MM)
    """
    try:
        month = req.params.get('month')
        
        if not month:
            return func.HttpResponse(
                json.dumps({
                    "error": "Missing required query parameter: month (use YYYY-MM format)",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        if not validate_month(month):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid month format. Use YYYY-MM.",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        client = TableStorageClient()
        entries = client.get_availability_for_month(month)
        
        return func.HttpResponse(
            json.dumps({
                "month": month,
                "entries": entries
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


async def post_availability(req: func.HttpRequest) -> func.HttpResponse:
    """
    POST /api/availability
    Toggle availability for a persona on a date using composite key (name, color, date)
    
    Request body:
    {
      "name": "Sarah",
      "color": "#FF0000",
      "date": "2026-07-14"
    }
    """
    try:
        body = req.get_json()
        
        # Validate required fields
        required_fields = ["name", "color", "date"]
        if not all(k in body for k in required_fields):
            return func.HttpResponse(
                json.dumps({
                    "error": f"Missing required fields: {', '.join(required_fields)}",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        name = body["name"].strip() if isinstance(body["name"], str) else ""
        color = body["color"].strip() if isinstance(body["color"], str) else ""
        date = body["date"]
        
        # Validate name
        if not validate_name(name):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid name. Must be 1-50 chars, alphanumeric + spaces only.",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate color
        if not validate_color(color):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid color format. Use hex color: #RRGGBB",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate date format
        if not validate_date(date):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid date format. Use YYYY-MM-DD.",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        client = TableStorageClient()
        result = client.toggle_availability("", date, name, color)  # user_id empty for new schema
        
        return func.HttpResponse(
            json.dumps(result),
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


async def delete_availability(req: func.HttpRequest) -> func.HttpResponse:
    """
    DELETE /api/availability?name={name}&color={color}&date={date}
    Delete an availability entry using composite key
    
    Query parameters:
      name: Persona name (part of composite key)
      color: Persona color (part of composite key)
      date: ISO date string (YYYY-MM-DD)
    """
    try:
        name = req.params.get('name')
        color = req.params.get('color')
        date = req.params.get('date')
        
        if not name or not color or not date:
            return func.HttpResponse(
                json.dumps({
                    "error": "Missing required query parameters: name, color, date",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate name
        if not validate_name(name):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid name format.",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate color
        if not validate_color(color):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid color format. Use hex color: #RRGGBB",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Validate date format
        if not validate_date(date):
            return func.HttpResponse(
                json.dumps({
                    "error": "Invalid date format. Use YYYY-MM-DD.",
                    "code": "VALIDATION_ERROR"
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        client = TableStorageClient()
        deleted = client.delete_availability(name, color, date)
        
        if not deleted:
            return func.HttpResponse(
                json.dumps({
                    "error": "Entry not found.",
                    "code": "NOT_FOUND"
                }),
                status_code=404,
                mimetype="application/json"
            )
        
        return func.HttpResponse(
            status_code=204
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
