FROM rustlang/rust:nightly AS builder

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    curl \
    libssl-dev \
    pkg-config \
    git \
    clang \
    make \
    libudev-dev \
    ca-certificates \
    build-essential

# Instalar o Solana CLI
RUN curl -sSf https://release.solana.com/v2.2.6/install | sh
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Instalar o Anchor CLI
RUN cargo install --git https://github.com/coral-xyz/anchor avm --force && \
    avm install 0.31.0

# Definir o diretório de trabalho para o projeto
WORKDIR /usr/src/hackatom

# Copiar o Cargo.toml e Cargo.lock primeiro
COPY Cargo.toml Cargo.lock ./

# Copiar o resto do código
COPY . .

# Agora sim, instalar as dependências e compilar
RUN cargo build --release

# Definir o entrypoint para o contêiner
CMD ["/bin/bash"]
