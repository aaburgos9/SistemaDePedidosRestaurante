#!/usr/bin/env node

/**
 * Script de testing de seguridad
 * Prueba las mejoras implementadas
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function testXSSPrevention() {
  console.log('🧪 Testing XSS Prevention...');
  
  const maliciousPayload = {
    customerName: '<script>alert("XSS")</script>',
    table: '<img src=x onerror=alert("XSS")>',
    items: [{
      productName: 'Hamburguesa<script>alert("XSS")</script>',
      quantity: 1,
      unitPrice: 10000,
      note: '<script>document.location="http://evil.com"</script>'
    }]
  };
  
  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousPayload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Verificar que los scripts fueron sanitizados
      const hasScript = JSON.stringify(result).includes('<script>');
      console.log(hasScript ? '❌ XSS not prevented' : '✅ XSS prevented');
    } else {
      console.log('✅ Malicious payload rejected');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function testNoSQLInjection() {
  console.log('🧪 Testing NoSQL Injection Prevention...');
  
  const maliciousPayload = {
    customerName: { $ne: null },
    table: { $where: "this.table == 'Mesa 1'" },
    items: [{ $ne: null }]
  };
  
  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousPayload)
    });
    
    console.log(response.ok ? '❌ NoSQL injection not prevented' : '✅ NoSQL injection prevented');
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function testSecrets() {
  console.log('🧪 Testing Secrets Management...');
  
  // Verificar que no hay fallbacks inseguros
  const hasDevSecret = process.env.JWT_SECRET === 'dev-secret-local';
  const hasChangeMe = process.env.JWT_SECRET === 'change-me-in-prod';
  
  if (hasDevSecret || hasChangeMe) {
    console.log('❌ Insecure secret detected');
  } else {
    console.log('✅ Secrets properly configured');
  }
}

async function runSecurityTests() {
  console.log('🔒 Running Security Tests...\n');
  
  await testXSSPrevention();
  await testNoSQLInjection();
  await testSecrets();
  
  console.log('\n✅ Security tests completed');
}

runSecurityTests().catch(console.error);