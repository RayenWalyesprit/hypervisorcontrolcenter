from app.utils.winrm_helpers import (
    get_vm_resource_usage,
    get_system_info_via_winrm,
    get_running_services_via_winrm,
    get_cpu_usage_via_winrm,
    get_vm_list_via_winrm,
    parse_vm_performance_data
)
from app.models.hypervisor_model import get_hypervisor_by_id
from app.models.db import get_db_connection
from app.utils.winrm_helpers import get_system_info_via_winrm
from app.models.vm_model import add_vm_if_not_exists, mark_agent_installed
from app.utils.agent_installer import upload_and_install_agent_windows_service,get_flask_server_ip
from app.models.vm_model import is_agent_installed, mark_agent_installed


def ensure_agent_installed(vm_ip, username, password):
    if is_agent_installed(vm_ip):
        print(f"✅ Agent already installed on {vm_ip}. Skipping installation.")
        return True

    try:
        result = upload_and_install_agent_windows_service(vm_ip, username, password)
        if result:
            mark_agent_installed(vm_ip)
            print(f"✅ Agent installed on {vm_ip}")
            return True
        else:
            print(f"❌ Agent installation failed on {vm_ip}")
            return False
    except Exception as e:
        print(f"❌ Exception during agent installation on {vm_ip}: {str(e)}")
        return False

def onboard_vm(vm_ip, username, password, hypervisor_id):
    try:
        if ensure_agent_installed(vm_ip, username, password):
            return {"status": "connected_and_agent_installed"}
        else:
            return {"error": "Agent installation failed"}
    except Exception as e:
        return {"error": str(e)}

def get_vm_usage(vm_ip, data):
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return {"error": "Missing credentials"}
    return get_vm_resource_usage(vm_ip, username, password)

def get_vm_info(vm_ip, data):
    username = data.get("username")
    password = data.get("password")
    hypervisor_id = data.get("hypervisor_id")
    flask_ip = get_flask_server_ip()
    print(f"[DEBUG] Using Flask IP: {flask_ip}")

    if not username or not password:
        return {"error": "Missing credentials"}

    system_info = get_system_info_via_winrm(vm_ip, username, password)
    if "error" in system_info:
        return system_info

    add_vm_if_not_exists(vm_ip, hypervisor_id, username, password, is_agent_installed=0)

    if is_agent_installed(vm_ip):
        print(f"✅ Agent already installed on {vm_ip}. Skipping installation Vminfo.")
        system_info["agent_installed"] = True
    else:
        try:
            success = upload_and_install_agent_windows_service(vm_ip, username, password)
            if success:
                mark_agent_installed(vm_ip)
                system_info["agent_installed"] = True
            else:
                system_info["agent_installed"] = False
        except Exception as e:
            system_info["agent_installed"] = False
            system_info["agent_error"] = str(e)

    return system_info



def get_vm_services(vm_ip, data):
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return {"error": "Missing VM credentials"}
    return {"services": get_running_services_via_winrm(vm_ip, username, password)}

def get_cpu_usage(vm_ip, session_data):
    return get_cpu_usage_via_winrm(vm_ip, session_data["user"], session_data["password"])

def get_vm_list_for_hypervisor(hv_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ip_address, username, password FROM Hypervisors WHERE id = ?", (hv_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return []

    ip, username, password = row
    print(f"[DEBUG] Fetching VMs for {ip}")
    vms = get_vm_list_via_winrm(ip, username, password)

    if isinstance(vms, dict) and "error" in vms:
        print("❌ WinRM error:", vms["error"])
        return []

    return vms

def get_system_info_and_register_vm(vm_ip, username, password, hypervisor_id):
    info = get_system_info_via_winrm(vm_ip, username, password)
    if "error" in info:
        return info
    add_vm_if_not_exists(vm_ip, hypervisor_id, username, password, is_agent_installed=0)
    
    if is_agent_installed(vm_ip):
        print(f"✅ Agent already installed on {vm_ip}. Skipping installation.RegisterVm")
        info["agent_installed"] = True
    else:
        try:
            success = upload_and_install_agent_windows_service(vm_ip, username, password)
            if success:
                mark_agent_installed(vm_ip)
                info["agent_installed"] = True
            else:
                info["agent_installed"] = False
        except Exception as e:
            info["agent_installed"] = False
            info["agent_error"] = str(e)

    return info

