const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixPassword() {
  try {
    console.log('🔧 Fixing admin password...\n');

    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: 'admin@construction.com' },
      data: { passwordHash: hashedPassword }
    });

    console.log('✅ Admin password updated successfully!');
    console.log('   Email: admin@construction.com');
    console.log('   Password: Admin@123');
    console.log('');

    // Verify it works
    const user = await prisma.user.findUnique({
      where: { email: 'admin@construction.com' }
    });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('✅ Password verification:', isValid ? 'PASSED' : 'FAILED');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

fixPassword();
