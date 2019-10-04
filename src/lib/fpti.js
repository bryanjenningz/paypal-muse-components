/* @flow */
import { getClientID, getMerchantID, getPartnerAttributionID } from '@paypal/sdk-client/src';

import { getDeviceInfo } from './get-device-info';

const sendBeacon = (src, data) => {
    if (!src || !data) {
        return;
    }

    let query = Object.keys(data).map(key => {
        return `${ encodeURIComponent(key) }=${ encodeURIComponent(data[key]) }`;
    });

    query = query.join('&');

    const beaconImage = new window.Image();
    beaconImage.src = `${ src }?${ query }`;
};

// removes empty strings, `undefined`, `null`, and `NaN` from fpti event
const filterFalsyValues = source => {
    Object.keys(source).forEach(key => {
        const val = source[key];

        if (val === '' || val === undefined || val === null || Number.isNaN(val)) {
            delete source[key];
        }
    });

    return source;
};

const resolveTrackingData = (config, data) => {
    const deviceInfo = getDeviceInfo();

    return {
        e: 'im',
        comp: 'ppshoppingsdk',
        page: `ppshopping:${ data.eventName }`,
        t: new Date().getTime(),
        g: new Date().getTimezoneOffset(),
        ...deviceInfo,
        ...config,
        ...data
    };
};

const resolveTrackingVariables = (data) => ({
    // Device height
    dh: data.screenHeight,

    // Device width
    dw: data.screenWidth,

    // Browser height
    bh: data.browserHeight,

    // Browser width
    bw: data.browserWidth,

    // Color depth
    cd: data.colorDepth,

    // Screen height
    sh: data.screenHeight,

    // Screen width
    sw: data.screenWidth,

    // Device type
    dvis: data.deviceType,

    // Browser type
    btyp: data.browserType,

    // Rosetta language
    rosetta_language: data.rosettaLanguage,

    // Page domain & path
    ru: data.location,

    // Identification confidence score
    confidence_score: data.confidenceScore,

    // Identification type returned by VPNS
    identifier_used: data.identifierUsed,

    // Unverified encrypted customer account number
    unverified_cust_id: data.userEAN,

    // Analytics identifier associated with the merchant site. XO container id.
    item: data.propertyId,

    // Merchant encrypted account number
    mrid: getMerchantID(),

    // ClientID
    client_id: getClientID(),
    
    // Partner AttributionId
    bn_code: getPartnerAttributionID(),

    // Event Name
    event_name: data.eventName,

    // Event Type
    event_type: data.eventType,

    // Event Data
    sinfo: JSON.stringify(data.eventData),

    // Legacy value for filtering events in Herald
    page: data.page,

    // Legacy value for filtering events in Herald
    pgrp: data.page,

    // Legacy impression event
    // TODO: currently hard-coded to 'im'. When additional events (add-to-cart, purchase, etc)
    // are moved to fpti this value will need to be updated.
    e: data.e,

    // Timestamp
    t: data.t,

    // Timestamp relative to user
    g: data.g
});

export default (config, data = {}) => {
    const fptiServer = 'https://t.paypal.com/ts';
    const trackingVariables = resolveTrackingVariables(resolveTrackingData(config, data));

    sendBeacon(fptiServer, filterFalsyValues(trackingVariables));
};