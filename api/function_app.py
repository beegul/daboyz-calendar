"""
Azure Functions app for Shared Availability Calendar API.

Endpoints:
- GET /api/users - Get user list
- POST /api/users - Add/update user
- GET /api/availability - Get availability for month
- GET /api/availability/personas - Get personas for month
- POST /api/availability - Toggle availability
- DELETE /api/availability - Delete availability entry
- DELETE /api/personas/{name} - Delete persona and cascade delete all availability entries
"""

import azure.functions as func
from datetime import datetime
import json
import os

app = func.FunctionApp()

# Import route handlers
from routes.users import get_users, post_user
from routes.availability import get_availability, post_availability, delete_availability
from routes.delete_persona import delete_persona
from models.table_storage import TableStorageClient
from models.availability import validate_month


@app.function_name("HealthCheck")
@app.route(route="health")
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint"""
    return func.HttpResponse(
        json.dumps({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0"
        }),
        status_code=200,
        mimetype="application/json"
    )


# Users endpoints
@app.function_name("GetUsers")
@app.route(route="users", methods=["GET"])
async def get_users_handler(req: func.HttpRequest) -> func.HttpResponse:
    """GET /api/users - Return list of all users"""
    return await get_users(req)


@app.function_name("PostUser")
@app.route(route="users", methods=["POST"])
async def post_user_handler(req: func.HttpRequest) -> func.HttpResponse:
    """POST /api/users - Add or update a user"""
    return await post_user(req)


# Personas endpoint (alias for /users - returns all personas)
@app.function_name("GetAllPersonas")
@app.route(route="personas", methods=["GET"])
async def get_personas_all_handler(req: func.HttpRequest) -> func.HttpResponse:
    """GET /api/personas - Return list of all personas for collision detection"""
    try:
        client = TableStorageClient()
        users = client.get_users()
        
        return func.HttpResponse(
            json.dumps({
                "personas": users
            }),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                "error": str(e),
                "code": "FETCH_PERSONAS_ERROR"
            }),
            status_code=500,
            mimetype="application/json"
        )


@app.function_name("DeletePersona")
@app.route(route="personas/{name}", methods=["DELETE"])
async def delete_persona_handler(req: func.HttpRequest) -> func.HttpResponse:
    """DELETE /api/personas/{name} - Delete persona and cascade delete all availability entries"""
    return await delete_persona(req)


# Availability endpoints
@app.function_name("GetAvailability")
@app.route(route="availability", methods=["GET"])
async def get_availability_handler(req: func.HttpRequest) -> func.HttpResponse:
    """GET /api/availability?month={YYYY-MM} - Get availability for month"""
    return await get_availability(req)


@app.function_name("PostAvailability")
@app.route(route="availability", methods=["POST"])
async def post_availability_handler(req: func.HttpRequest) -> func.HttpResponse:
    """POST /api/availability - Toggle user availability on date"""
    return await post_availability(req)


@app.function_name("DeleteAvailability")
@app.route(route="availability", methods=["DELETE"])
async def delete_availability_handler(req: func.HttpRequest) -> func.HttpResponse:
    """DELETE /api/availability?name={name}&color={color}&date={date} - Delete availability entry"""
    return await delete_availability(req)


@app.function_name("GetPersonas")
@app.route(route="availability/personas", methods=["GET"])
async def get_personas_handler(req: func.HttpRequest) -> func.HttpResponse:
    """GET /api/availability/personas?month={YYYY-MM} - Get all personas for month"""
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
        personas = client.get_personas_for_month(month)
        
        return func.HttpResponse(
            json.dumps({
                "month": month,
                "personas": personas
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
