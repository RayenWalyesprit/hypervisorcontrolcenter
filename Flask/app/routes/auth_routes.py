from flask import request, jsonify, session
from app.services.ad_service import authenticate_user, fetch_users
from app.models.user_model import get_user_id_by_username

def register_auth_routes(app):
    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        username = data.get("username")
        password = data.get("password")

        if authenticate_user(username, password):
            session["user"] = username
            session["password"] = password
            session["user_id"] = get_user_id_by_username(username)
            return jsonify({"message": "Login successful", "user": username}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401

    @app.route('/logout', methods=['POST'])
    def logout():
        session.pop("user", None)
        return jsonify({"message": "Logged out"}), 200

    @app.route('/me', methods=['GET'])
    def get_current_user():
        if "user" not in session:
            return jsonify({"user": None}), 403
        return jsonify({"user": session["user"]}), 200

    @app.route('/users', methods=['GET'])
    def list_users():
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify(fetch_users())
