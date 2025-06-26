from flask import request, jsonify, session
from app.services.hypervisor_service import (
    get_hypervisors, get_hypervisor_info_by_id,
    add_hypervisor, run_vm_command, get_hypervisor_credentials_by_id
)
from app.services.ad_service import is_user_in_group

def register_hypervisor_routes(app):
    @app.route("/api/hypervisors", methods=["GET"])
    def list_hypervisors():
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify(get_hypervisors()), 200

    @app.route("/api/hypervisors/<int:hv_id>/info", methods=["GET"])
    def get_info(hv_id):
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify(get_hypervisor_info_by_id(hv_id))

    @app.route("/api/addhypervisors", methods=["POST"])
    def add_new_hypervisor():
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.get_json()
        return jsonify(add_hypervisor(data))

    @app.route('/vm/<int:hv_id>/<vm_name>/<action>', methods=['POST'])
    def control_vm(hv_id, vm_name, action):
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        
        response, status = run_vm_command(hv_id, vm_name, action)
        return jsonify(response), status

    @app.route('/api/hypervisors/<int:hv_id>/credentials', methods=['GET'])
    def get_credentials(hv_id):
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify(get_hypervisor_credentials_by_id(hv_id))
    
    @app.route('/api/parameters', methods=['GET'])
    def get_parameters():
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403

        return jsonify({
            "hypervisors": get_hypervisors()
    })
