import sqlite3

conn = sqlite3.connect('homeview.db')
cursor = conn.cursor()

# Get existing data
cursor.execute('SELECT * FROM users')
rows = cursor.fetchall()
print(f'Existing rows: {len(rows)}')

# Rename old table
cursor.execute('ALTER TABLE users RENAME TO users_old')

# Create new table with no NOT NULL constraint on hashed_password
create_sql = (
    "CREATE TABLE users ("
    "id VARCHAR PRIMARY KEY,"
    "name VARCHAR NOT NULL,"
    "email VARCHAR NOT NULL UNIQUE,"
    "hashed_password VARCHAR,"
    "password TEXT,"
    "role VARCHAR(11) NOT NULL DEFAULT 'tenant',"
    "phone VARCHAR,"
    "bio TEXT,"
    "profile_pic VARCHAR,"
    "is_active BOOLEAN DEFAULT 1,"
    "is_verified BOOLEAN DEFAULT 0,"
    "joined_at DATETIME DEFAULT CURRENT_TIMESTAMP"
    ")"
)
cursor.execute(create_sql)

# Copy old data
copy_sql = (
    "INSERT INTO users "
    "SELECT id, name, email, hashed_password, password, role, phone, bio, profile_pic, is_active, is_verified, joined_at "
    "FROM users_old"
)
cursor.execute(copy_sql)

cursor.execute('DROP TABLE users_old')
conn.commit()
print('Table recreated successfully!')

cursor.execute('PRAGMA table_info(users)')
cols = cursor.fetchall()
print('New columns:', [(c[1], c[2], c[3]) for c in cols])

conn.close()
