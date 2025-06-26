from flask import request, jsonify, session
from app.services.config_service import (
    get_ad_config,
    update_ad_config,
    get_sql_config,
    update_sql_config
)

def register_config_routes(app):
    @app.route("/api/ad-config", methods=["GET"])
    def fetch_ad_config():
        return jsonify(get_ad_config())
    @app.route("/api/parameters", methods=["GET"])
    def get_combined_config():
        return jsonify({
            "ad": get_ad_config(),
            "sql": get_sql_config()
        })
    @app.route("/api/ad-config", methods=["POST"])
    def update_ad_config_route():
        data = request.get_json()
        return jsonify(update_ad_config(data))

    @app.route("/api/sql-config", methods=["GET"])
    def fetch_sql_config():
        return jsonify(get_sql_config())

    @app.route("/api/sql-config", methods=["POST"])
    def update_sql_config_route():
        data = request.get_json()
        return jsonify(update_sql_config(data))
    
