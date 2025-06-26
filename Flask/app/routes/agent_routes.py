from flask import send_file
import os
import requests
from flask import Blueprint, request, jsonify

def register_agent_routes(app):
    @app.route('/agent/download', methods=['GET'])
    def download_agent():
        zip_path = os.path.join(os.getcwd(), 'MonitoringAgentService.zip')
        if not os.path.exists(zip_path) or os.path.getsize(zip_path) == 0:
            app.logger.error("Agent package is missing or empty!")
            return {"error": "Agent package not found or is empty."}, 404
        return send_file(zip_path, as_attachment=True)
    
    @app.route("/vm/<vm_ip>/metrics", methods=["GET"])
    def proxy_vm_metrics(vm_ip):
        try:
            response = requests.get(f"http://{vm_ip}:9001/metrics/", timeout=6)
            return response.text, response.status_code, {"Content-Type": "application/json"}
        except Exception as e:
            return jsonify({"error": f"Failed to fetch metrics from agent: {str(e)}"}), 500