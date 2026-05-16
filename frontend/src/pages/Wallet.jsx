import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Wallet as WalletIcon, TrendingUp, Lock, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, HelpCircle, Landmark, CreditCard } from 'lucide-react';
import BackButton from '../components/BackButton';

const Wallet = () => {
    const { t } = useTranslation();
    const [balance, setBalance] = useState(1250.50);
    const [escrow, setEscrow] = useState(4500.00);
    const [transactions, setTransactions] = useState([
        { id: 1, type: 'INCOME', amount: 3000, title: 'Salary Release (Job #204)', date: '2026-05-10', status: 'COMPLETED' },
        { id: 2, type: 'EXPENSE', amount: 250, title: 'Subscription - Gold', date: '2026-05-08', status: 'COMPLETED' },
        { id: 3, type: 'ESCROW', amount: 4500, title: 'Locked for Active Contract', date: '2026-05-01', status: 'PENDING' },
    ]);

    return (
        <div style={{ background: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
            <Helmet>
                <title>EDWL Wallet | Fintech Hub</title>
            </Helmet>

            <style>{`
                .glass-panel {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 32px;
                }
                .balance-card {
                    background: linear-gradient(135deg, #38bdf8 0%, #1e40af 100%);
                    border-radius: 24px;
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                }
                .balance-card::after {
                    content: '';
                    position: absolute;
                    top: -20%;
                    right: -10%;
                    width: 200px;
                    height: 200px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                }
                .tx-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    transition: background 0.2s;
                }
                .tx-item:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
            `}</style>

            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <BackButton style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }} />
                </div>

                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' }}>Fintech Hub</h1>
                    <p style={{ color: '#94a3b8' }}>Secure payments, escrow protection, and micro-loans.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                    {/* MAIN BALANCE */}
                    <div className="balance-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</div>
                                <div style={{ fontSize: '3rem', fontWeight: '900' }}>{balance.toLocaleString()} <small style={{ fontSize: '1rem', opacity: 0.8 }}>ETB</small></div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px' }}>
                                <WalletIcon size={24} color="white" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{ flex: 1, background: 'white', color: '#1e40af', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Withdraw</button>
                            <button style={{ flex: 1, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Deposit</button>
                        </div>
                    </div>

                    {/* ESCROW STATUS */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '16px' }}>
                                <Lock size={24} color="#f59e0b" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Locked in Escrow</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b' }}>{escrow.toLocaleString()} ETB</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                            These funds are secured by EDWL and will be released upon job completion.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* TRANSACTION HISTORY */}
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Recent Transactions</h2>
                            <button style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>See All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {transactions.map(tx => (
                                <div key={tx.id} className="tx-item">
                                    <div style={{ 
                                        width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : tx.type === 'ESCROW' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                                    }}>
                                        {tx.type === 'INCOME' ? <ArrowDownLeft size={20} color="#10b981" /> : tx.type === 'ESCROW' ? <Lock size={20} color="#f59e0b" /> : <ArrowUpRight size={20} color="#94a3b8" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{tx.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tx.date} • {tx.status}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: '800', color: tx.type === 'INCOME' ? '#10b981' : tx.type === 'ESCROW' ? '#f59e0b' : 'white' }}>
                                        {tx.type === 'INCOME' ? '+' : tx.type === 'ESCROW' ? '' : '-'}{tx.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MICRO-LOAN ELIGIBILITY */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(30, 41, 59, 0.7))' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CreditCard size={18} color="#8b5cf6" /> Micro-Loan
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
                                Based on your platform reliability score, you are eligible for up to:
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#8b5cf6', marginBottom: '20px' }}>2,500 ETB</div>
                            <button style={{ width: '100%', background: '#8b5cf6', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Apply Now</button>
                        </div>

                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#10b981' }}>
                                <ShieldCheck size={18} />
                                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>EDWL Protected</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                                Your transactions are encrypted and monitored by our AI Trust Engine.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
