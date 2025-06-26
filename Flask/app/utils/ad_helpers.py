from ldap3 import Server, Connection, ALL
from app.models.db import get_db_connection, insert_user

def get_ad_config():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT TOP 1 server, base_dn, username, password FROM ADConfig ORDER BY created_at DESC")
    row = cursor.fetchone()
    conn.close()
    return dict(zip([col[0] for col in cursor.description], row)) if row else {}

ad_config = get_ad_config()
AD_SERVER = ad_config["server"]
BASE_DN = ad_config["base_dn"]
ADMIN_USER = ad_config["username"]
ADMIN_PASSWORD = ad_config["password"]

def ldap_authenticate_user(username, password):
    user_dn = f"delice\\{username}"
    try:
        AD_SERVER = "192.168.1.13"
        server = Server(AD_SERVER,port=389,get_info=ALL,use_ssl=False)
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
        return conn.bound
    except Exception as e:
        print(f"AD Auth error: {e}")
        return False

def ldap_fetch_users():
    try:
        server = Server(AD_SERVER, get_info=ALL)
        conn = Connection(server, ADMIN_USER, ADMIN_PASSWORD, auto_bind=True)
        conn.search(BASE_DN, '(objectClass=user)', attributes=['sAMAccountName', 'cn', 'mail'])
        users = [
            {
                "username": entry.sAMAccountName.value,
                "full_name": entry.cn.value,
                "email": entry.mail.value if hasattr(entry, "mail") else None
            }
            for entry in conn.entries
        ]
        conn.unbind()
        return users
    except Exception as e:
        print(f"Fetch AD users error: {e}")
        return []

def ldap_user_in_group(username, group):
    try:
        server = Server(AD_SERVER, get_info=ALL)
        conn = Connection(server, ADMIN_USER, ADMIN_PASSWORD, auto_bind=True)
        conn.search(BASE_DN, f"(&(objectClass=user)(sAMAccountName={username}))", attributes=['memberOf'])
        if conn.entries:
            groups = conn.entries[0].memberOf.values
            return any(group.lower() in g.lower() for g in groups)
        return False
    except Exception as e:
        print(f"Group check error: {e}")
        return False
