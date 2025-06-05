import os
import json
from flask import Flask, request, jsonify, render_template, send_from_directory, Response, redirect, url_for, session
from werkzeug.utils import secure_filename
from datetime import datetime

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
DB_FILE = 'db.json'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db():
    if not os.path.exists(DB_FILE):
        return {"documents": {}}
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)


@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['username']
        senha = request.form['password']
        if usuario == 'better' and senha == 'life':
            return redirect(url_for('dashboard')) 
        else:
            return render_template('login.html', erro='Login incorreto.')
    return render_template('login.html')

@app.route('/dashboard')
def index():
    return render_template('index.html')

@app.route('/details/<filename>')
def document_details(filename):
    return render_template('details.html', filename=filename)

@app.route('/documents')
def documents():
    return render_template('documents.html')

@app.route('/api/documents', methods=['GET'])
def get_documents():
    db = get_db()
    search_query = request.args.get('q', '').lower()
    
    if search_query:
        filtered_docs = {}
        for filename, meta in db['documents'].items():
            
            if (search_query in filename.lower() or
                search_query in meta.get('status', '').lower() or
                search_query in meta.get('owner', '').lower() or
                any(search_query in tag.lower() for tag in meta.get('tags', []))):
                filtered_docs[filename] = meta
        return jsonify(filtered_docs)
        
    return jsonify(db.get('documents', {}))

@app.route('/api/documents/<filename>', methods=['GET'])
def get_document_details(filename):
    db = get_db()
    document = db['documents'].get(filename)
    if document:
        return jsonify(document)
    return jsonify({"error": "Documento não encontrado"}), 404
    
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nome de arquivo inválido"}), 400

    if file:
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if os.path.exists(save_path):
            return jsonify({"error": f"O arquivo '{filename}' já existe."}), 409

        file.save(save_path)
        
        db = get_db()
        timestamp = datetime.now().isoformat()
        db['documents'][filename] = {
            "status": "Iniciado",
            "owner": "Não atribuído",
            "tags": [],
            "history": [{"event": "Documento criado", "timestamp": timestamp}],
            "is_signed": False,
            "due_date": None,
            "permissions": ["admin", "editor"] 
        }
        save_db(db)
        
        return jsonify({"message": f"'{filename}' enviado com sucesso!", "filename": filename}), 201

@app.route('/api/documents/<filename>', methods=['PUT'])
def update_document(filename):
    db = get_db()
    if filename not in db['documents']:
        return jsonify({"error": "Documento não encontrado"}), 404

    update_data = request.json
    doc = db['documents'][filename]
    
    timestamp = datetime.now().isoformat()
    updated = False
    if 'status' in update_data and update_data['status'] != doc.get('status'):
        history_entry = {
            "timestamp": timestamp,
            "event": f"Status alterado de '{doc.get('status')}' para '{update_data['status']}'"
        }
        doc['status'] = update_data['status']
        doc['history'].append(history_entry)
        updated = True
    if 'tags' in update_data and update_data['tags'] != doc.get('tags'):
        history_entry = {
            "timestamp": timestamp,
            "event": f"Tags atualizadas para: {', '.join(update_data['tags'])}"
        }
        doc['tags'] = update_data['tags']
        doc['history'].append(history_entry)
        updated = True
    if 'owner' in update_data and update_data['owner'] != doc.get('owner'):
        history_entry = {
            "timestamp": timestamp,
            "event": f"Responsável alterado para: {update_data['owner']}"
        }
        doc['owner'] = update_data['owner']
        doc['history'].append(history_entry)
        updated = True
    if 'is_signed' in update_data and update_data['is_signed'] != doc.get('is_signed'):
        history_entry = {
            "timestamp": timestamp,
            "event": "Documento assinado digitalmente"
        }
        doc['is_signed'] = update_data['is_signed']
        doc['history'].append(history_entry)
        updated = True
    if 'due_date' in update_data and update_data['due_date'] != doc.get('due_date'):
        history_entry = {
            "timestamp": timestamp,
            "event": f"Prazo definido para: {update_data['due_date']}"
        }
        doc['due_date'] = update_data['due_date']
        doc['history'].append(history_entry)
        updated = True

    if updated:
        save_db(db)
        return jsonify({"message": "Documento atualizado com sucesso!", "document": doc})
    else:
        return jsonify({"message": "Nenhuma alteração detectada."})


@app.route('/api/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    db = get_db()
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    if filename in db['documents']:
        del db['documents'][filename]
        save_db(db)
        return jsonify({"message": f"'{filename}' removido com sucesso!"})
    
    return jsonify({"error": "Arquivo não encontrado"}), 404

@app.route('/api/dashboard-metrics', methods=['GET'])
def get_dashboard_metrics():
    db = get_db()
    docs = db.get('documents', {})
    total_docs = len(docs)
    status_counts = {}
    for doc in docs.values():
        status = doc.get('status', 'Sem Status')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return jsonify({
        "total_documents": total_docs,
        "status_distribution": status_counts
    })

@app.route('/api/report/csv')
def export_report_csv():
    db = get_db()
    docs = db.get('documents', {})
    
    def generate():
        
        yield 'Nome do Arquivo,Status,Responsavel,Tags,Assinado,Prazo\n'
        
        for filename, meta in docs.items():
            tags = "|".join(meta.get('tags', []))
            line = f"\"{filename}\",\"{meta.get('status')}\",\"{meta.get('owner')}\",\"{tags}\",\"{meta.get('is_signed')}\",\"{meta.get('due_date', '')}\"\n"
            yield line
    
    headers = {
        "Content-Disposition": "attachment; filename=relatorio_documentos.csv",
        "Content-Type": "text/csv"
    }
    return Response(generate(), headers=headers)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/logs')
def system_logs():
    return render_template('log.html')

if __name__ == '__main__':
    app.run(debug=True)