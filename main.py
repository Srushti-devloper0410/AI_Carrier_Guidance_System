from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash
import jwt
from datetime import datetime, timedelta, timezone
import os
from recommendation import recommend_careers
from database import get_connection

# Authentication Security Configuration

password_hash = PasswordHash.recommended()
security = HTTPBearer()

SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable is missing")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = int(payload.get("sub"))

    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, name, email, role FROM users WHERE id = %s",
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    finally:
        cursor.close()
        connection.close()

app = FastAPI(title="AI Career Guidance System")

@app.get("/students/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                id, name, email, course, year,
                percentage, stream, skills, interest
            FROM students
            WHERE user_id = %s
            """,
            (current_user["id"],)
        )

        student = cursor.fetchone()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student profile not found"
            )

        return student

    finally:
        cursor.close()
        connection.close()


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# Student Profile Model
# --------------------------------

class StudentProfile(BaseModel):
    name: str
    email: str
    course: str
    year: str
    percentage: float
    stream: str
    skills: str
    interest: str


# --------------------------------
# Career Assessment Model
# --------------------------------

class CareerRequest(BaseModel):
    interest: str
    activity: str
    technology: str
    skill: str
    career_area: str
    problem: str


# --------------------------------
# Home Route
# --------------------------------

@app.get("/")
def home():

    return {
        "message": "AI Career Guidance System Backend is Running!"
    }


# --------------------------------
# Career List
# --------------------------------

@app.get("/careers")
def careers():

    return {
        "careers": [
            "Frontend Developer",
            "UI/UX Designer",
            "Data Analyst",
            "Cybersecurity Analyst"
        ]
    }


# --------------------------------
# Save Student Profile
# --------------------------------

@app.post("/students")
def add_student(
    data: StudentProfile,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
            INSERT INTO students
            (user_id, name, email, course, year, percentage, stream, skills, interest)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            current_user["id"],
            current_user["name"],
            current_user["email"],
            data.course,
            data.year,
            data.percentage,
            data.stream,
            data.skills,
            data.interest
        )

        cursor.execute(query, values)
        connection.commit()

        return {
            "message": "Student profile saved successfully!",
            "student_id": cursor.lastrowid
        }

    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save student profile"
        )

    finally:
        cursor.close()
        connection.close()
# --------------------------------
# Update Existing Student Profile
# --------------------------------

@app.put("/students/me")
def update_my_profile(
    data: StudentProfile,
    current_user: dict = Depends(get_current_user)
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
            UPDATE students
            SET
                name = %s,
                email = %s,
                course = %s,
                year = %s,
                percentage = %s,
                stream = %s,
                skills = %s,
                interest = %s
            WHERE user_id = %s
        """

        values = (
            current_user["name"],
            current_user["email"],
            data.course,
            data.year,
            data.percentage,
            data.stream,
            data.skills,
            data.interest,
            current_user["id"]
        )

        cursor.execute(query, values)
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Student profile not found"
            )

        return {
            "message": "Student profile updated successfully!"
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update student profile"
        )

    finally:
        cursor.close()
        connection.close()

# --------------------------------
# Assessment Model
# --------------------------------

class AssessmentData(BaseModel):
    student_id: int
    interest: str
    activity: str
    technology: str
    skill: str
    career: str
    problem: str


# --------------------------------
# Save Assessment
# --------------------------------

@app.post("/assessments")
def add_assessment(data: AssessmentData):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO assessments
        (student_id, interest, activity, technology, skill, career, problem)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        data.student_id,
        data.interest,
        data.activity,
        data.technology,
        data.skill,
        data.career,
        data.problem
    )

    cursor.execute(query, values)
    connection.commit()

    assessment_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "Assessment saved successfully!",
        "assessment_id": assessment_id
    }


# --------------------------------
# Recommendation Data Model
# --------------------------------

class RecommendationData(BaseModel):
    student_id: int
    career: str
    match_score: int


# --------------------------------
# Career Recommendation
# --------------------------------

@app.post("/recommend")
def get_recommendation(data: CareerRequest):

    results = recommend_careers(
        data.interest,
        data.activity,
        data.technology,
        data.skill,
        data.career_area,
        data.problem
    )

    return {
        "recommendations": results
    }


# --------------------------------
# Save Career Recommendations
# --------------------------------

@app.post("/recommendations")
def add_recommendation(data: RecommendationData):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO recommendations
        (student_id, career, match_score)
        VALUES (%s, %s, %s)
    """

    values = (
        data.student_id,
        data.career,
        data.match_score
    )

    cursor.execute(query, values)
    connection.commit()

    recommendation_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "Recommendation saved successfully!",
        "recommendation_id": recommendation_id
    }

class ContactMessage(BaseModel):
    name:str
    email:str
    subject:str
    message:str
@app.post("/contact")
def save_contact_message(data: ContactMessage):
    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO contact_messages
        (name, email, subject, message)
        VALUES (%s, %s, %s, %s)
    """

    values = (
        data.name,
        data.email,
        data.subject,
        data.message
    )

    cursor.execute(query, values)
    connection.commit()

    message_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "Contact message saved successfully!",
        "message_id": message_id
    }

