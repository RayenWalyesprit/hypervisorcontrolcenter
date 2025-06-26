from .auth_routes import register_auth_routes
from .vm_routes import register_vm_routes
from .hypervisor_routes import register_hypervisor_routes
from .alert_routes import register_alert_routes
from .ticket_routes import register_ticket_routes
from .config_routes import register_config_routes
from .user_routes import register_user_routes
from .agent_routes import register_agent_routes
from .availability_routes import register_availability_routes
from .dashboard import register_dashboard_routes

def register_routes(app):
    register_auth_routes(app)
    register_vm_routes(app)
    register_hypervisor_routes(app)
    register_alert_routes(app)
    register_ticket_routes(app)
    register_config_routes(app)
    register_user_routes(app)
    register_agent_routes(app)
    register_availability_routes(app)
    register_dashboard_routes(app)