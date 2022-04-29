FROM nginx
COPY medunited /usr/share/nginx/html
COPY template /usr/share/nginx/html
COPY index.html /usr/share/nginx/html