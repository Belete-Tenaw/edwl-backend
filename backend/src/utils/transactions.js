/**
 * ========================================
 * Database Transaction Handler
 * ========================================
 * Ensures data integrity for critical operations
 * (payments, contracts, disputes)
 */

const { PrismaClient } = require('@prisma/client');

/**
 * Execute operation with transaction
 * Automatically rolls back on error
 */
async function executeTransaction(callback, prisma = null) {
  const client = prisma || new PrismaClient();

  try {
    return await client.$transaction(async (tx) => {
      return await callback(tx);
    }, {
      maxWait: 5000,      // Wait 5s to acquire transaction
      timeout: 10000,     // Transaction times out after 10s
    });
  } catch (error) {
    console.error('Transaction failed:', error.message);
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Create payment with transaction
 * Ensures atomic update of:
 * - Payment record
 * - User subscription tier
 * - AuditLog entry
 */
async function createPaymentWithTransaction(prisma, paymentData) {
  return executeTransaction(async (tx) => {
    // 1. Create payment record
    const payment = await tx.payment.create({
      data: {
        userId: paymentData.userId,
        amount: paymentData.amount,
        currency: 'ETB',
        provider: paymentData.provider,
        transactionId: paymentData.transactionId,
        status: 'pending',
        metadata: paymentData.metadata || {},
      },
    });

    // 2. Update subscription tier (if tier upgrade)
    if (paymentData.upgradeTier) {
      await tx.user.update({
        where: { id: paymentData.userId },
        data: { tier: paymentData.upgradeTier },
      });
    }

    // 3. Create audit log
    await tx.auditLog.create({
      data: {
        userId: paymentData.userId,
        action: 'PAYMENT_CREATED',
        resourceType: 'Payment',
        resourceId: payment.id,
        changes: {
          amount: paymentData.amount,
          tier: paymentData.upgradeTier || null,
        },
        ipAddress: paymentData.ipAddress,
      },
    });

    // 4. Create invoice
    const invoice = await tx.invoice.create({
      data: {
        userId: paymentData.userId,
        paymentId: payment.id,
        amount: paymentData.amount,
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return { payment, invoice };
  }, prisma);
}

/**
 * Create contract with transaction
 * Ensures atomic creation of:
 * - Contract record
 * - Initial contract status
 * - AuditLog entries for both parties
 */
async function createContractWithTransaction(prisma, contractData) {
  return executeTransaction(async (tx) => {
    // 1. Create contract
    const contract = await tx.contract.create({
      data: {
        seekerId: contractData.seekerId,
        employerId: contractData.employerId,
        jobPostId: contractData.jobPostId,
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        terms: contractData.terms,
        salary: contractData.salary,
        status: 'pending_seeker_signature',
        seekerSignature: null,
        employerSignature: null,
        createdAt: new Date(),
      },
    });

    // 2. Create audit logs for both parties
    await tx.auditLog.create({
      data: {
        userId: contractData.seekerId,
        action: 'CONTRACT_RECEIVED',
        resourceType: 'Contract',
        resourceId: contract.id,
        changes: { status: 'pending_seeker_signature' },
        ipAddress: contractData.ipAddress,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: contractData.employerId,
        action: 'CONTRACT_CREATED',
        resourceType: 'Contract',
        resourceId: contract.id,
        changes: { status: 'pending_seeker_signature' },
        ipAddress: contractData.ipAddress,
      },
    });

    return contract;
  }, prisma);
}

/**
 * Process contract signature
 * Ensures signatures are recorded atomically
 */
async function processContractSignature(prisma, contractId, userId, signatureUrl, role) {
  return executeTransaction(async (tx) => {
    // Get current contract
    const contract = await tx.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Verify user is party to contract
    if (role === 'seeker' && contract.seekerId !== userId) {
      throw new Error('Not authorized to sign as seeker');
    }
    if (role === 'employer' && contract.employerId !== userId) {
      throw new Error('Not authorized to sign as employer');
    }

    // Update contract
    const updates = {};
    let newStatus = contract.status;

    if (role === 'seeker') {
      updates.seekerSignature = signatureUrl;
      if (contract.employerSignature) {
        newStatus = 'signed_both'; // Both signed
      } else {
        newStatus = 'pending_employer_signature';
      }
    } else {
      updates.employerSignature = signatureUrl;
      if (contract.seekerSignature) {
        newStatus = 'signed_both'; // Both signed
      } else {
        newStatus = 'pending_seeker_signature';
      }
    }

    updates.status = newStatus;
    updates.signedAt = newStatus === 'signed_both' ? new Date() : null;

    const updatedContract = await tx.contract.update({
      where: { id: contractId },
      data: updates,
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: `CONTRACT_SIGNED_${role.toUpperCase()}`,
        resourceType: 'Contract',
        resourceId: contractId,
        changes: { status: newStatus },
      },
    });

    // If both signed, create job active record
    if (newStatus === 'signed_both') {
      await tx.jobActive.create({
        data: {
          contractId,
          seekerId: contract.seekerId,
          employerId: contract.employerId,
          startDate: contract.startDate,
          status: 'active',
        },
      });
    }

    return updatedContract;
  }, prisma);
}

/**
 * File refund with transaction
 * Ensures atomic update of:
 * - Payment status
 * - User tier rollback (if applicable)
 * - AuditLog entry
 */
async function refundPaymentWithTransaction(prisma, paymentId, reason) {
  return executeTransaction(async (tx) => {
    // 1. Get payment
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // 2. Update payment status
    const refundedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'refunded',
        refundReason: reason,
        refundedAt: new Date(),
      },
    });

    // 3. Rollback tier if it was upgraded
    if (payment.user.tier === 'SUBSCRIBER') {
      await tx.user.update({
        where: { id: payment.userId },
        data: { tier: 'FREEMIUM' },
      });
    }

    // 4. Create audit log
    await tx.auditLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_REFUNDED',
        resourceType: 'Payment',
        resourceId: paymentId,
        changes: {
          status: 'refunded',
          reason,
          tiersRolledBack: payment.user.tier === 'SUBSCRIBER',
        },
      },
    });

    return refundedPayment;
  }, prisma);
}

/**
 * Create dispute with transaction
 */
async function createDisputeWithTransaction(prisma, disputeData) {
  return executeTransaction(async (tx) => {
    const dispute = await tx.dispute.create({
      data: {
        contractId: disputeData.contractId,
        raisedBy: disputeData.raisedBy,
        category: disputeData.category,
        description: disputeData.description,
        status: 'open',
        priority: disputeData.priority || 'medium',
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: disputeData.raisedBy,
        action: 'DISPUTE_CREATED',
        resourceType: 'Dispute',
        resourceId: dispute.id,
        changes: { status: 'open', category: disputeData.category },
      },
    });

    return dispute;
  }, prisma);
}

/**
 * Batch update with transaction
 * For bulk operations (admin tools, migrations)
 */
async function batchUpdateWithTransaction(prisma, operations) {
  return executeTransaction(async (tx) => {
    const results = [];

    for (const op of operations) {
      const result = await tx[op.model].update({
        where: op.where,
        data: op.data,
      });
      results.push(result);
    }

    return results;
  }, prisma);
}

module.exports = {
  executeTransaction,
  createPaymentWithTransaction,
  createContractWithTransaction,
  processContractSignature,
  refundPaymentWithTransaction,
  createDisputeWithTransaction,
  batchUpdateWithTransaction,
};
