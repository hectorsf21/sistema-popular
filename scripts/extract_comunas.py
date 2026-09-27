import sqlite3
import json
import os

db_path = "./data/padron.db"

if not os.path.exists(db_path):
    print("Error: No se encontró padron.db")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Extraer todas las comunidades distintas no vacías
cursor.execute('''
    SELECT DISTINCT comunidad 
    FROM padron 
    WHERE comunidad IS NOT NULL 
      AND TRIM(comunidad) != '' 
      AND UPPER(comunidad) NOT IN ('#N/A', 'NONE', 'N/A', 'NAN', 'NULL')
    ORDER BY comunidad ASC
''')

comunas = [row[0].strip() for row in cursor.fetchall() if row[0] and len(row[0].strip()) > 2]
conn.close()

# Guardar en JSON y en TypeScript
os.makedirs("./src/data", exist_ok=True)

with open("./src/data/comunas_list.json", "w", encoding="utf-8") as f:
    json.dump(comunas, f, ensure_ascii=False, indent=2)

with open("./src/data/comunas.ts", "w", encoding="utf-8") as f:
    f.write("// LISTA GENERADA AUTOMATICAMENTE DE CIRCUITOS COMUNALES\n\n")
    f.write("export const COMUNAS_LIST: string[] = ")
    f.write(json.dumps(comunas, ensure_ascii=False, indent=2))
    f.write(";\n")

print(f"¡Éxito! Se extrajeron {len(comunas)} circuitos comunales únicos.")