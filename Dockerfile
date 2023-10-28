# Use uma imagem base adequada para o aplicativo Node.js
FROM node:latest

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie os arquivos de código-fonte do aplicativo para o contêiner
COPY . .

RUN npm install

RUN npx prisma generate

# Execute o script para verificar o banco de dados e, se for bem-sucedido, inicie o aplicativo
CMD ["npm", "run", "dev"]