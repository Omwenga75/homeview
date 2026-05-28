import sqlite3

conn = sqlite3.connect('homeview.db')
c = conn.cursor()
c.execute('INSERT INTO houses (title, location, price, description, owner_name, owner_email, status, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          ('Test House', 'Nairobi, Kenya', 25000, 'A beautiful test house', 'Nelson Omwenga', 'nelson@example.com', 'approved', 0))
conn.commit()
house_id = c.lastrowid
print(f'House added with ID: {house_id}')
conn.close()