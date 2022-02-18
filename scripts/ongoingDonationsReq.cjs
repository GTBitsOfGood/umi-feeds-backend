const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const parallel = require('run-parallel');

const updateDonation = async (number) => {
    const t0 = Date.now();
    const DONATION_ID = '61f0b235b6270f1500736789';
    const BASE_PATH = 'http://localhost:3000/';
    const res = await fetch(`${BASE_PATH}api/ongoingdonations/${DONATION_ID}`, {
        method: 'put',
        body: JSON.stringify({ json: JSON.stringify({
            pickupInstructions: number.toString(),
            lockedByVolunteer: false,
        }) }),
        headers: { 'Content-Type': 'application/json' }
    });
    const r = await res.json();
    const t1 = Date.now();
    return {
        status: res.status,
        payload: r,
        t0: t0 % 10000,
        t1: t1 % 10000,
        elapsed: t1 - t0
    };
};

const updateDonationParallel = (number) => async (callback) => {
    const r = await updateDonation(number);
    callback(null, r);
};

parallel([updateDonationParallel(3), updateDonationParallel(2), updateDonationParallel(1)], (e, r) => {
    console.log(r);
});
Promise.all([updateDonation(3), updateDonation(2), updateDonation(1)]).then(r => {
    console.log(r);
});
