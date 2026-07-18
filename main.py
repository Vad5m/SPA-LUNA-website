import hashlib
import hmac
import io
import json
import mimetypes
import os
import uuid
from datetime import datetime

import bd
import qrcode
from flask import (
    Flask,
    jsonify,
    make_response,
    redirect,
    render_template,
    request,
    send_file,
    send_from_directory,
    session,
)
from flask_socketio import SocketIO
from PIL import Image
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config["STATIC_FOLDER"] = os.path.join(app.root_path, "static")
app.secret_key = None
UPLOAD_SIZE = 500 * 1024 * 1024
app.config["MAX_CONTENT_LENGTH"] = UPLOAD_SIZE
BOT_TOKEN = None
BOT_USERNAME = None
UPLOAD_FOLDER = "static/uploads/reviews"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

ADMIN_CREDENTIALS = {"username": None, "password": None}

socketio = SocketIO(
    app,
    async_mode="threading",
    max_http_buffer_size=UPLOAD_SIZE,
    logger=True,
    engineio_logger=True,
)

bd.start()


def login_required(f):
    def decorated_function(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect("/admin/login/")
        return f(*args, **kwargs)

    decorated_function.__name__ = f.__name__
    return decorated_function


@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404


class Sites:
    @app.route("/")
    def index():
        out = []
        num = 0
        name_data = ["why_choose_us", "uslugi", "our_team"]
        file_name = ["main", "uslugi", "masters"]
        for x in range(len(name_data)):
            with open(
                f"./static/templates/{file_name[num]}.json", "r", encoding="utf-8"
            ) as file:
                carousel_data = json.load(file)
            carousel_items_data = carousel_data.get(f"{name_data[num]}", {}).get(
                "items", []
            )
            carousel_items = []
            for i, item in enumerate(carousel_items_data):
                carousel_items.append(
                    f'<div class="carousel-item">'
                    + "<img"
                    + f' src="{item["image"]}"'
                    + ' alt="Изображение"'
                    + ' class="carousel-image"'
                    + "/>"
                    + '<div class="carousel-caption">'
                    + '<div class="caption-title">'
                    + f"{item['title']}"
                    + "</div>"
                    + '<div class="caption-text">'
                    + f"{item['text']}"
                    + "</div>"
                    + "</div>"
                    + "</div>"
                )
            out.append("".join(carousel_items))
            num += 1

        return render_template(
            "index.html", main_text=out[0], uslugi=out[1], our_team=out[2]
        )

    @app.route("/uslugi/")
    def uslugi():
        return render_template("uslugi.html")

    @app.route("/done_buy/<num>")
    def done_buy(num):
        return render_template("done_buy.html")

    @app.route("/privacy/")
    def privacy():
        return render_template("privacy.html")

    @app.route("/contaktu/")
    def contaktu():
        return render_template("contaktu.html")

    @app.route("/galareya/")
    def galareya():
        gallery_path = os.path.join(app.static_folder, "galery")
        if not os.path.exists(gallery_path):
            os.makedirs(gallery_path, exist_ok=True)
            return render_template("galareya.html", images=[])
        images = []
        for filename in os.listdir(gallery_path):
            if filename.split(".")[-1].lower() in ALLOWED_IMAGE_EXTENSIONS:
                filepath = os.path.join(gallery_path, filename)
                try:
                    with Image.open(filepath) as img:
                        width, height = img.size
                    name_parts = filename.split(".")[0].split("-")
                    image_data = {
                        "filename": filename,
                        "title": name_parts[0].replace("_", " ")
                        if len(name_parts) > 0
                        else filename.split(".")[0],
                        "author": name_parts[1].replace("_", " ")
                        if len(name_parts) > 1
                        else "",
                        "date": name_parts[2] if len(name_parts) > 2 else "",
                        "dimensions": f"{width}×{height}",
                        "path": f"galery/{filename}",
                    }
                    images.append(image_data)
                except Exception as e:
                    print(f"Error processing image {filename}: {e}")
                    images.append(
                        {
                            "filename": filename,
                            "title": filename.split(".")[0].replace("_", " "),
                            "path": f"galery/{filename}",
                        }
                    )
        images.sort(key=lambda x: x["title"].lower())
        return render_template("galareya.html", images=images)

    @app.route("/news/")
    def news():
        with open(f"./static/templates/news.json", "r", encoding="utf-8") as file:
            news_items = json.load(file)
            return render_template("news.html", news_items=news_items)

    @app.route("/admin/news/")
    def admin_news():
        return render_template("admin_news.html")

    @app.route("/admin/otzuwu/")
    def admin_otzuwu():
        reviews = load_reviews_from_db()
        return render_template("admin_otzuwu.html", reviews=reviews)

    @app.route("/otzuwu/")
    def otzuwu():
        reviews = load_reviews_from_db()
        return render_template("otzuwu.html", reviews=reviews)

    @app.route("/stars/")
    def stars():
        return render_template("stars.html")

    @app.route("/admin/login/", methods=["GET", "POST"])
    def admin_login():
        if request.method == "POST":
            username = request.form.get("username")
            password = request.form.get("password")

            if (
                username == ADMIN_CREDENTIALS["username"]
                and password == ADMIN_CREDENTIALS["password"]
            ):
                session["admin_logged_in"] = True
                session["admin_username"] = username
                return redirect("/admin/news/")
            else:
                return render_template(
                    "admin_login.html", error="Неверный логин или пароль"
                )

        return render_template("admin_login.html")

    @app.route("/admin/logout/")
    def admin_logout():
        session.pop("admin_logged_in", None)
        session.pop("admin_username", None)
        return redirect("/admin/login/")

    @app.route("/api/admin/news", methods=["GET"])
    @login_required
    def get_admin_news():
        try:
            with open(f"./static/templates/news.json", "r", encoding="utf-8") as file:
                news_items = json.load(file)
                return jsonify({"success": True, "news": news_items})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/admin/news/save", methods=["POST"])
    @login_required
    def save_admin_news():
        try:
            data = request.get_json()
            try:
                with open(
                    "./static/templates/news.json", "r", encoding="utf-8"
                ) as file:
                    news_items = json.load(file)
            except FileNotFoundError:
                news_items = []
            max_id = max([item.get("id", 0) for item in news_items], default=0)

            if data.get("id"):
                news_id = int(data["id"])
                for i, item in enumerate(news_items):
                    if item.get("id") == news_id:
                        news_items[i] = {
                            "id": news_id,
                            "title": data.get("title", ""),
                            "content": data.get("content", ""),
                            "media_type": data.get("media_type", "none"),
                            "media_url": data.get("media_url", ""),
                            "date": data.get("date", ""),
                        }
                        break
                else:
                    news_items.append(
                        {
                            "id": news_id,
                            "title": data.get("title", ""),
                            "content": data.get("content", ""),
                            "media_type": data.get("media_type", "none"),
                            "media_url": data.get("media_url", ""),
                            "date": data.get("date", ""),
                        }
                    )
            else:
                new_id = max_id + 1
                news_items.append(
                    {
                        "id": new_id,
                        "title": data.get("title", ""),
                        "content": data.get("content", ""),
                        "media_type": data.get("media_type", "none"),
                        "media_url": data.get("media_url", ""),
                        "date": data.get("date", ""),
                    }
                )
            with open("./static/templates/news.json", "w", encoding="utf-8") as file:
                json.dump(news_items, file, ensure_ascii=False, indent=2)
            return jsonify({"success": True, "message": "Новость сохранена"})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/admin/news/delete/<int:news_id>", methods=["DELETE"])
    @login_required
    def delete_admin_news(news_id):
        try:
            with open("./static/templates/news.json", "r", encoding="utf-8") as file:
                news_items = json.load(file)
            news_items = [item for item in news_items if item.get("id") != news_id]
            with open("./static/templates/news.json", "w", encoding="utf-8") as file:
                json.dump(news_items, file, ensure_ascii=False, indent=2)

            return jsonify({"success": True, "message": "Новость удалена"})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/admin/check-auth", methods=["GET"])
    def check_admin_auth():
        if session.get("admin_logged_in"):
            return jsonify({"authenticated": True})
        return jsonify({"authenticated": False}), 401


class Telega:
    class login_with_tg:
        @staticmethod
        def verify_telegram_data(telegram_data):
            try:
                received_hash = telegram_data.get("hash")
                if not received_hash:
                    print("No hash in Telegram data")
                    return False

                data_check_string = "\n".join(
                    [
                        f"{key}={telegram_data[key]}"
                        for key in sorted(telegram_data.keys())
                        if key != "hash"
                    ]
                )

                print(f"Data check string: {data_check_string}")

                secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()
                computed_hash = hmac.new(
                    secret_key, data_check_string.encode(), hashlib.sha256
                ).hexdigest()

                print(f"Received hash: {received_hash}")
                print(f"Computed hash: {computed_hash}")
                print(
                    f"Hash match: {hmac.compare_digest(computed_hash, received_hash)}"
                )

                return hmac.compare_digest(computed_hash, received_hash)

            except Exception as e:
                print(f"Error verifying Telegram data: {e}")
                return False

        @staticmethod
        @app.route("/auth/telegram", methods=["POST"])
        def telegram_auth():
            try:
                telegram_data = request.get_json()
                print(f"=== AUTH START ===")
                print(f"Received Telegram data: {telegram_data}")

                if not Telega.login_with_tg.verify_telegram_data(telegram_data):
                    print("Telegram data verification FAILED")
                    return jsonify(
                        {"success": False, "error": "Invalid authentication data"}
                    ), 401

                print("Telegram data verification SUCCESS")

                user_data = {
                    "id": telegram_data.get("id"),
                    "first_name": telegram_data.get("first_name", ""),
                    "last_name": telegram_data.get("last_name", ""),
                    "username": telegram_data.get("username", ""),
                    "photo_url": telegram_data.get("photo_url", ""),
                    "auth_date": telegram_data.get("auth_date"),
                }

                session["user"] = user_data
                session["logged_in"] = True

                print(f"Session after auth: {dict(session)}")
                print(f"User authenticated: {user_data}")

                response_data = {"success": True, "user": user_data}

                print(f"Sending response: {response_data}")
                print("=== AUTH END ===")

                return jsonify(response_data)

            except Exception as e:
                print(f"Auth error: {e}")
                return jsonify(
                    {"success": False, "error": "Authentication failed"}
                ), 500

        @staticmethod
        @app.route("/profile")
        def profile():
            print(f"Profile route - logged_in: {session.get('logged_in')}")

            if not session.get("logged_in"):
                print("User not logged in, redirecting to index")
                return redirect("/")

            user = session.get("user")
            print(f"Rendering profile for user: {user}")
            return render_template("profile.html", user=user)

        @staticmethod
        @app.route("/logout")
        def logout():
            print("Logging out user")
            session.clear()
            return redirect("/")

        @staticmethod
        @app.route("/api/user")
        def get_user():
            if session.get("logged_in"):
                return jsonify(session.get("user"))
            return jsonify({"error": "Not authenticated"}), 401

        @staticmethod
        @app.route("/debug")
        def debug():
            debug_info = {
                "session": dict(session),
                "logged_in": session.get("logged_in"),
                "user": session.get("user"),
            }
            return jsonify(debug_info)


class Reviews:
    @app.route("/api/reviews", methods=["POST"])
    def submit_review():
        try:
            print(f"=== REVIEW SUBMISSION START ===")
            print(f"Content-Length header: {request.headers.get('Content-Length')}")
            print(f"Content-Type header: {request.headers.get('Content-Type')}")

            print("Review submission without authentication is allowed")

            user_surname = request.form.get("user_surname")
            user_phone = request.form.get("user_phone")
            comment = request.form.get("comment")

            print(
                f"Received data - user_surname: {user_surname}, user_phone: {user_phone}, comment: {comment}"
            )

            if not comment or not comment.strip():
                print("Comment is empty")
                return jsonify({"success": False, "error": "Comment is required"}), 400

            if not user_surname or not user_surname.strip():
                print("Surname is empty")
                return jsonify({"success": False, "error": "Фамилия обязательна"}), 400

            if not user_phone or not user_phone.strip():
                print("Phone is empty")
                return jsonify({"success": False, "error": "Телефон обязателен"}), 400

            media_files = []
            if "media_files" in request.files:
                files = request.files.getlist("media_files")
                print(f"Received {len(files)} files")

                if len(files) > 15:
                    return jsonify(
                        {
                            "success": False,
                            "error": "Можно загрузить не более 15 файлов",
                        }
                    ), 400

                ALLOWED_EXTENSIONS = {
                    "png",
                    "jpg",
                    "jpeg",
                    "gif",
                    "mp4",
                    "mov",
                    "avi",
                    "mkv",
                }

                for file in files:
                    if file and file.filename:
                        file_ext = (
                            os.path.splitext(file.filename)[1].lower().lstrip(".")
                        )
                        if file_ext not in ALLOWED_EXTENSIONS:
                            return jsonify(
                                {
                                    "success": False,
                                    "error": f"Недопустимый формат файла: {file.filename}. Разрешены: {', '.join(ALLOWED_EXTENSIONS)}",
                                }
                            ), 400

                total_size = 0
                for file in files:
                    if file and file.filename:
                        file_size = len(file.read())
                        file.seek(0)
                        total_size += file_size
                        print(
                            f"File: {file.filename}, Size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)"
                        )

                print(
                    f"Total files size: {total_size} bytes ({total_size / 1024 / 1024:.2f} MB)"
                )

                if total_size > UPLOAD_SIZE:
                    return jsonify(
                        {
                            "success": False,
                            "error": "Общий размер файлов превышает 500MB",
                        }
                    ), 400

                for file in files:
                    if file and file.filename:
                        print(f"Processing file: {file.filename}")
                        file_ext = os.path.splitext(file.filename)[1]
                        filename = f"{uuid.uuid4()}{file_ext}"
                        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                        os.makedirs(os.path.dirname(file_path), exist_ok=True)

                        file.save(file_path)
                        media_files.append(filename)
                        print(f"File saved: {filename}")

            photo_review = ",".join(media_files) if media_files else None
            save_review_to_db(
                user_id=None,
                user_name=user_surname,
                user_phone=user_phone,
                review_text=comment,
                photo_review=photo_review,
            )

            print("=== REVIEW SUBMISSION SUCCESS ===")
            return jsonify(
                {
                    "success": True,
                    "message": "Review submitted successfully",
                    "media_count": len(media_files),
                }
            )

        except Exception as e:
            print(f"=== REVIEW SUBMISSION ERROR ===")
            print(f"Error type: {type(e)}")
            print(f"Error message: {str(e)}")
            import traceback

            traceback.print_exc()
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/reviews/formatted", methods=["GET"])
    def get_formatted_reviews():
        try:
            reviews = load_reviews_from_db()

            formatted_reviews = []
            for review in reviews:
                media_files = []
                if review.get("photo_review"):
                    media_list = review["photo_review"].split(",")
                    for media_file in media_list:
                        if media_file.strip():
                            media_files.append(
                                {
                                    "url": f"/static/uploads/reviews/{media_file.strip()}",
                                    "type": "image"
                                    if media_file.lower().endswith(
                                        (".png", ".jpg", ".jpeg", ".gif")
                                    )
                                    else "video",
                                }
                            )

                formatted_reviews.append(
                    {
                        "id": review.get("id"),
                        "user_name": review.get("user_name", "Аноним"),
                        "comment": review.get("review_text", ""),
                        "date": review.get("created_at", ""),
                        "media_files": media_files,
                    }
                )

            return jsonify({"success": True, "reviews": formatted_reviews})
        except Exception as e:
            print(f"Error loading reviews: {e}")
            return jsonify({"success": False, "error": "Error loading reviews"}), 500

    @app.route("/api/reviews/all-media", methods=["GET"])
    def get_all_media():
        try:
            reviews = load_reviews_from_db()
            all_media = []

            for review in reviews:
                if review.get("photo_review"):
                    media_list = review["photo_review"].split(",")
                    for media_file in media_list:
                        if media_file.strip():
                            all_media.append(
                                {
                                    "url": f"/static/uploads/reviews/{media_file.strip()}",
                                    "type": "image"
                                    if media_file.lower().endswith(
                                        (".png", ".jpg", ".jpeg", ".gif")
                                    )
                                    else "video",
                                    "user_name": review.get("user_name", "Аноним"),
                                }
                            )

            return jsonify({"success": True, "media": all_media})
        except Exception as e:
            print(f"Error loading all media: {e}")
            return jsonify({"success": False, "error": "Error loading media"}), 500

    @app.route("/api/reviews/all-files", methods=["GET"])
    def get_all_files_from_folder():
        try:
            upload_folder = app.config["UPLOAD_FOLDER"]
            all_files = []

            print(f"=== GET ALL FILES FROM FOLDER ===")
            print(f"Scanning folder: {upload_folder}")

            if not os.path.exists(upload_folder):
                print(f"Folder does not exist: {upload_folder}")
                os.makedirs(upload_folder, exist_ok=True)
                return jsonify({"success": True, "files": []})

            for filename in os.listdir(upload_folder):
                file_path = os.path.join(upload_folder, filename)
                if os.path.isdir(file_path):
                    continue
                file_ext = filename.lower().split(".")[-1]
                file_type = (
                    "image"
                    if file_ext in ["png", "jpg", "jpeg", "gif", "webp", "bmp"]
                    else "video"
                )
                try:
                    file_stats = os.stat(file_path)
                    file_size = file_stats.st_size

                    all_files.append(
                        {
                            "filename": filename,
                            "url": f"/static/uploads/reviews/{filename}",
                            "type": file_type,
                            "size": file_size,
                            "created": datetime.fromtimestamp(
                                file_stats.st_ctime
                            ).isoformat(),
                        }
                    )
                except Exception as e:
                    print(f"Error processing file {filename}: {e}")
                    continue
            all_files.sort(key=lambda x: x["created"], reverse=True)

            return jsonify({"success": True, "files": all_files})

        except Exception as e:
            print(f"Error scanning folder: {e}")
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/api/reviews", methods=["GET"])
    def get_reviews():
        try:
            reviews = load_reviews_from_db()
            print(f"=== SENDING REVIEWS TO FRONTEND ===")
            print(f"Total reviews: {len(reviews)}")

            for i, review in enumerate(reviews):
                print(f"Review {i + 1}:")
                print(f"  User: {review.get('user_name')}")
                print(f"  Comment: {review.get('comment')[:50]}...")
                print(f"  Media files: {len(review.get('media_files', []))}")
                for j, media in enumerate(review.get("media_files", [])):
                    print(f"    Media {j + 1}: {media['url']} (type: {media['type']})")

            return jsonify({"success": True, "reviews": reviews})
        except Exception as e:
            print(f"Error loading reviews: {e}")
            return jsonify({"success": False, "error": "Error loading reviews"}), 500

    @app.route("/api/debug/reviews", methods=["GET"])
    def debug_reviews():
        try:
            reviews = load_reviews_from_db()
            return jsonify(
                {"success": True, "reviews_count": len(reviews), "reviews": reviews}
            )
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500


class Certificates:
    @app.route("/api/create_certificate")
    def create_certificate():
        return render_template("sert.html")


@app.route("/api/admin/reviews/delete/<int:review_id>", methods=["DELETE"])
def delete_review_api(review_id):
    try:
        if not session.get("admin_logged_in"):
            return jsonify({"success": False, "error": "Not authenticated"}), 401

        print(f"=== DELETE REVIEW START ===")
        print(f"Deleting review with ID: {review_id}")

        result = bd.delete_review(review_id)

        if result["success"]:
            if result.get("photo_review"):
                media_list = result["photo_review"].split(",")
                for media_file in media_list:
                    if media_file.strip():
                        file_path = os.path.join(
                            app.config["UPLOAD_FOLDER"], media_file.strip()
                        )
                        if os.path.exists(file_path):
                            try:
                                os.remove(file_path)
                                print(f"Deleted media file: {media_file}")
                            except Exception as e:
                                print(f"Error deleting media file {media_file}: {e}")

            print(f"Review {review_id} deleted successfully")
            print("=== DELETE REVIEW SUCCESS ===")
            return jsonify(
                {
                    "success": True,
                    "message": "Review deleted successfully",
                    "review_id": review_id,
                }
            )
        else:
            print(f"Failed to delete review {review_id}: {result.get('error')}")
            return jsonify(
                {
                    "success": False,
                    "error": result.get("error", "Failed to delete review"),
                }
            ), 500

    except Exception as e:
        print(f"=== DELETE REVIEW ERROR ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"success": False, "error": "Internal server error"}), 500


@app.route("/api/upload/gallery", methods=["POST"])
def upload_gallery_image():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400

    if file and allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS):
        filename = secure_filename(file.filename)
        gallery_path = os.path.join(app.static_folder, "galery")
        os.makedirs(gallery_path, exist_ok=True)
        file_path = os.path.join(gallery_path, filename)
        file.save(file_path)

        return jsonify(
            {
                "success": True,
                "filename": filename,
                "message": "File uploaded successfully",
            }
        )

    return jsonify({"success": False, "error": "Invalid file type"}), 400


def allowed_file(filename, allowed_extensions):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "success": True,
            "message": "Server is running",
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.route("/api/test/review", methods=["POST"])
def test_review():
    try:
        print("=== TEST REVIEW ENDPOINT ===")
        print("Headers:", dict(request.headers))
        print("Form data:", dict(request.form))
        print("Files:", request.files)

        return jsonify(
            {
                "success": True,
                "message": "Test endpoint works",
                "received_data": {
                    "form": dict(request.form),
                    "files_count": len(request.files),
                },
            }
        )
    except Exception as e:
        print(f"Test endpoint error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


def save_review_to_db(
    user_id, user_name, user_phone=None, review_text=None, photo_review=None
):
    try:
        if hasattr(bd, "add_new_client_with_review"):
            bd.add_new_client_with_review(
                user_id=user_id,
                name=user_name,
                phone=user_phone,
                review=review_text,
                photo_review=photo_review,
            )
        elif hasattr(bd, "add_review"):
            bd.add_review(
                user_name=user_name,
                user_phone=user_phone,
                review_text=review_text,
                photo_review=photo_review,
            )
        else:
            query = """
                INSERT INTO reviews (user_id, user_name, user_phone, review_text, photo_review, created_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
            """
            bd.execute(
                query, (user_id, user_name, user_phone, review_text, photo_review)
            )

        print(f"Review saved to database for user {user_name}")
    except Exception as e:
        print(f"Error saving review to database: {e}")
        raise


def load_reviews_from_db():
    try:
        reviews = bd.get_all_reviews()
        print(f"Loaded {len(reviews)} reviews from database")
        for review in reviews:
            print(
                f"Review from {review['user_name']}: {len(review.get('media_files', []))} media files"
            )
        return reviews
    except Exception as e:
        print(f"Error loading reviews from database: {e}")
        return []


class utilits:
    class pas:
        @app.route("/static/music/<path:filename>")
        def music_files(filename):
            return send_from_directory("static/music", filename)

        @app.route("/static/<path:filename>")
        def static_files(filename):
            return send_from_directory(app.config["STATIC_FOLDER"], filename)

        @app.route("/static/uploads/reviews/<path:filename>")
        def review_media_files(filename):
            return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    class SEO:
        @app.route("/robots.txt")
        def robots():
            return send_from_directory(app.static_folder, "robots.txt")

        @app.route("/sitemap.xml")
        def sitemap():
            return send_from_directory(app.static_folder, "sitemap.xml")


@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=6789, debug=True, allow_unsafe_werkzeug=True)
