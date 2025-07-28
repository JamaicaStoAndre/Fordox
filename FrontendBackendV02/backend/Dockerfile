FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Copia o requirements.txt da pasta pai (raiz do projeto) para dentro do contêiner
COPY requirements.txt ./requirements.txt

# Copia o restante dos arquivos do backend
COPY . .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Executa a aplicação com reload para desenvolvimento
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
