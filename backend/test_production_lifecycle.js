const prisma = require('./src/utils/prisma');
const contractController = require('./src/controllers/contractController');
const escrowController = require('./src/controllers/escrowController');
const disputeController = require('./src/controllers/disputeController');
const chapaService = require('./src/services/chapaService');

// Mock Services
chapaService.initialize = async (data) => ({ status: 'success', data: { checkout_url: 'https://mock.chapa.co/' + data.tx_ref } });
chapaService.verify = async (txRef) => ({ status: 'success', data: { status: 'success', amount: 5000 } });

// Helper to create a robust mock response
const mockRes = (callback) => ({
    status: function(code) { 
        this.statusCode = code; 
        return this; 
    },
    json: function(data) { 
        this.data = data;
        if (callback) callback(data);
        return this;
    }
});

async function runProductionSimulation() {
    console.log('🚀 Starting Full Production Lifecycle Simulation...');
    
    try {
        // 1. Setup Identities
        const employer = await prisma.employer.findFirst() || await prisma.employer.create({
            data: { contactName: 'Test Employer', email: `emp_${Date.now()}@edwl.et`, phone: '0911111111', tier: 'SILVER' }
        });
        const seeker = await prisma.jobSeeker.findFirst() || await prisma.jobSeeker.create({
            data: { fullName: 'Test Worker', phone: '0922222222', gender: 'FEMALE', tier: 'SILVER' }
        });

        console.log(`👤 Using Employer: ${employer.id} and Seeker: ${seeker.id}`);

        // 2. Create Contract
        console.log('\n📝 Step 1: Creating Contract...');
        let contract;
        await contractController.createContract({
            user: { userId: employer.id, role: 'employer' },
            body: { 
                jobSeekerId: seeker.id, 
                startDate: new Date(), 
                salaryAmount: 5000, 
                jobType: 'FULL_TIME',
                termsConditions: 'Test terms'
            }
        }, mockRes((d) => { contract = d; }));

        if (!contract?.id) throw new Error('Contract creation failed');
        console.log(`✅ Contract Created: ${contract.id} (Status: ${contract.status})`);

        // 3. Sign Contract
        console.log('\n✍️ Step 2: Seeker Signing Contract...');
        await contractController.signContract({
            user: { userId: seeker.id },
            params: { contractId: contract.id }
        }, mockRes((d) => { contract = d; }));
        console.log(`✅ Contract Signed (Status: ${contract.status})`);

        // 4. Initiate Escrow
        console.log('\n💳 Step 3: Initiating Escrow...');
        let escrow;
        await escrowController.initiateEscrow({
            user: { userId: employer.id },
            body: { contractId: contract.id, amount: 5000, currency: 'ETB' }
        }, mockRes((d) => { escrow = d.escrow; }));
        
        if (!escrow?.providerRef) throw new Error('Escrow initialization failed');
        console.log(`✅ Escrow Initialized: ${escrow.id} (Ref: ${escrow.providerRef})`);

        // 5. Verify Escrow
        console.log('\n🔍 Step 4: Verifying Escrow Payment...');
        await escrowController.verifyEscrow({
            body: { providerRef: escrow.providerRef }
        }, mockRes((d) => { escrow = d.escrow; }));
        console.log(`✅ Escrow Funded (Status: ${escrow.status})`);

        // 6. Check Notifications
        console.log('\n🔔 Step 5: Verifying Real-time Notifications...');
        const notifications = await prisma.notification.findMany({
            where: { userId: { in: [employer.id, seeker.id] } },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        console.log(`✅ Found ${notifications.length} notifications in DB.`);
        notifications.forEach(n => console.log(`   - [${n.userType}] ${n.title}: ${n.message.substring(0, 40)}...`));

        // 7. Open Dispute
        console.log('\n⚖️ Step 6: Opening Dispute...');
        let dispute;
        await disputeController.createDispute({
            user: { userId: seeker.id, role: 'seeker' }, // Worker reports issue
            body: { contractId: contract.id, reason: 'PAYMENT_ISSUE', description: 'Employer is being difficult.' }
        }, mockRes((d) => { dispute = d.dispute; }));
        
        console.log(`✅ Dispute Opened: ${dispute.id} (Status: ${dispute.status})`);

        // 8. Final Status Check
        const finalContract = await prisma.contract.findUnique({ where: { id: contract.id } });
        const finalEscrow = await prisma.escrowContract.findFirst({ where: { contractId: contract.id } });
        console.log(`\n🏁 Final State:`);
        console.log(`   - Contract: ${finalContract.status}`);
        console.log(`   - Escrow: ${finalEscrow.status}`);

        if (finalContract.status === 'DISPUTED' && finalEscrow.status === 'DISPUTED') {
            console.log('\n✨ MISSION SUCCESS: End-to-End Lifecycle Validated!');
        } else {
            console.error('\n❌ Lifecycle verification failed: Status mismatch.');
        }

    } catch (error) {
        console.error('\n❌ Simulation Failed:', error.message);
        if (error.stack) console.error(error.stack);
    } finally {
        process.exit();
    }
}

runProductionSimulation();
