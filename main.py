from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from recommendation import recommend_careers
from database import get_connection


app = FastAPI(title="AI Career Guidance System")


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
def add_student(data: StudentProfile):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO students
        (name, email, course, year, percentage, stream, skills, interest)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        data.name,
        data.email,
        data.course,
        data.year,
        data.percentage,
        data.stream,
        data.skills,
        data.interest
    )

    cursor.execute(query, values)
    connection.commit()

    student_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "Student profile saved successfully!",
        "student_id": student_id
    }


# --------------------------------
# Update Existing Student Profile
# --------------------------------

@app.put("/students/{student_id}")
def update_student(student_id: int, data: StudentProfile):

    connection = get_connection()
    cursor = connection.cursor()

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
        WHERE id = %s
    """

    values = (
        data.name,
        data.email,
        data.course,
        data.year,
        data.percentage,
        data.stream,
        data.skills,
        data.interest,
        student_id
    )

    cursor.execute(query, values)
    connection.commit()

    if cursor.rowcount == 0:

        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    cursor.close()
    connection.close()

    return {
        "message": "Student profile updated successfully!",
        "student_id": student_id
    }


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
    