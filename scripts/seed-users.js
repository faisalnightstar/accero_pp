/**
 * Accero PrintPortal - Role & User Seeding Script
 *
 * Populates or updates demo/bootstrap accounts for all supported RBAC roles:
 * - super_admin
 * - admin
 * - support_manager
 * - support_agent
 * - operator
 * - user / customer
 *
 * Usage:
 *   node scripts/seed-users.js
 *   npm run seed:users
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables from .env.local or .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const equalsIdx = trimmed.indexOf('=');
        if (equalsIdx !== -1) {
          const key = trimmed.slice(0, equalsIdx).trim();
          let val = trimmed.slice(equalsIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
      break;
    }
  }
}

loadEnv();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/accero_printportal';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'super_admin',
        'admin',
        'support_manager',
        'support_agent',
        'operator',
        'customer',
        'user',
      ],
      default: 'user',
    },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

const WalletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    balance: { type: Number, default: 0 },
    promotionalBalance: { type: Number, default: 0 },
    purchasedBalance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    totalCredited: { type: Number, default: 0 },
    totalDebited: { type: Number, default: 0 },
    transactions: { type: Array, default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);

const SEED_USERS = [
  {
    role: 'super_admin',
    name: 'Platform Super Admin',
    email: 'superadmin@accero.app',
    phone: '9876543201',
    password: 'SuperAdmin@123',
    initialBalance: 5000,
    landingPage: '/admin',
    description: 'Full platform authority, staff & team provisioning, all financial controls',
  },
  {
    role: 'admin',
    name: 'Platform Administrator',
    email: 'admin@accero.app',
    phone: '9876543202',
    password: 'Admin@123',
    initialBalance: 2500,
    landingPage: '/admin',
    description: 'Campaigns, promo codes, service pricing, operator management, payments',
  },
  {
    role: 'support_manager',
    name: 'Support Team Lead',
    email: 'supportmgr@accero.app',
    phone: '9876543203',
    password: 'SupportMgr@123',
    initialBalance: 500,
    landingPage: '/support',
    description: 'Ticket assignment, escalations, support agent oversight, customer profiles',
  },
  {
    role: 'support_agent',
    name: 'Support Operations Specialist',
    email: 'supportagent@accero.app',
    phone: '9876543204',
    password: 'SupportAgent@123',
    initialBalance: 200,
    landingPage: '/support',
    description: 'Ticket replies, troubleshooting, customer queries with masked privacy data',
  },
  {
    role: 'operator',
    name: 'Authorized Print Operator',
    email: 'operator@accero.app',
    phone: '9876543205',
    password: 'Operator@123',
    initialBalance: 1000,
    landingPage: '/dashboard',
    description: 'High-volume card printing, studio verification, CR80 PVC tray downloads',
  },
  {
    role: 'user',
    name: 'Standard Customer User',
    email: 'user@accero.app',
    phone: '9876543206',
    password: 'User@123',
    initialBalance: 250,
    landingPage: '/dashboard',
    description: 'Standard operator account, self-service verification and card printing',
  },
];

async function seed() {
  console.log('----------------------------------------------------');
  console.log('Accero PrintPortal - Role & User Seeding Engine');
  console.log('----------------------------------------------------');
  console.log(`Connecting to MongoDB: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`);

  await mongoose.connect(MONGODB_URI);

  console.log('Database connected successfully.\n');

  for (const account of SEED_USERS) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(account.password, salt);

    // Upsert user
    let user = await User.findOne({ email: account.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: account.name,
        email: account.email.toLowerCase(),
        phone: account.phone,
        passwordHash,
        role: account.role,
        status: 'active',
      });
      console.log(`[CREATED] ${account.role.padEnd(16)} -> ${account.email}`);
    } else {
      user.role = account.role;
      user.name = account.name;
      user.phone = account.phone;
      user.passwordHash = passwordHash;
      user.status = 'active';
      await user.save();
      console.log(`[UPDATED] ${account.role.padEnd(16)} -> ${account.email}`);
    }

    // Ensure wallet exists
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        balance: account.initialBalance,
        purchasedBalance: account.initialBalance,
        promotionalBalance: 0,
        currency: 'INR',
        totalCredited: account.initialBalance,
        totalDebited: 0,
        transactions: [
          {
            amount: account.initialBalance,
            type: 'credit',
            category: 'WALLET_TOPUP',
            docType: 'TOPUP',
            description: 'Initial Seed Balance',
            balanceAfter: account.initialBalance,
            isPromotional: false,
            createdAt: new Date(),
          },
        ],
      });
    }

    if (!user.walletId) {
      user.walletId = wallet._id;
      await user.save();
    }
  }

  console.log('\n----------------------------------------------------');
  console.log('Summary of Seeded Credentials:');
  console.log('----------------------------------------------------');
  console.table(
    SEED_USERS.map((u) => ({
      Role: u.role,
      Email: u.email,
      'Mobile / Identifier': u.phone,
      Password: u.password,
      'Redirect URL': u.landingPage,
    }))
  );

  console.log('All roles seeded successfully. You can now log in at /login\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

