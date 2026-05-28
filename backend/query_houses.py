import sqlite3

conn = sqlite3.connect('homeview.db')
c = conn.cursor()
c.execute('SELECT * FROM houses')
rows = c.fetchall()
print(f'Total houses: {len(rows)}')
for row in rows:
    print(row)
conn.close()

# Write to file
with open('houses_output.txt', 'w') as f:
    f.write(f'Total houses: {len(rows)}\n')
    for row in rows:
        f.write(str(row) + '\n')