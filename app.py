import os
import sqlite3
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token

from database import init_db, get_db_connection

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__)

# The storefront and API are served by the same Flask app/origin.
# CORS remains enabled for local development and external API testing.
CORS(app, resources={r"/api/*": {"origins": "*"}})

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "").strip()

# Initialize the database when the function/container starts.
# On Vercel, database.py automatically uses /tmp.
init_db()


# ---------------------------------------------------------------------------
# FRONTEND
# ---------------------------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/admin", methods=["GET"])
@app.route("/admin.html", methods=["GET"])
def admin_page():
    return send_from_directory(BASE_DIR, "admin.html")


@app.route("/css/<path:filename>", methods=["GET"])
def css_files(filename):
    return send_from_directory(BASE_DIR / "css", filename)


@app.route("/js/<path:filename>", methods=["GET"])
def js_files(filename):
    return send_from_directory(BASE_DIR / "js", filename)


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "database": "sqlite"})


@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    identifier = str(data.get("identifier", "")).strip()
    password = str(data.get("password", "")).strip()

    if not identifier or not password:
        return jsonify({
            "status": "error",
            "message": "Identifier and password are required."
        }), 400

    conn = get_db_connection()
    try:
        user = conn.execute(
            """
            SELECT id, name, email, phone
            FROM users
            WHERE (LOWER(email) = LOWER(?) OR phone = ?)
              AND password = ?
            """,
            (identifier, identifier, password),
        ).fetchone()
    finally:
        conn.close()

    if not user:
        return jsonify({
            "status": "error",
            "message": "Invalid email/phone or password."
        }), 401

    return jsonify({
        "status": "success",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
        },
    })


@app.route("/api/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    password = str(data.get("password", "")).strip()

    if not name or not email or not phone or not password:
        return jsonify({
            "status": "error",
            "message": "Name, email, phone, and password are required."
        }), 400

    if len(password) < 6:
        return jsonify({
            "status": "error",
            "message": "Password must be at least 6 characters long."
        }), 400

    normalized_phone = "".join(ch for ch in phone if ch.isdigit())
    if len(normalized_phone) != 10:
        return jsonify({
            "status": "error",
            "message": "Please enter a valid 10-digit mobile number."
        }), 400

    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({
            "status": "error",
            "message": "Please enter a valid email address."
        }), 400

    conn = get_db_connection()
    try:
        existing_user = conn.execute(
            "SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR phone = ?",
            (email, normalized_phone),
        ).fetchone()

        if existing_user:
            return jsonify({
                "status": "error",
                "message": "An account with this email or phone number already exists."
            }), 409

        cursor = conn.execute(
            "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
            (name, email, normalized_phone, password),
        )

        user = conn.execute(
            "SELECT id, name, email, phone FROM users WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()

        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        return jsonify({
            "status": "error",
            "message": "An account with this email or phone number already exists."
        }), 409
    finally:
        conn.close()

    return jsonify({
        "status": "success",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
        },
    })


@app.route("/api/auth/google", methods=["POST", "OPTIONS"])
def google_login():
    if request.method == "OPTIONS":
        return "", 204

    if not GOOGLE_CLIENT_ID:
        return jsonify({
            "status": "error",
            "message": "Google sign-in is not configured on the server."
        }), 503

    credential = (request.get_json(silent=True) or {}).get("credential", "")
    if not credential:
        return jsonify({
            "status": "error",
            "message": "Google credential is required."
        }), 400

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            GoogleRequest(),
            GOOGLE_CLIENT_ID,
        )
    except Exception:
        return jsonify({
            "status": "error",
            "message": "Google sign-in could not be verified. Please try again."
        }), 401

    if (
        not google_user.get("email_verified")
        or not google_user.get("sub")
        or not google_user.get("email")
    ):
        return jsonify({
            "status": "error",
            "message": "Google did not provide a verified email address."
        }), 401

    conn = get_db_connection()
    try:
        conn.execute(
            """
            INSERT INTO google_accounts (google_sub, email, name)
            VALUES (?, ?, ?)
            ON CONFLICT(google_sub)
            DO UPDATE SET email = excluded.email, name = excluded.name
            """,
            (
                google_user["sub"],
                google_user["email"],
                google_user.get("name") or google_user["email"],
            ),
        )

        account = conn.execute(
            "SELECT id, name, email FROM google_accounts WHERE google_sub = ?",
            (google_user["sub"],),
        ).fetchone()

        conn.commit()
    finally:
        conn.close()

    return jsonify({
        "status": "success",
        "user": {
            "id": account["id"],
            "name": account["name"],
            "email": account["email"],
            "phone": "",
        },
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
