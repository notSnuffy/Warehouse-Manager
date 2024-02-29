FROM "mcr.microsoft.com/devcontainers/base:jammy"

ENV DEBIAN_FRONTEND=noninteractive

# Installations
RUN apt update && apt install -y \
    php && \
    rm -rf /var/lib/apt/lists/*

# Install Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    HASH="$(curl -sSL https://composer.github.io/installer.sig)" && \
    php -r "if (hash_file('sha384', 'composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" && \
    php composer-setup.php --install-dir="/usr/local/bin" --filename=composer && \
    php -r "unlink('composer-setup.php');"


