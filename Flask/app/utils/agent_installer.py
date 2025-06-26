import os
import winrm
from app.models.vm_model import is_agent_installed, mark_agent_installed
from app.models.db import get_db_connection

def configure_vm(ip, username, password):
    session = winrm.Session(f"http://{ip}:5985/wsman", auth=(username, password))
    script = """
    winrm set winrm/config/service '@{AllowUnencrypted="true"}'
    netsh http add urlacl url=http://+:9001/metrics/ user=Administrateur
    """
    result = session.run_ps(script)
    print(result.std_out.decode(errors='ignore'))
    print(result.std_err.decode(errors='ignore'))

def get_flask_server_ip():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ip_address FROM Hypervisors WHERE id = 3")
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else "127.0.0.1"

def connect_vm(ip, username, password):
    return winrm.Session(f"http://{ip}:5985/wsman", auth=(username, password))

def run_ps(session, script, label):
    print(f"\n▶️ {label}...")
    result = session.run_ps(script)
    print("STDOUT:\n", result.std_out.decode(errors='ignore'))
    print("STDERR:\n", result.std_err.decode(errors='ignore'))
    return result

def upload_and_install_agent_windows_service(ip, username, password):
    flask_ip = get_flask_server_ip()
    print(f"[DEBUG] Using Flask IP: {flask_ip}")
    if is_agent_installed(ip):
        print(f"✅ Agent already installed on {ip}. Skipping installation.")
        return True

    session = connect_vm(ip, username, password)
    print(f"{username} and {password}  and {ip}")
    #configure_vm(ip, username, password)
    try:
        download_script = f"""
        if (!(Test-Path -Path "C:\\MonitoringAgent")) {{
            New-Item -ItemType Directory -Path "C:\\MonitoringAgent"
        }}
        Invoke-WebRequest -Uri http://{flask_ip}:5000/agent/download -OutFile C:\\MonitoringAgent\\MonitoringAgentService.zip
        """
        run_ps(session, download_script, "Downloading Windows Service ZIP")
        extract_script = """
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory("C:\\MonitoringAgent\\MonitoringAgentService.zip", "C:\\MonitoringAgent")
        """
        run_ps(session, extract_script, "Extracting ZIP")
        install_script = f"""
        cd C:\\MonitoringAgent
        if (!(Get-Service -Name MonitoringAgentService -ErrorAction SilentlyContinue)) {{
            sc.exe create MonitoringAgentService binPath= "C:\\MonitoringAgent\\MonitoringAgentService.exe" start= auto
        }}
        sc.exe config MonitoringAgentService start= auto
        sc.exe start MonitoringAgentService
        """
        run_ps(session, install_script, "Installing and Starting Windows Service")
        return True
    except Exception as e:
        print(f"❌ Exception during installation: {str(e)}")
        return False

