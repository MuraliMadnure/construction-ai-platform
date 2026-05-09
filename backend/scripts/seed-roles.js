const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRoles() {
  try {
    console.log('Seeding roles...');

    // Create roles
    const roles = [
      { name: 'admin', displayName: 'Administrator', description: 'Full system access' },
      { name: 'project_manager', displayName: 'Project Manager', description: 'Manage projects and teams' },
      { name: 'site_engineer', displayName: 'Site Engineer', description: 'Site execution and reporting' },
      { name: 'contractor', displayName: 'Contractor', description: 'Contractor access' },
      { name: 'supervisor', displayName: 'Supervisor', description: 'Team supervision' },
      { name: 'viewer', displayName: 'Viewer', description: 'Read-only access' }
    ];

    for (const roleData of roles) {
      await prisma.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: roleData
      });
      console.log(`✓ Created role: ${roleData.name}`);
    }

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@construction.com' }
    });

    if (adminUser) {
      // Get admin role
      const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' }
      });

      if (adminRole) {
        // Assign admin role to user
        await prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId: adminUser.id,
              roleId: adminRole.id
            }
          },
          update: {},
          create: {
            userId: adminUser.id,
            roleId: adminRole.id
          }
        });
        console.log(`✓ Assigned admin role to ${adminUser.email}`);
      }
    }

    console.log('✅ Roles seeded successfully!');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
