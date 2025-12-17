#!/bin/bash

# ===================================
# GENERADOR DE SECRETS SEGUROS
# ===================================

echo "🔐 Generando secrets seguros para producción..."
echo ""

echo "# JWT Secrets (copiar a .env)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)"
echo ""

echo "# Admin Password"
echo "DEFAULT_ADMIN_PASSWORD=$(openssl rand -base64 16)"
echo ""

echo "# Database Password (opcional)"
echo "DB_PASSWORD=$(openssl rand -base64 16)"
echo ""

echo "✅ Secrets generados. Copiar a archivo .env"
echo "⚠️  NUNCA commitear estos secrets al repositorio"