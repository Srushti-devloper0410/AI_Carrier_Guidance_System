def recommend_careers(
    interest,
    activity,
    technology,
    skill,
    career_area,
    problem
):

    scores = {
        "Frontend Developer": 0,
        "UI/UX Designer": 0,
        "Data Analyst": 0,
        "Cybersecurity Analyst": 0
    }

    # 1. Interest - Weight: 3
    if interest == "web":
        scores["Frontend Developer"] += 3

    elif interest == "data":
        scores["Data Analyst"] += 3

    elif interest == "design":
        scores["UI/UX Designer"] += 3

    elif interest == "security":
        scores["Cybersecurity Analyst"] += 3


    # 2. Activity - Weight: 2
    if activity == "coding":
        scores["Frontend Developer"] += 2

    elif activity == "analysis":
        scores["Data Analyst"] += 2

    elif activity == "creative":
        scores["UI/UX Designer"] += 2

    elif activity == "security":
        scores["Cybersecurity Analyst"] += 2


    # 3. Technology Interest - Weight: 1
    if technology == "high":
        scores["Frontend Developer"] += 1
        scores["Data Analyst"] += 1
        scores["Cybersecurity Analyst"] += 1

    elif technology == "medium":
        scores["Frontend Developer"] += 1
        scores["Data Analyst"] += 1

    elif technology == "basic":
        scores["UI/UX Designer"] += 1


    # 4. Skill - Weight: 2
    if skill == "programming":
        scores["Frontend Developer"] += 2

    elif skill == "analysis":
        scores["Data Analyst"] += 2

    elif skill == "creativity":
        scores["UI/UX Designer"] += 2

    elif skill == "communication":
        scores["UI/UX Designer"] += 1


    # 5. Career Preference - Weight: 2
    if career_area == "web":
        scores["Frontend Developer"] += 2

    elif career_area == "data":
        scores["Data Analyst"] += 2

    elif career_area == "uiux":
        scores["UI/UX Designer"] += 2

    elif career_area == "cybersecurity":
        scores["Cybersecurity Analyst"] += 2


    # 6. Problem Solving - Weight: 1
    if problem == "logical":
        scores["Frontend Developer"] += 1
        scores["Cybersecurity Analyst"] += 1

    elif problem == "creative":
        scores["UI/UX Designer"] += 1

    elif problem == "research":
        scores["Data Analyst"] += 1
        scores["Cybersecurity Analyst"] += 1


    # Maximum possible score
    max_score = 11

    results = []

    for career, score in scores.items():

        percentage = round((score / max_score) * 100)

        # Keep percentage within 100
        if percentage > 100:
            percentage = 100

        results.append({
            "career": career,
            "match_score": percentage
        })


    # Highest match first
    results.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return results