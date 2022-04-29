FROM nginx
COPY medunited /usr/share/nginx/html/earztbrief
COPY template /usr/share/nginx/html/template
COPY index.html /usr/share/nginx/html
