FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm ci
COPY . ./
ARG REACT_APP_API_URL=/api
ARG REACT_APP_DEVELOPER_NAME="Moshe Dahan"
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_DEVELOPER_NAME=${REACT_APP_DEVELOPER_NAME}
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
