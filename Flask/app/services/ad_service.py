from app.utils.ad_helpers import (
    ldap_authenticate_user, ldap_fetch_users, ldap_user_in_group
)
from app.models.user_model import user_exists_in_db

def authenticate_user(username, password):
    if not user_exists_in_db(username):
        return False
    return ldap_authenticate_user(username, password)

def fetch_users():
    return ldap_fetch_users()

def is_user_in_group(username, group):
    return ldap_user_in_group(username, group)
