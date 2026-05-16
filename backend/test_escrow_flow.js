const prisma = require('./src/utils/prisma');
const escrowController = require('./src/controllers/escrowController');
const chapaService = require('./src/services/chapaService');

// Mock ChapaService to avoid real API calls
const originalInitialize = chapaService.initialize;
const originalVerify = chapaService.verify;

async function testEscrowFlow() {
    console.log('--- Starting Escrow Flow Test ---');
    
    // 1. Setup Data
    let employer = await prisma.employer.findFirst();
    let jobSeeker = await prisma.jobSeeker.findFirst();

    if (!employer || !jobSeeker) {
        console.error('No employer or jobSeeker found in DB. Run seeds first.');
        process.exit(1);
    }

    let contract = await prisma.contract.findFirst({
        where: { employerId: employer.id, jobSeekerId: jobSeeker.id }
    });

    if (!contract) {
        contract = await prisma.contract.create({
            data: {
                employerId: employer.id,
                jobSeekerId: jobSeeker.id,
                status: 'DRAFT',
                startDate: new Date(),
                salary: 6000
            }
        });
        console.log('Created test contract:', contract.id);
    }

    // 2. Mock Chapa API Responses
    chapaService.initialize = async (data) => {
        console.log('MOCKED: chapaService.initialize called with', data.tx_ref);
        return { status: 'success', data: { checkout_url: 'https://mock.chapa.co/checkout/' + data.tx_ref } };
    };

    chapaService.verify = async (txRef) => {
        console.log('MOCKED: chapaService.verify called for', txRef);
        return { status: 'success', data: { status: 'success', amount: 6000 } };
    };

    try {
        console.log('\nStep 1: Initiating Escrow (ETB - Chapa)...');
        
        let escrowRecord;
        let providerRef;
        const mockReqInit = {
            user: { userId: employer.id },
            body: { contractId: contract.id, amount: 6000, currency: 'ETB' }
        };
        const mockResInit = {
            status: (code) => ({
                json: (data) => {
                    console.log('Initiate Response:', code, data.message);
                    escrowRecord = data.escrow;
                }
            })
        };

        await escrowController.initiateEscrow(mockReqInit, mockResInit);

        if (!escrowRecord || !escrowRecord.providerRef) {
            throw new Error('Escrow initialization failed or missing providerRef');
        }
        providerRef = escrowRecord.providerRef;
        console.log('Created Escrow:', escrowRecord.id, 'Ref:', providerRef);

        console.log('\nStep 2: Verifying Escrow Payment...');
        let verifiedEscrow;
        const mockReqVerify = {
            body: { providerRef }
        };
        const mockResVerify = {
            status: (code) => ({
                json: (data) => {
                    console.log('Verify Response (Error):', code, data);
                }
            }),
            json: (data) => {
                console.log('Verify Response (Success):', data.message);
                verifiedEscrow = data.escrow;
            }
        };

        await escrowController.verifyEscrow(mockReqVerify, mockResVerify);

        if (!verifiedEscrow || verifiedEscrow.status !== 'FUNDED') {
            throw new Error('Escrow verification failed or status is not FUNDED');
        }

        console.log('\nStep 3: Checking Contract Status...');
        const updatedContract = await prisma.contract.findUnique({ where: { id: contract.id } });
        console.log('Contract Status:', updatedContract.status);

        if (updatedContract.status !== 'ACTIVE') {
            throw new Error('Contract status did not update to ACTIVE');
        }

        console.log('\nStep 4: Releasing Escrow to Worker...');
        let releasedEscrow;
        const mockReqRelease = {
            user: { userId: employer.id },
            params: { escrowId: verifiedEscrow.id }
        };
        const mockResRelease = {
            status: (code) => ({
                json: (data) => {
                    console.log('Release Response (Error):', code, data);
                }
            }),
            json: (data) => {
                console.log('Release Response (Success):', data.message);
                releasedEscrow = data.escrow;
            }
        };

        await escrowController.releaseEscrow(mockReqRelease, mockResRelease);

        if (!releasedEscrow || releasedEscrow.status !== 'RELEASED') {
            throw new Error('Escrow release failed or status is not RELEASED');
        }

        const finalContract = await prisma.contract.findUnique({ where: { id: contract.id } });
        console.log('Final Contract Status:', finalContract.status);

        console.log('\n✅ End-to-End Local Escrow Flow Success!');
    } catch (err) {
        console.error('\n❌ Test Failed:', err.message);
    } finally {
        // Restore mocks
        chapaService.initialize = originalInitialize;
        chapaService.verify = originalVerify;
        process.exit();
    }
}

testEscrowFlow();
