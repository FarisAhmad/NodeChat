# node-chat

## Monte a imagem do MongoDB no diretório `.docker/mongo`

`$ docker build --rm -f ".docker/mongo/Dockerfile" -t node-chat_mongo ".docker/mongo"`

## Inicie o container do MongoDB

`$ docker run --rm -d -p 27017:27017/tcp node-chat_mongo:latest`

## Monte a imagem do Redis no diretório `.docker/redis`

`$ docker build --rm -f ".docker/redis/Dockerfile" -t node-chat_redis ".docker/redis"`

## Inicie o container do Redis

`$ docker run --rm -d -p 6379:6379/tcp node-chat_redis:latest`

## Configuração de ambiente

Crie um arquivo chamado `.env` no diretório raiz do app.
Copie o conteúdo do arquivo `.env.example`. Se tiver preferência, altere algumas variáveis de ambiente.

## Instale as dependências

`$ npm install`

## Inicie o App

`$ npm run start`
