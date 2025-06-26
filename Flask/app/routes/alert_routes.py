from flask import request, jsonify, session
from app.services.alert_service import (
    get_all_alerts, get_latest_critical_alert,
    simulate_alert, get_alert_summary,
    get_alert_thresholds, update_alert_thresholds
)

def register_alert_routes(app):
    @app.route("/api/alerts", methods=["GET"])
    def list_alerts():
        return jsonify(get_all_alerts())

    @app.route("/api/alerts/latest", methods=["GET"])
    def latest_critical():
        return jsonify(get_latest_critical_alert())

    @app.route("/simulate-alert", methods=["POST"])
    def simulate():
        data = request.json
        return jsonify(simulate_alert(data))

    @app.route("/api/alerts/summary")
    def summary():
        days = int(request.args.get("days", 7))
        return jsonify(get_alert_summary(days))

    @app.route('/api/alert-thresholds', methods=['GET'])
    def thresholds():
        return jsonify(get_alert_thresholds())

    @app.route('/api/alert-thresholds', methods=['POST'])
    def update_thresholds():
        data = request.get_json()
        return jsonify(update_alert_thresholds(data))
