from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, func
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from datetime import date
from flask_cors import CORS
import os
from sqlalchemy import text  # Import text for SQL queries


app = Flask(__name__, static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})


# Configuration
db_path = os.path.join('instance', 'pomodoro.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.abspath(db_path)}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

# Ensure the instance directory exists
os.makedirs('instance', exist_ok=True)

# Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Pomodoro(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    pomodoro_count = db.Column(db.Integer, default=0)
    user_email = db.Column(db.Text)

class PomodoroCountByDay(db.Model):
    __tablename__ = 'pomodoro_stats_by_day'
    id = db.Column(db.Integer, primary_key=True)
    day_of_pomodoro = db.Column(db.Date, nullable=False)
    pomodoro_count_by_day = db.Column(db.Integer, default=0)
    user_email = db.Column(db.Text)

    def __init__(self, day_of_pomodoro, pomodoro_count_by_day=0, user_email=None):

        self.day_of_pomodoro = day_of_pomodoro
        self.pomodoro_count_by_day = pomodoro_count_by_day
        self.user_email = user_email


with app.app_context():
    # Refresh the database session
    db.session.remove()  # Remove the current session
    db.engine.dispose()  # Dispose the current engine (optional)
    

# Initialize the database
with app.app_context():
    print(f"Database path: {db_path}")
    print(f"Database exists: {os.path.exists(db_path)}")

    # Verify database connection
    try:
        with db.engine.connect() as connection:
            print("Database connection successful!")
    except Exception as e:
        print(f"Error connecting to the database: {e}")

    # Verify tables in the database
    with db.engine.connect() as connection:
        tables = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table';")).fetchall()
        print(f"Tables in the database: {tables}")

    # Verify session
    try:
        db.session.commit()
        print("Database session is active.")
    except Exception as e:
        print(f"Error committing to database: {e}")

# Routes for serving the frontend
@app.route('/')
def index():
    return send_file('front31.html')

@app.route('/styles.css')
def serve_css():
    return send_file('styles.css')

@app.route('/script.js')
def serve_js():
    return send_file('script.js')

@app.route('/pomodoro.png')
def serve_image():
    return send_file('pomodoro.png')

@app.route('/register', methods=['POST'])
def register():
    print('🔹 Registering User...')
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    # Hash the password and create a new user
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Routes
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    # Find the user by email
    user = User.query.filter_by(email=email).first()

    # Debug: Print the user found (if any)
    if user:
        print(f"User found: id={user.id}, email={user.email}, password={user.password}, created_at={user.created_at}")
    else:
        print("No user found with the specified email.")

    # Verify the user and password
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    # LOGIN SUCCESFULL, RETURN TOKEN AND POMODOROS
    access_token = create_access_token(identity=user.id)
    numberOfPoms = getPomodorosThisMonth(email) 
    numberOfPomsToday = pomodorosToday(email)
    return jsonify({'access_token': access_token, 
                    'numberOfPomodoros': numberOfPoms, 
                    'pomodorosToday': numberOfPomsToday}), 200

@app.route('/updatePomodoro', methods=['POST'])
def updatePomodoro():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400

    user_email = data.get('email')
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user_id = user.id
    # COMM 15/02
    # pomodoro = Pomodoro.query.filter_by(user_id=user_id).first()
    # if not pomodoro:
    #     return jsonify({'message': f'No Pomodoro records found for user_id {pomodoro}'}), 404
    print(160)
    # UPDATING DATABASE WITH POMODORO COUNT
    updatePomodoroByDay(user_email)

    pomdorosDoneToday = pomodorosToday(user_email)
    allPomdorosForUser = sumOfAllPomodorosForUser(user_email)
    return jsonify({'pomodorosToday': pomdorosDoneToday,
                    'allPomdorosForUser': allPomdorosForUser}), 200

def updatePomodoroByDay(user_email_from_updatePomodoro):
    current_date = date.today()  # Ensure it's a date object
    day_of_pomodoro2 = current_date.strftime('%Y-%m-%d')
    # Query should match a date object, not a string
    user = PomodoroCountByDay.query.filter_by(
        user_email=user_email_from_updatePomodoro, 
        day_of_pomodoro=current_date  
    ).first()
    print(228, user)
    if user:
        print(230)
        user.pomodoro_count_by_day += 1
        db.session.commit()
    else:
        print(234)

        new_record_for_that_user = PomodoroCountByDay(
            user_email=user_email_from_updatePomodoro,
            day_of_pomodoro=current_date,  # ✅ Use date object, not string
            pomodoro_count_by_day=1
        )

        db.session.add(new_record_for_that_user)
        db.session.commit()

# RETURNS ALL POMODOROS FOR USER TODAY
def pomodorosToday(userEmail): 
    current_date = date.today()
    day_of_pomodoro = current_date.strftime('%Y-%m-%d')
    user = PomodoroCountByDay.query.filter_by(user_email=userEmail, day_of_pomodoro=current_date).first()
    if user:
        return user.pomodoro_count_by_day
    else:
        return 0

def sumOfAllPomodorosForUser(userEmail):
    # Query all pomodoros for the given user
    year_and_month = datetime.today().strftime('%Y-%m')
    # userSumPomodoros = Pomodoro.query.filter_by(user_email=userEmail).all()
    userSumPomodoros = PomodoroCountByDay.query.filter(
        PomodoroCountByDay.user_email == userEmail,
        func.strftime('%Y-%m', PomodoroCountByDay.day_of_pomodoro) == year_and_month
    ).all()

    print(229, userSumPomodoros)  # Debug print

    # Sum up the pomodoro_count field from each retrieved object
    # total_pomodoros = sum(p.pomodoro_count for p in userSumPomodoros)

    total_pomodoros = sum(record.pomodoro_count_by_day for record in userSumPomodoros)
    print(f"232 Total Pomodoros in {year_and_month}: {total_pomodoros}")

    print(229, total_pomodoros)  # Debug print
    return total_pomodoros

@app.route('/getStatistics', methods=['GET'])
def get_statistics():
    # Retrieve parameters from the query string
    year_and_month = request.args.get("YearAndMonth")  # Format: YYYY-MM
    email = request.args.get("email")

    if not year_and_month or not email:
        return jsonify({"error": "Missing YearAndMonth or email"}), 400

    results = PomodoroCountByDay.query.filter(
        PomodoroCountByDay.user_email == email,
        func.strftime('%Y-%m', PomodoroCountByDay.day_of_pomodoro) == year_and_month
    ).all()

    # Convert results into JSON format
    response = [
        {"date": row.day_of_pomodoro.strftime('%Y-%m-%d'), "pomodoro_count": row.pomodoro_count_by_day}
        for row in results
    ]

    return jsonify({"pomodorosToday": response}), 200


def getPomodorosThisMonth(eeemail):
    current_month_str = datetime.today().strftime("%m")
    # pomodoros = PomodoroCountByDay.query.all(email=eeemail)
    print(275)
    pomodoros = (
    db.session.query(func.sum(PomodoroCountByDay.pomodoro_count_by_day))
    .filter(
        func.strftime('%m', PomodoroCountByDay.day_of_pomodoro) == current_month_str,
        PomodoroCountByDay.user_email == eeemail
    )
    .scalar()  # Fetch the sum directly
    )
    print(284, pomodoros)
    return pomodoros
    # return jsonify({"pomodorosToday": pomodoros}), 200
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)