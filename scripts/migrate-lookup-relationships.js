/**
 * Safe, Idempotent Lookup-to-Document Relationship Migration Script
 * Accero PrintPortal - Production MongoDB Database Migration
 * 
 * Usage:
 *   Dry-run (default / inspection only):
 *     node scripts/migrate-lookup-relationships.js --dry-run
 * 
 *   Execute live migration:
 *     node scripts/migrate-lookup-relationships.js --execute
 * 
 *   Rollback migration:
 *     node scripts/migrate-lookup-relationships.js --rollback
 */

const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
let mongoUri = '';
let jwtSecret = 'accero_secure_cache_salt_fallback_min_32';
for (const line of envContent.split('\n')) {
  if (line.startsWith('MONGODB_URI=')) {
    mongoUri = line.replace('MONGODB_URI=', '').trim();
  }
  if (line.startsWith('JWT_SECRET=')) {
    jwtSecret = line.replace('JWT_SECRET=', '').trim();
  }
}

if (!mongoUri) {
  console.error('[Migration] ERROR: No MONGODB_URI found in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const isExecute = args.includes('--execute');
const isRollback = args.includes('--rollback');
const isDryRun = !isExecute && !isRollback;

function computeHash(docType, id) {
  const cleanId = (id || '').trim().replace(/\s+/g, '').toUpperCase();
  return crypto.createHmac('sha256', jwtSecret).update(`${docType}:${cleanId}`).digest('hex');
}

async function run() {
  console.log('========================================================================');
  console.log(`Accero PrintPortal - Database Audit & Relationship Migration`);
  console.log(`Mode: ${isRollback ? 'ROLLBACK' : isExecute ? 'EXECUTE (LIVE WRITES)' : 'DRY-RUN (INSPECTION ONLY)'}`);
  console.log('========================================================================\n');

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  const panColl = db.collection('panlookuprecords');
  const docColl = db.collection('documentrecords');
  const verifColl = db.collection('verificationrequests');
  const walletColl = db.collection('wallets');

  if (isRollback) {
    console.log('[Rollback] Reverting foreign key links (unsetting documentRecordId on panlookuprecords)...');
    const result = await panColl.updateMany(
      { documentRecordId: { $ne: null } },
      { $unset: { documentRecordId: '', documentNumberHash: '' } }
    );
    console.log(`[Rollback] Reverted ${result.modifiedCount} records in panlookuprecords.`);
    await mongoose.disconnect();
    return;
  }

  const lookups = await panColl.find({}).toArray();
  console.log(`Found ${lookups.length} records in panlookuprecords to analyze.\n`);

  let linkedCount = 0;
  let alreadyLinkedCount = 0;
  let failedLookupCount = 0;
  let orphanedCount = 0;
  let paymentVerifiedCount = 0;
  let paymentMissingCount = 0;

  const migrationActions = [];

  for (const lookup of lookups) {
    const cleanPan = (lookup.panNumber || '').trim().toUpperCase();
    const hash = computeHash('PAN', cleanPan);

    if (lookup.status === 'FAILED') {
      failedLookupCount++;
      migrationActions.push({
        id: lookup._id,
        pan: cleanPan,
        status: 'FAILED',
        action: lookup.documentRecordId ? 'UNLINK_DOC_ID' : 'SET_HASH_ONLY',
        targetDocId: null,
      });
      continue;
    }

    // Lookup matching DocumentRecord
    const doc = await docColl.findOne({
      userId: lookup.userId,
      docType: 'PAN',
      cardIdentifier: cleanPan,
    });

    if (!doc) {
      orphanedCount++;
      migrationActions.push({
        id: lookup._id,
        pan: cleanPan,
        status: 'SUCCESS',
        action: 'ORPHAN_NO_DOCUMENT_FOUND',
        targetDocId: null,
      });
      continue;
    }

    // Verify wallet payment
    let hasWalletDebit = false;
    const userWallet = await walletColl.findOne({ userId: lookup.userId });
    if (userWallet && Array.isArray(userWallet.transactions)) {
      hasWalletDebit = userWallet.transactions.some(
        (t) =>
          t.type === 'debit' &&
          t.status === 'COMPLETED' &&
          (t.referenceId === lookup.walletTransactionRef ||
            t.referenceId === `PAN_LOOKUP:${lookup.userId}:${cleanPan}`)
      );
    }

    if (hasWalletDebit || lookup.serviceFee === 0) {
      paymentVerifiedCount++;
    } else {
      paymentMissingCount++;
    }

    if (lookup.documentRecordId && lookup.documentRecordId.toString() === doc._id.toString()) {
      alreadyLinkedCount++;
      migrationActions.push({
        id: lookup._id,
        pan: cleanPan,
        status: 'SUCCESS',
        action: 'ALREADY_LINKED',
        targetDocId: doc._id,
      });
    } else {
      linkedCount++;
      migrationActions.push({
        id: lookup._id,
        pan: cleanPan,
        status: 'SUCCESS',
        action: 'LINK_DOCUMENT_RECORD',
        targetDocId: doc._id,
      });
    }
  }

  console.log('Migration Analysis Summary:');
  console.log(` - Total Records:               ${lookups.length}`);
  console.log(` - Successful Lookups to Link:  ${linkedCount}`);
  console.log(` - Already Linked:              ${alreadyLinkedCount}`);
  console.log(` - Failed Lookups (Audited):    ${failedLookupCount}`);
  console.log(` - Orphaned Lookups (No Doc):   ${orphanedCount}`);
  console.log(` - Verified Wallet Debits:      ${paymentVerifiedCount}`);
  console.log(` - Missing Wallet Debits:       ${paymentMissingCount}\n`);

  console.log('Action Plan:');
  for (const act of migrationActions) {
    console.log(` [${act.status}] ${act.pan} (ID: ${act.id}) -> Action: ${act.action} (DocId: ${act.targetDocId || 'N/A'})`);
  }

  if (isExecute) {
    console.log('\n[Execute] Applying updates to MongoDB Atlas...');
    for (const act of migrationActions) {
      if (act.action === 'LINK_DOCUMENT_RECORD') {
        const hash = computeHash('PAN', act.pan);
        await panColl.updateOne(
          { _id: act.id },
          {
            $set: {
              documentRecordId: act.targetDocId,
              docType: 'PAN',
              documentNumberHash: hash,
            },
          }
        );
        // Also update matching VerificationRequest if docId is missing
        await verifColl.updateMany(
          { userId: act.userId, idNumber: act.pan, docType: 'PAN', documentId: { $exists: false } },
          { $set: { documentId: act.targetDocId } }
        );
      } else if (act.action === 'SET_HASH_ONLY') {
        const hash = computeHash('PAN', act.pan);
        await panColl.updateOne(
          { _id: act.id },
          {
            $set: {
              documentRecordId: null,
              docType: 'PAN',
              documentNumberHash: hash,
            },
          }
        );
      }
    }
    console.log('[Execute] Migration successfully committed to database!');
  } else {
    console.log('\n[Dry-Run] No database changes were written. Run with --execute to apply.');
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});
