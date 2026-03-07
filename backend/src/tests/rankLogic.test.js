const { calculateWorkerRank } = require('../utils/rankLogic');

describe('calculateWorkerRank', () => {
    test('should return BRONZE if photo or main ID is missing', () => {
        expect(calculateWorkerRank({ profilePhoto: null, idDocument: 'id.jpg' })).toBe('BRONZE');
        expect(calculateWorkerRank({ profilePhoto: 'photo.jpg', idDocument: null })).toBe('BRONZE');
        expect(calculateWorkerRank({})).toBe('BRONZE');
    });

    test('should return BRONZE if only mandatory docs are present', () => {
        const worker = {
            profilePhoto: 'photo.jpg',
            idDocument: 'id.jpg'
        };
        expect(calculateWorkerRank(worker)).toBe('BRONZE');
    });

    test('should return SILVER if Fayda ID is present', () => {
        const worker = {
            profilePhoto: 'photo.jpg',
            idDocument: 'id.jpg',
            nationalIdUrl: 'fayda.jpg'
        };
        expect(calculateWorkerRank(worker)).toBe('SILVER');
    });

    test('should return GOLD if Fayda and Guarantor info are present', () => {
        const worker = {
            profilePhoto: 'photo.jpg',
            idDocument: 'id.jpg',
            nationalIdUrl: 'fayda.jpg',
            guarantorIdUrl: 'guar_id.jpg',
            guarantorPhone: '+251911223344'
        };
        expect(calculateWorkerRank(worker)).toBe('GOLD');
    });

    test('should NOT return GOLD if guarantor phone is missing', () => {
        const worker = {
            profilePhoto: 'photo.jpg',
            idDocument: 'id.jpg',
            nationalIdUrl: 'fayda.jpg',
            guarantorIdUrl: 'guar_id.jpg',
            guarantorPhone: ''
        };
        expect(calculateWorkerRank(worker)).toBe('SILVER');
    });

    test('should return PLATINUM if all documents are present', () => {
        const worker = {
            profilePhoto: 'photo.jpg',
            idDocument: 'id.jpg',
            nationalIdUrl: 'fayda.jpg',
            guarantorIdUrl: 'guar_id.jpg',
            guarantorPhone: '+251911223344',
            healthCertificateUrl: 'health.jpg',
            policeClearanceUrl: 'police.jpg'
        };
        expect(calculateWorkerRank(worker)).toBe('PLATINUM');
    });

    test('should stay GOLD if health cert is missing but police clearance is present', () => {
        const worker = {
            profilePhoto: 'photo.jpg',
            idDocument: 'id.jpg',
            nationalIdUrl: 'fayda.jpg',
            guarantorIdUrl: 'guar_id.jpg',
            guarantorPhone: '+251911223344',
            policeClearanceUrl: 'police.jpg'
        };
        expect(calculateWorkerRank(worker)).toBe('GOLD');
    });
});
