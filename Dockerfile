FROM nginx
COPY medunited /usr/share/nginx/html/medunited
COPY template /usr/share/nginx/html/template
COPY index.html /usr/share/nginx/html
