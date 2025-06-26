from flask import request, jsonify, session
from app.services.ticket_service import (
    create_ticket, get_user_tickets, complete_ticket
)

def register_ticket_routes(app):
    @app.route('/api/tickets', methods=['POST'])
    def create_new_ticket():
        data = request.get_json()
        return jsonify(create_ticket(data))

    @app.route('/api/tickets', methods=['GET'])
    def list_user_tickets():
        if 'user_id' not in session:
            return jsonify([]), 401
        return jsonify(get_user_tickets(session["user_id"]))

    @app.route('/api/tickets/<int:ticket_id>/complete', methods=['POST'])
    def mark_ticket_complete(ticket_id):
        if 'user' not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify(complete_ticket(ticket_id))
