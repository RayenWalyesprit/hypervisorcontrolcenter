from flask import request, jsonify, session
from app.models.user_model import get_all_app_users, insert_user
from app.models.db import get_db_connection
def register_user_routes(app):
    @app.route('/api/app-users', methods=['GET'])
    def list_app_users():
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify(get_all_app_users())

    @app.route("/api/app-users/add", methods=["POST"])
    def add_user_to_db():
        data = request.get_json()
        username = data.get("username")
        full_name = data.get("full_name")
        email = data.get("email")
        role = data.get("role", "Viewer")

        if not username:
            return jsonify({"error": "Missing username"}), 400

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
        INSERT INTO AppUsers (username, full_name, email, role)
        VALUES (?, ?, ?, ?)
        """, (username, full_name, email, role))
            conn.commit()
            return jsonify({"message": "User added"}), 201
        except Exception as e:
            print("❌ DB error:", e)
            return jsonify({"error": str(e)}), 500
        