#signup data basemodel
class SignupData(BaseModel):
    name: str
    email: EmailStr
    password: str


@app.post("/auth/signup")
def signup(data: SignupData):
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters"
        )

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (str(data.email),)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail="Email already registered"
            )

        hashed_password = password_hash.hash(data.password)

        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            """,
            (data.name, str(data.email), hashed_password)
        )

        connection.commit()

        return {"message": "Signup successful"}

    except HTTPException:
        connection.rollback()
        raise
    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create account"
        )
    finally:
        cursor.close()
        connection.close()

class LoginData(BaseModel):
    email: EmailStr
    password: str


@app.post("/auth/login")
def login(data: LoginData):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, name, email, password_hash, role FROM users WHERE email = %s",
            (str(data.email),)
        )
        user = cursor.fetchone()

        if not user or not password_hash.verify(data.password, user["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

        token = jwt.encode(
            {
                "sub": str(user["id"]),
                "email": user["email"],
                "role": user["role"],
                "exp": expire
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "message": "Login successful",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to login. Please try again."
        )
    finally:
        cursor.close()
        connection.close()


# =========================================
# ADMIN AUTHENTICATION
# =========================================

def get_current_admin(
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin permission required."
        )

    return current_user


# =========================================
# ADMIN DASHBOARD API
# =========================================

@app.get("/admin/dashboard")
def get_admin_dashboard(
    admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Dashboard Statistics
        cursor.execute("SELECT COUNT(*) AS total FROM students")
        total_students = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM assessments")
        total_assessments = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM recommendations")
        total_recommendations = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM contact_messages")
        total_messages = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) AS total FROM users")
        total_users = cursor.fetchone()["total"]

        # Recent Students
        cursor.execute("""
            SELECT
                id,
                name,
                email,
                course,
                year,
                percentage,
                stream
            FROM students
            ORDER BY id DESC
            LIMIT 10
        """)
        recent_students = cursor.fetchall()

        # Recent Assessments
        cursor.execute("""
            SELECT
                a.id,
                a.student_id,
                s.name AS student_name,
                a.career,
                a.created_at
            FROM assessments a
            LEFT JOIN students s ON a.student_id = s.id
            ORDER BY a.id DESC
            LIMIT 10
        """)
        recent_assessments = cursor.fetchall()

        # Recent Recommendations
        cursor.execute("""
            SELECT
                r.id,
                r.student_id,
                s.name AS student_name,
                r.career,
                r.match_score,
                r.created_at
            FROM recommendations r
            LEFT JOIN students s ON r.student_id = s.id
            ORDER BY r.id DESC
            LIMIT 10
        """)
        recent_recommendations = cursor.fetchall()

        # Recent Contact Messages
        cursor.execute("""
            SELECT
                id,
                name,
                email,
                subject,
                message,
                created_at
            FROM contact_messages
            ORDER BY id DESC
            LIMIT 10
        """)
        recent_messages = cursor.fetchall()

        # Recent Users
        cursor.execute("""
            SELECT
                id,
                name,
                email,
                role,
                created_at
            FROM users
            ORDER BY id DESC
            LIMIT 10
        """)
        recent_users = cursor.fetchall()

        return {
            "statistics": {
                "total_students": total_students,
                "total_assessments": total_assessments,
                "total_recommendations": total_recommendations,
                "total_messages": total_messages,
                "total_users": total_users
            },
            "recent_students": recent_students,
            "recent_assessments": recent_assessments,
            "recent_recommendations": recent_recommendations,
            "recent_messages": recent_messages,
            "recent_users": recent_users
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to load admin dashboard data"
        )

    finally:
        cursor.close()
        connection.close()


    
# =========================================
# ADMIN STUDENTS MANAGEMENT
# =========================================

@app.get("/admin/students")
def get_all_students(
    search: str = "",
    admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = """
            SELECT
                id, name, email, course, year,
                percentage, stream, skills, interest
            FROM students
            WHERE name LIKE %s OR email LIKE %s
            ORDER BY id DESC
        """

        search_value = f"%{search.strip()}%"
        cursor.execute(query, (search_value, search_value))

        return {
            "students": cursor.fetchall()
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch students"
        )

    finally:
        cursor.close()
        connection.close()


@app.get("/admin/students/{student_id}")
def get_student_details(
    student_id: int,
    admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                id, name, email, course, year,
                percentage, stream, skills, interest
            FROM students
            WHERE id = %s
            """,
            (student_id,)
        )

        student = cursor.fetchone()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        return {"student": student}

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch student details"
        )

    finally:
        cursor.close()
        connection.close()


