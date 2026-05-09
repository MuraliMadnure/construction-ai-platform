const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testing login credentials...\n');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@construction.com' }
    });

    if (!user) {
      console.log('❌ User not found with email: admin@construction.com');
      return;
    }

    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Status:', user.status);
    console.log('   Password hash:', user.passwordHash.substring(0, 20) + '...');
    console.log('');

    // Test password
    const testPassword = 'Admin@123';
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);

    if (isValid) {
      console.log('✅ Password is CORRECT!');
      console.log('   Test password: Admin@123');
    } else {
      console.log('❌ Password is INCORRECT!');
      console.log('   Test password: Admin@123');
      console.log('');
      console.log('🔧 Generating new hash for Admin@123:');
      const newHash = await bcrypt.hash('Admin@123', 10);
      console.log('   New hash:', newHash);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

testLogin();
