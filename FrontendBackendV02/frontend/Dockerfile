# Dockerfile para servir o frontend Fordox
FROM nginx:alpine

# Apaga a página padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos do frontend para dentro do contêiner
COPY . /usr/share/nginx/html

# Expõe a porta padrão do nginx
EXPOSE 80

# Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
