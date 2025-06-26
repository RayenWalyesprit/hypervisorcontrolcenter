from app.models.db import get_db_connection
def get_all_vms():
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT *
        FROM VMs
    """
    cursor.execute(query)

    columns = [column[0] for column in cursor.description]
    results = [dict(zip(columns, row)) for row in cursor.fetchall()]

    cursor.close()
    conn.close()
    return results
def store_vm_data(vm_info):
    conn = get_db_connection()
    if not conn:
        print("❌ Failed to connect to the database.")
        return

    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO VM_Info (
                vm_name, state, generation, version, ip_addresses, adapter_count,
                os_name, os_architecture, cpu_usage, cpu_cores, memory_assigned_gb, 
                memory_demand_gb, memory_alert, total_disk_size_gb, disk_count, uptime, 
                replication_status, replication_alert, backup_status, backup_alert
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            vm_info["Basic Info"].get("VM Name"),
            vm_info["Basic Info"].get("State"),
            vm_info["Basic Info"].get("Generation"),
            vm_info["Basic Info"].get("Version"),
            vm_info["Network"].get("IP Addresses"),
            vm_info["Network"].get("Adapter Count"),
            vm_info["Operating System"].get("Name"),
            vm_info["Operating System"].get("Architecture"),
            vm_info["Performance"]["CPU"].get("Usage"),
            vm_info["Performance"]["CPU"].get("Cores"),
            vm_info["Performance"]["Memory"].get("Assigned (GB)"),
            vm_info["Performance"]["Memory"].get("Demand (GB)"),
            vm_info["Performance"]["Memory"].get("Alert"),
            vm_info["Storage"].get("Total Size (GB)"),
            vm_info["Storage"].get("Disk Count"),
            vm_info.get("Uptime"),
            vm_info["Replication"].get("Status"),
            vm_info["Replication"].get("Alert"),
            vm_info["Backup"].get("Last Backup"),
            vm_info["Backup"].get("Alert")
        ))

        conn.commit()
        print(f"✅ VM Data inserted successfully for {vm_info['Basic Info'].get('VM Name')}.")
    except Exception as e:
        print(f"❌ Database insert error: {e}")
    finally:
        cursor.close()
        conn.close()

def add_vm_if_not_exists(ip, hypervisor_id, username, password, is_agent_installed=0):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM VMs WHERE ip = ?", (ip,))
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO VMs (ip, hypervisor_id, username, password, is_agent_installed)
            VALUES (?, ?, ?, ?, ?)
        """, (ip, hypervisor_id, username, password, is_agent_installed))
        conn.commit()
    conn.close()

def mark_agent_installed(ip):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE VMs SET is_agent_installed = 1 WHERE ip = ?
    """, (ip,))
    conn.commit()
    conn.close()

def is_agent_installed(ip):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_agent_installed FROM VMs WHERE ip = ?", (ip,))
    row = cursor.fetchone()
    conn.close()
    
    print(f"[DEBUG] Row fetched from DB for {ip}: {row}")
    
    if row is None:
        return False
    
    # Explicitly convert to int if needed
    try:
        installed = int(row[0])
    except (ValueError, TypeError):
        installed = 0
    
    return installed == 1
