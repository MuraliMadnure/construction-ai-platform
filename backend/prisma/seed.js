const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('');

  // 1. Create Roles
  console.log('📋 Creating roles...');
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
    console.log(`  ✓ ${roleData.displayName} role created`);
  }

  console.log('');

  // 2. Create Permissions
  console.log('🔑 Creating permissions...');
  const permissions = [
    // Project permissions
    { name: 'project:read', resource: 'project', action: 'read', description: 'View project details' },
    { name: 'project:write', resource: 'project', action: 'write', description: 'Create and update projects' },
    { name: 'project:delete', resource: 'project', action: 'delete', description: 'Delete projects' },

    // Task permissions
    { name: 'task:read', resource: 'task', action: 'read', description: 'View tasks' },
    { name: 'task:write', resource: 'task', action: 'write', description: 'Create and update tasks' },
    { name: 'task:delete', resource: 'task', action: 'delete', description: 'Delete tasks' },

    // Material permissions
    { name: 'material:read', resource: 'material', action: 'read', description: 'View materials' },
    { name: 'material:write', resource: 'material', action: 'write', description: 'Create and update materials' },
    { name: 'material:delete', resource: 'material', action: 'delete', description: 'Delete materials' },

    // Report permissions
    { name: 'report:read', resource: 'report', action: 'read', description: 'View reports' },
    { name: 'report:write', resource: 'report', action: 'write', description: 'Create and update reports' },
    { name: 'report:delete', resource: 'report', action: 'delete', description: 'Delete reports' },

    // User permissions
    { name: 'user:read', resource: 'user', action: 'read', description: 'View users' },
    { name: 'user:write', resource: 'user', action: 'write', description: 'Create and update users' },
    { name: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' },

    // BOQ permissions
    { name: 'boq:read', resource: 'boq', action: 'read', description: 'View BOQ' },
    { name: 'boq:write', resource: 'boq', action: 'write', description: 'Create and update BOQ' },
    { name: 'boq:delete', resource: 'boq', action: 'delete', description: 'Delete BOQ' },

    // Resource permissions
    { name: 'resource:read', resource: 'resource', action: 'read', description: 'View resources' },
    { name: 'resource:write', resource: 'resource', action: 'write', description: 'Create and update resources' },
    { name: 'resource:delete', resource: 'resource', action: 'delete', description: 'Delete resources' }
  ];

  for (const permData of permissions) {
    await prisma.permission.upsert({
      where: { name: permData.name },
      update: {},
      create: permData
    });
  }
  console.log(`  ✓ ${permissions.length} permissions created`);
  console.log('');

  // 3. Assign Permissions to Admin Role
  console.log('🔗 Assigning permissions to admin role...');
  const adminRoleForPerms = await prisma.role.findUnique({
    where: { name: 'admin' }
  });

  if (adminRoleForPerms) {
    for (const permData of permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permData.name }
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRoleForPerms.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: adminRoleForPerms.id,
            permissionId: permission.id
          }
        });
      }
    }
    console.log(`  ✓ All permissions assigned to admin role`);
  }
  console.log('');

  // 4. Create Admin User
  console.log('👤 Creating admin user...');
  const adminPassword = 'Admin@123'; // Default password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@construction.com' },
    update: {},
    create: {
      email: 'admin@construction.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
      lastLoginAt: new Date()
    }
  });

  console.log(`  ✓ Admin user created: ${adminUser.email}`);
  console.log('');

  // 5. Assign Admin Role
  console.log('🔐 Assigning admin role...');
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' }
  });

  if (adminRole) {
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
    console.log(`  ✓ Admin role assigned to ${adminUser.email}`);
  }

  console.log('');

  // 6. Create Sample Project (Optional)
  console.log('🏗️  Creating sample project...');
  const sampleProject = await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      name: 'Sample Construction Project',
      description: 'This is a sample project for testing and demonstration purposes',
      location: 'Mumbai, Maharashtra',
      projectType: 'RESIDENTIAL',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 50000000,
      spentAmount: 15000000,
      progress: 35.5,
      createdBy: adminUser.id
    }
  });

  console.log(`  ✓ Sample project created: ${sampleProject.name}`);
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Database seeding completed successfully!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('🔐 Default Admin Credentials:');
  console.log('   Email:    admin@construction.com');
  console.log('   Password: Admin@123');
  console.log('');
  console.log('⚠️  IMPORTANT: Change the admin password after first login!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Start backend: cd backend && npm run dev');
  console.log('   2. Start frontend: cd frontend && npm run dev');
  console.log('   3. Login at: http://localhost:3000/login');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
