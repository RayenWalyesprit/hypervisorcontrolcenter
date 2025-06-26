from app.models.hypervisor_model import (
    get_all_hypervisors,
    get_hypervisor_by_id,
    insert_hypervisor_record
)
from app.utils.winrm_helpers import get_system_info_via_winrm
import winrm

def get_hypervisors():
    return get_all_hypervisors()

def get_hypervisor_info_by_id(hv_id):
    hypervisor = get_hypervisor_by_id(hv_id)
    if not hypervisor:
        return {"error": "Hypervisor not found"}
    return get_system_info_via_winrm(
        hypervisor["ip_address"],
        hypervisor["username"],
        hypervisor["password"]
    )

def add_hypervisor(data):
    required = ["name", "ip_address", "username", "password"]
    if not all(field in data for field in required):
        return {"error": "Missing fields"}, 400
    return insert_hypervisor_record(data), 201

def run_vm_command(hv_id, vm_name, action):
    hypervisor = get_hypervisor_by_id(hv_id)
    if not hypervisor:
        return {"error": "Hypervisor not found"}, 404

    ip, username, password = hypervisor["ip_address"], hypervisor["username"], hypervisor["password"]
    print (f"THE RUN COMMAND {ip}, {username}, {password}")
    endpoint = f"http://{ip}:5985/wsman"
    session = winrm.Session(endpoint, auth=(username, password), transport='ntlm', server_cert_validation='ignore')

    command_map = {
        "start": f'Start-VM -Name "{vm_name}"',
        "stop": f'Stop-VM -Name "{vm_name}" -Force',
        "restart": f'Restart-VM -Name "{vm_name}" -Force'
    }

    if action not in command_map:
        return {"error": "Invalid action"}, 400

    result = session.run_ps(command_map[action])
    if result.status_code == 0:
        return {"message": f"VM '{vm_name}' {action}ed successfully."}, 200
    else:
        return {"error": result.std_err.decode() or "Unknown error"}, 500

def get_hypervisor_credentials_by_id(hv_id):
    hypervisor = get_hypervisor_by_id(hv_id)
    if not hypervisor:
        return {"error": "Hypervisor not found"}, 404
    return {
        "ip_address": hypervisor["ip_address"],
        "username": hypervisor["username"],
        "password": hypervisor["password"]
    }, 200
