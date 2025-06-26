from app import create_app
from app.services.monitoring_service import start_monitoring_scheduler
from flask_cors import CORS

start_monitoring_scheduler()
app = create_app()
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
if __name__ == '__main__':
    app.run(host="0.0.0.0",debug=True,use_reloader=False)
