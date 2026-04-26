#!/usr/bin/env node
// EDWL Live Feature Test Script
const http = require('http');

const BASE = 'http://localhost:5000/api';
let TOKEN = '';
let EMPLOYER_ID = '';
let CONTRACT_ID = '';
let ESCROW_ID = '';
let SEEKER_ID = '';

async function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const fullPath = path.startsWith('/..') ? path.replace('/..', '') : `/api${path}`;
        const opts = {
            hostname: 'localhost',
            port: 5000,
            path: fullPath,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        };
        const req = http.request(opts, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, data }); }
            });
        });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

function pass(label) { console.log(`  ✅ ${label}`); }
function fail(label, detail) { console.log(`  ❌ ${label}: ${detail}`); }

async function main() {
    console.log('\n========================================');
    console.log('   EDWL LIVE FEATURE TEST SUITE');
    console.log('========================================\n');

    // --- 1. AUTH ---
    console.log('📋 TEST 1: Employer Login');
    const login = await request('POST', '/auth/employer/login', { identifier: 'edwltest2026@gmail.com', password: 'Test1234!' });
    if (login.status === 200 && login.data.token) {
        TOKEN = login.data.token;
        EMPLOYER_ID = login.data.user?.id;
        pass(`Logged in as: ${login.data.user?.name}, ID: ${EMPLOYER_ID}`);
    } else {
        fail('Login failed', JSON.stringify(login.data));
        return;
    }

    // --- 2. WORKERS LIST ---
    console.log('\n📋 TEST 2: Fetch Workers');
    const workers = await request('GET', '/seekers', null, TOKEN);
    if (workers.status === 200 && Array.isArray(workers.data)) {
        if (workers.data.length > 0) {
            SEEKER_ID = workers.data[0].id;
            pass(`Workers found: ${workers.data.length}. First: ${workers.data[0].fullName || workers.data[0].full_name || 'N/A'}, ID: ${SEEKER_ID}`);
        } else {
            fail('No workers in DB', 'Cannot test contract without a seeker');
        }
    } else {
        fail('Fetch workers failed', `Status ${workers.status}`);
    }

    // --- 3. JOBS LIST ---
    console.log('\n📋 TEST 3: Fetch Jobs');
    const jobs = await request('GET', '/jobs', null, TOKEN);
    if (jobs.status === 200) {
        pass(`Jobs found: ${Array.isArray(jobs.data) ? jobs.data.length : 'unknown'}`);
    } else {
        fail('Fetch jobs failed', `Status ${jobs.status}: ${JSON.stringify(jobs.data)}`);
    }

    // --- 4. CREATE CONTRACT ---
    if (SEEKER_ID) {
        console.log('\n📋 TEST 4: Create Digital Contract');
        const contract = await request('POST', '/contracts', {
            jobSeekerId: SEEKER_ID,
            startDate: new Date().toISOString(),
            salaryAmount: 3000,
            jobType: 'HOUSEHOLD',
            termsConditions: '1. Work hours: 8am - 6pm\n2. Weekly rest: Sunday\n3. Meals provided'
        }, TOKEN);
        if (contract.status === 201 && contract.data.id) {
            CONTRACT_ID = contract.data.id;
            pass(`Contract created! ID: ${CONTRACT_ID}, Status: ${contract.data.status}`);
        } else {
            fail('Create contract failed', JSON.stringify(contract.data));
        }

        // --- 5. GET CONTRACTS ---
        console.log('\n📋 TEST 5: List Employer Contracts');
        const contracts = await request('GET', '/contracts', null, TOKEN);
        if (contracts.status === 200 && Array.isArray(contracts.data)) {
            pass(`Contracts listed: ${contracts.data.length}`);
        } else {
            fail('List contracts failed', JSON.stringify(contracts.data));
        }

        // --- 6. INITIATE ESCROW ---
        if (CONTRACT_ID) {
            console.log('\n📋 TEST 6: Initiate Escrow Payment');
            const escrow = await request('POST', '/escrow/initiate', {
                contractId: CONTRACT_ID,
                amount: 3000
            }, TOKEN);
            if (escrow.status === 201 && escrow.data.escrow?.id) {
                ESCROW_ID = escrow.data.escrow.id;
                pass(`Escrow initiated! ID: ${ESCROW_ID}, Status: ${escrow.data.escrow.status}`);
            } else {
                fail('Initiate escrow failed', JSON.stringify(escrow.data));
            }

            // --- 7. GET ESCROWS ---
            console.log('\n📋 TEST 7: List Escrow Records');
            const escrows = await request('GET', '/escrow', null, TOKEN);
            if (escrows.status === 200 && Array.isArray(escrows.data)) {
                pass(`Escrow records listed: ${escrows.data.length}`);
            } else {
                fail('List escrows failed', JSON.stringify(escrows.data));
            }
        }
    }

    // --- 8. VIDEO BIO UPLOAD ROUTE ---
    console.log('\n📋 TEST 8: Video Bio Upload Route Exists');
    const videoBioCheck = await request('GET', '/upload/video-bio', null, TOKEN);
    if (videoBioCheck.status !== 404) {
        pass(`Video bio route reachable (status: ${videoBioCheck.status})`);
    } else {
        fail('Video bio route returned 404', '');
    }

    // --- 9. REVIEWS ENDPOINT ---
    if (SEEKER_ID) {
        console.log('\n📋 TEST 9: Reviews Endpoint');
        const reviews = await request('GET', `/reviews/seeker/${SEEKER_ID}`, null, TOKEN);
        if (reviews.status === 200 || reviews.status === 404) {
            pass(`Reviews endpoint working (status: ${reviews.status})`);
        } else {
            fail('Reviews endpoint failed', `Status ${reviews.status}`);
        }
    }

    // --- 10. HEALTH CHECK ---
    console.log('\n📋 TEST 10: Health Check');
    const health = await request('GET', '/../health', null, null);
    if (health.status === 200) {
        pass('Server health: OK');
    } else {
        fail('Health check failed', `Status ${health.status}`);
    }

    console.log('\n========================================');
    console.log('   TEST COMPLETE');
    console.log('========================================\n');
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
