import sys
import os
import json
import re
import sqlite3

def normalize_cedula(cedula_str):
    if not cedula_str:
        return ""
    cleaned = re.sub(r'[\.\s\-]', '', str(cedula_str).upper())
    if cleaned.isdigit():
        return f"V{cleaned}"
    return cleaned

def verify_person(cedula_input, fecha_nac_input=None):
    db_path = "./data/padron.db"
    
    if not os.path.exists(db_path):
        return {
            "success": False,
            "message": "La base de datos del padrón (padron.db) no existe. Ejecuta convert_to_sqlite.py primero."
        }

    norm_target = normalize_cedula(cedula_input)
    norm_num_only = re.sub(r'[^\d]', '', norm_target)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Buscar por cédula normalizada
    cursor.execute('''
        SELECT cedula_full, nombre, nombres, apellidos, fecha_nac, comunidad, municipio, parroquia 
        FROM padron 
        WHERE cedula_norm = ? OR cedula_norm = ? OR cedula_norm = ?
        LIMIT 1
    ''', (norm_target, f"V{norm_num_only}", norm_num_only))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "success": False,
            "message": f"La cédula {cedula_input} no aparece en el padrón electoral oficial."
        }

    cedula_full, full_name, nom, ape, dob_db, comunidad, mun, par = row

    # Validar fecha estricta si se proporcionó
    if fecha_nac_input and fecha_nac_input != "null":
        t_clean = re.sub(r'[^\d]', '', str(fecha_nac_input))
        db_clean = re.sub(r'[^\d]', '', str(dob_db))
        if t_clean and db_clean and t_clean != db_clean:
            return {
                "success": False,
                "message": "La fecha de nacimiento no coincide con el registro oficial del padrón."
            }

    return {
        "success": True,
        "message": "Usuario verificado exitosamente.",
        "data": {
            "cedula": cedula_full,
            "nombre": full_name,
            "nombres": nom,
            "apellidos": ape,
            "fechaNacimiento": dob_db,
            "comunidad": comunidad,
            "municipio": mun,
            "parroquia": par
        }
    }

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(json.dumps({"success": False, "message": "Faltan argumentos"}))
        sys.exit(1)

    ced = args[0]
    dob = args[1] if len(args) > 1 and args[1] != "null" else None
    res = verify_person(ced, dob)
    print(json.dumps(res, ensure_ascii=False))