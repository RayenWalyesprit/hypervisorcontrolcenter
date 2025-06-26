from flask import request, jsonify, session
from app.services.vm_service import (
    get_vm_usage, get_vm_info, get_vm_services,
    get_vm_list_for_hypervisor, get_cpu_usage
)

def register_vm_routes(app):
    @app.route('/vm/<vm_ip>/usage', methods=['POST'])
    def vm_resource_usage(vm_ip):
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        return jsonify(get_vm_usage(vm_ip, data))

    @app.route('/vm/<vm_ip>/systeminfo', methods=['POST'])
    def vm_system_info(vm_ip):
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        return jsonify(get_vm_info(vm_ip, data))

    @app.route('/vm/<vm_ip>/services', methods=['POST'])
    def vm_services(vm_ip):
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        return jsonify(get_vm_services(vm_ip, data))

    @app.route('/vm/<vm_ip>/cpu', methods=['GET'])
    def vm_cpu(vm_ip):
        if "user" not in session or "password" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify({"cpu": get_cpu_usage(vm_ip, session)})

    @app.route('/api/hypervisors/<int:hv_id>/vms', methods=['GET'])
    def get_vms_for_hypervisor(hv_id):
        if "user" not in session:
            return jsonify({"error": "Unauthorized"}), 403
        return jsonify(get_vm_list_for_hypervisor(hv_id))
