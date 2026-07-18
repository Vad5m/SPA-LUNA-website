import sqlite3
from datetime import datetime

def start():
    conn = sqlite3.connect(None)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        phone TEXT,
        date_rewiew TEXT,
        photo_rewiew TEXT,
        rewiew TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certificates (
        certificate_id TEXT PRIMARY KEY,
        certificate_qr_text TEXT,
        certificate_created_date TEXT
    )
    """)
    conn.commit()
    conn.close()
    print("База данных успешно создана!")

def add_new_client(user_id, name, phone, review=""):
    conn = sqlite3.connect(None)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO clients (user_id, name, phone, rewiew, date_rewiew, photo_rewiew)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, name, phone, None, None, None))

    conn.commit()
    conn.close()
    print(f"Клиент {name} успешно добавлен в базу данных!")

def add_new_client_with_review(user_id, name, review, photo_review=None, phone=None):
    conn = sqlite3.connect(None)
    cursor = conn.cursor()

    current_date = datetime.now().strftime("%d.%m.%Y %H:%M:%S")

    cursor.execute("""
    INSERT INTO clients (user_id, name, phone, rewiew, date_rewiew, photo_rewiew)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, name, phone, review, current_date, photo_review))

    conn.commit()
    conn.close()
    print(f"Отзыв от {name} успешно добавлен в базу данных!")

def delete_review(review_id):
    try:
        conn = sqlite3.connect(None)
        cursor = conn.cursor()

        cursor.execute("""
        SELECT photo_rewiew FROM clients WHERE id = ? AND rewiew IS NOT NULL
        """, (review_id,))

        result = cursor.fetchone()
        photo_review = result[0] if result else None

        cursor.execute("""
        DELETE FROM clients WHERE id = ? AND rewiew IS NOT NULL
        """, (review_id,))

        conn.commit()
        conn.close()

        if cursor.rowcount > 0:
            print(f"Отзыв с ID {review_id} успешно удален из базы данных")
            return {
                'success': True,
                'photo_review': photo_review
            }
        else:
            print(f"Отзыв с ID {review_id} не найден или не является отзывом")
            return {'success': False, 'error': 'Review not found'}

    except Exception as e:
        print(f"Ошибка при удалении отзыва: {e}")
        return {'success': False, 'error': str(e)}

def get_all_reviews():
    conn = sqlite3.connect(None)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id, user_id, name, rewiew, date_rewiew, photo_rewiew
    FROM clients
    WHERE rewiew IS NOT NULL AND rewiew != ''
    ORDER BY date_rewiew DESC
    """)

    reviews = []
    for row in cursor.fetchall():
        id, user_id, name, review_text, date_review, photo_review = row

        media_files = []
        if photo_review:
            media_list = [media.strip() for media in photo_review.split(",") if media.strip()]
            for media_file in media_list:
                if media_file and media_file != 'undefined':
                    media_files.append({
                        'url': f"/static/uploads/reviews/{media_file}",
                        'type': 'image' if media_file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp')) else 'video'
                    })

        review_data = {
            'id': id,
            'user_id': user_id,
            'user_name': name,
            'comment': review_text,
            'media_files': media_files,
            'timestamp': date_review,
            'date_display': date_review
        }
        reviews.append(review_data)

    conn.close()
    return reviews

def add_new_certificate(certificate_id, certificate_qr_text):
    conn = sqlite3.connect(None)
    cursor = conn.cursor()

    current_date = datetime.now().strftime("%d.%m.%Y")

    cursor.execute("""
    INSERT INTO certificates (certificate_id, certificate_qr_text, certificate_created_date)
    VALUES (?, ?, ?)
    """, (certificate_id, certificate_qr_text, current_date))

    conn.commit()
    conn.close()
    print(f"Сертификат {certificate_id} успешно добавлен в базу данных!")
