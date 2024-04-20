FROM php:8.3-apache

RUN apt update && apt-get install -y zip libcurl4-openssl-dev pkg-config libssl-dev

RUN pecl install mongodb && \
    docker-php-ext-enable mongodb

# Install Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    HASH="$(curl -sSL https://composer.github.io/installer.sig)" && \
    php -r "if (hash_file('sha384', 'composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" && \
    php composer-setup.php --install-dir="/usr/local/bin" --filename=composer && \
    php -r "unlink('composer-setup.php');"
    
COPY server.conf /etc/apache2/sites-available/000-default.conf
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf && \
    echo "Listen 8080" >> /etc/apache2/ports.conf && \
    service apache2 restart

COPY composer.json composer.lock /var/www/html/
WORKDIR /var/www/html
RUN composer install

COPY src /var/www/html/src
