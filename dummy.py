from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pomodoro.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

# Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

print(555)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

@app.route('/debug-query', methods=['GET'])
def debug_query():
    try:
        from sqlalchemy.sql import text

        # Option 1: Raw SQL query
        users_raw = db.session.execute(text("SELECT * FROM user")).fetchall()
        print("Users retrieved with raw SQL:")
        for user in users_raw:
            print(user)

        # Convert rows to dictionaries manually
        raw_sql_users = []
        for row in users_raw:
            raw_sql_users.append({
                "id": row[0],
                "email": row[1],
                "password": row[2],
                "created_at": row[3]
            })

        # Option 2: ORM query
        users_orm = User.query.all()
        print("Users retrieved with SQLAlchemy ORM:")
        for user in users_orm:
            print(f"ID: {user.id}, Email: {user.email}, Created At: {user.created_at}")

        # Format and return results
        response = {
            "raw_sql_users": raw_sql_users,
            "orm_users": [
                {
                    "id": user.id,
                    "email": user.email,
                    "password": user.password,
                    "created_at": user.created_at,
                }
                for user in users_orm
            ]
        }
        return jsonify(response), 200
    except Exception as e:
        print("Error querying the database:", e)
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    with app.app_context():
        # Ensure database tables are created
        db.create_all()
        
        # Test the database connection
        try:
            with db.engine.connect() as connection:
                from sqlalchemy.sql import text
                tables = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table';")).fetchall()
                print("Tables in the database:", tables)
        except Exception as e:
            print("Error connecting to the database:", e)

    # Run the app
    app.run(debug=True)

