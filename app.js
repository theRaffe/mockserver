const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');

const loginok = require('./src/mocks/login-defaul.json');
const cloudType = require('./src/mocks/get-cloud-type.json');
const allCloudObjects = require('./src/mocks/get-cloud-objects.json');
const cloudSubtype = require('./src/mocks/get-cloud-subtype.json');
const validateUser = require('./src/mocks/validate-user-mail.json');
const catInsurer = require('./src/mocks/get-cat-insurer.json');
const cloudObject = require('./src/mocks/post-cloud-object.json');
const downloadObject = require('./src/mocks/download-cloud-object.json');
const makeSubmakes = require('./src/mocks/get-makes-submakes.json');
const businessLine = require('./src/mocks/get-linebusiness.json');
const acuraTypeVehicle = require('./src/mocks/get-type-vehicle-acura.json');
const alfaTypeVehicle = require('./src/mocks/get-type-vehicle-alfa.json');
const bmwTypeVehicle = require('./src/mocks/get-type-vehicle-bmw.json');
const acuraVersion1 = require('./src/mocks/get-version-acura.json');
const acuraVersion2 = require('./src/mocks/get-version-acura2.json');
const acuraVersion3 = require('./src/mocks/get-version-acura3.json');
const alfaVersion1 = require('./src/mocks/get-version-alfa1.json');
const alfaVersion2 = require('./src/mocks/get-version-alfa2.json');
const userNetwork = require('./src/mocks/get-user-network.json');
const postUserSocial = require('./src/mocks/post-user-social.json');
const searchAcura = require('./src/mocks/get-alfred-search.json');
const qAcuraMonthChubb = require('./src/mocks/post-quotation-acura-month-chubb.json');
const qAcuraYearChubb = require('./src/mocks/post-quotation-acura-year-chubb.json');
const qAcuraMonthZurich = require('./src/mocks/post-quotation-acura-month-zurich.json');
const qAcuraYearZurich = require('./src/mocks/post-quotation-acura-year-zurich.json');
const repuveResponse = require('./src/mocks/get-repuve.json');
const thumbnailResponse = require('./src/mocks/get-vehicle-thumbnail.json');
const insurerChubb = require('./src/mocks/get-insurer-chubb.json');
const insurerHdi = require('./src/mocks/get-insurer-hdi.json');
const chubbDetail = require('./src/mocks/get-chubb-detail.json');
const zipSettlement = require('./src/mocks/get-zip-settlement.json');
const getCustomerPCI = require('./src/mocks/get-customer-pci.json');
const createCustomerPCI = require('./src/mocks/create-customer-pci.json');
const getPublicKey = require('./src/mocks/get-public-key.json');
const addCardPCI = require('./src/mocks/add-card-customer.json');
const emmitPolicy = require('./src/mocks/emmit-policy.json');
const transactionPCI = require('./src/mocks/create-transaction-pci.json');
const opportunitiesWeb = require('./src/mocks/get-opportunities.json');
const apiConfig = require('./src/mocks/get-api-config.json');
const getUserAddress = require('./src/mocks/get-user-address.json');
const postHouseQuoteYearly = require('./src/mocks/post-house-quote-yearly.json');
const postHouseQuoteMonthly = require('./src/mocks/post-house-quote-monthly.json');

const quotationDict = {
    "acura-1-5": qAcuraMonthChubb,
    "acura-2-5": qAcuraYearChubb,
    "acura-1-34": qAcuraMonthZurich,
    "acura-2-34": qAcuraYearZurich
}

const insurerDict = {
    5: insurerChubb,
    34: insurerHdi
}

const packageDict = {
    1: "AMPLIA",
    2: "LIMITADA",
    3: "RC"
}

function getQuotationResponse(brand = '', wayPay, insuranceCompanyId) {
    const key = `${brand.toLowerCase()}-${wayPay}-${insuranceCompanyId}`;
    console.log('search key:', key);
    const found = quotationDict[key];
    return found || null;
}

function getHouseQuotationResponse(wayPay, insuranceCompanyId) {
    return wayPay === 1 ? postHouseQuoteMonthly : postHouseQuoteYearly;
}

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

var key = fs.readFileSync(__dirname + '/certs/server.key');
var cert = fs.readFileSync(__dirname + '/certs/server.crt');
var options = {
    key: key,
    cert: cert
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, timeout');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

app.post('/api/security/login', function (req, res) {

    const result = { ...loginok };
    const token = generateToken({
        userId: loginok.userId,
        email: loginok.email,
        initials: loginok.initials,
        primaryLastName: loginok.primaryLastName,
        secondaryLastName: loginok.secondaryLastName
    });

    console.log('new token:', token);
    result.token = token;

    res.send(result);
});

app.get(new RegExp(`(/api/cloud/objects)`), function (req, res) {
    res.send(allCloudObjects);
});

app.get('/api/cat/cloudtype', function (req, res) {
    res.send(cloudType);
});

app.get('/api/cat/cloudsubtype', function (req, res) {
    res.send(cloudSubtype);
});

app.get('/api/users/validate', function (req, res) {
    res.send(validateUser);
});

app.get('/api/insurers/catalog', function (req, res) {
    res.send(catInsurer);
});

app.put(new RegExp('/api/cloud/[\\w]+'), function (req, res) {
    res.status(200).send('');
});

app.post(new RegExp('/api/cloud'), function (req, res) {
    res.send(cloudObject);
});

app.post('/api/security/logout', function (req, res) {
    res.status(200).send('');
});

app.get(new RegExp('/api/cloud/[\\w]+/download'), function (req, res) {
    res.send(downloadObject);
});

app.delete(new RegExp(`(/api/cloud/[\\w]+)`), function (req, res) {
    res.status(200).send('');
});

app.get(new RegExp('/alfred/chubb/makes_submakes'), function (req, res) {
    res.send(makeSubmakes);
});

app.get(new RegExp('/api/linebusiness'), function (req, res) {
    res.send(businessLine);
});

app.get(new RegExp(`/alfred/chubb/makes/1/submakes/1/vehicle_types\?`), function (req, res) {
    console.log('print url alfred:', req.url);
    res.send(acuraTypeVehicle);
});

app.get(new RegExp(`/alfred/chubb/makes/2/submakes/2/vehicle_types`), function (req, res) {
    res.send(alfaTypeVehicle);
});

app.get(new RegExp(`/alfred/chubb/makes/7/submakes/7/vehicle_types`), function (req, res) {
    res.send(bmwTypeVehicle);
});

app.get(new RegExp(`alfred/chubb/makes/submakes/vehicle_types/368390888/vehicle_descriptions`), function (req, res) {
    res.send(acuraVersion1);
});

app.get(new RegExp(`alfred/chubb/makes/submakes/vehicle_types/368391081/vehicle_descriptions`), function (req, res) {
    res.send(acuraVersion2);
});

app.get(new RegExp(`alfred/chubb/makes/submakes/vehicle_types/368391304/vehicle_descriptions`), function (req, res) {
    res.send(acuraVersion3);
});

app.get(new RegExp(`alfred/chubb/makes/submakes/vehicle_types/368391467/vehicle_descriptions`), function (req, res) {
    res.send(alfaVersion1);
});

app.get(new RegExp(`alfred/chubb/makes/submakes/vehicle_types/372107930/vehicle_descriptions`), function (req, res) {
    res.send(alfaVersion2);
});

app.get(new RegExp(`api/users/social`), function (req, res) {
    res.send(userNetwork);
});

app.post(new RegExp(`api/users/social`), function (req, res) {
    res.send(postUserSocial);
});

app.put(new RegExp(`api/users/social/[\\w]+`), function (req, res) {
    res.send(postUserSocial);
});

app.post(new RegExp(`api/alfred/search`), function (req, res) {
    res.send(searchAcura);
});

app.post(new RegExp(`api/alfred/quote`), function (req, res) {
    const brand = req.body.makeString;
    const insuranceCompanyId = req.body.insuranceCompanyId;
    const wayPay = req.body.wayToPay
    console.log('print req.body:', req.body);
    const quotationResponse = getQuotationResponse(brand, wayPay, insuranceCompanyId);
    if (quotationResponse) {
        const response = JSON.parse(JSON.stringify(quotationResponse))
        response.packageId = req.body.packageId;
        response.package_ = packageDict[req.body.packageId];
        response.wayToPayId = req.body.wayToPay;
        res.send(response);
        return
    }

    res.status(500).send({
        "type": "error",
        "title": "Error al cotizar",
        "message": "Quotation not found!!"

    });

});


app.get(new RegExp(`api/toolkit/repuve/info`), function (req, res) {
    res.send(repuveResponse);
});

app.get(new RegExp(`api/toolkit/vehicle-thumbnail`), function (req, res) {
    res.send(thumbnailResponse);
});

app.get(new RegExp(`api/insurers/[\\w]+`), function (req, res) {
    ///console.log('insurer req:', req);
    const urlreq = req.url;
    const urlarr = urlreq.split('/');
    const id = urlarr[urlarr.length - 1];
    const response = insurerDict[+id];
    res.send(response);
});

app.get(new RegExp(`api/sublinebusiness/coverages`), function (req, res) {
    res.send(chubbDetail);
});

app.get(new RegExp(`api/settlements/zipcode/[\\w]+`), function (req, res) {
    res.send(zipSettlement);
});

app.get(new RegExp(`api/bruno/payments/customers/30`), function (req, res) {
    res.send(getCustomerPCI);
});

app.post(new RegExp(`api/bruno/payments/customers`), function (req, res) {
    res.send(createCustomerPCI);
});

app.post(new RegExp(`api/bruno/payments/token`), function (req, res) {
    res.send(getPublicKey);
});

app.post(new RegExp(`vault/v1/customers/[\\w]+/cards`), function (req, res) {
    res.send(addCardPCI);
});

app.post(new RegExp(`api/alfred/sign`), function (req, res) {
    res.send(emmitPolicy);
});

app.post(new RegExp(`api/bruno/payments/transactions`), function (req, res) {
    res.send(transactionPCI);
});

app.get(new RegExp('api/notifications/opportunities'), function (req, res) {
    res.send(opportunitiesWeb);
});

app.get(new RegExp('api/users/address'), function (req, res) {
    res.send(getUserAddress);
});

app.get(new RegExp(`(api/config)`), function (req, res) {
    res.send(apiConfig);
});

app.post(new RegExp(`api/home/asserts/quote`), function (req, res) {
    const wayPay = req.body.wayToPay
    const insuranceCompanyId = req.body.insuranceCompanyId;
    console.log('print house req.body:', req.body);
    const quotationResponse = getHouseQuotationResponse(wayPay, insuranceCompanyId);
    if (quotationResponse) {
        // const response = JSON.parse(JSON.stringify(quotationResponse))
        // response.packageId = req.body.packageId;
        // response.package_ = packageDict[req.body.packageId];
        // response.wayToPayId = req.body.wayToPay;
        res.send(quotationResponse);
        return
    }

    res.status(500).send({
        "type": "error",
        "title": "Error al cotizar",
        "message": "Quotation not found!!"

    });
});

var server = app.listen(process.env.PORT || 1080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


//var server = https.createServer(options, app);

/*server.listen(process.env.PORT || 1080, () => {
    const port = server.address().port;
    console.log("server starting on port : " + port)
});*/


/**
 * 
 *  
 */

/*
const appws = express();

//initialize a simple http server
const serverWs = https.createServer({ cert: cert, key: key });
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ noServer: true });
wss.on('connection', (ws) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});

//start our server
serverWs.listen(8999, () => {
    console.log(`websocket Server started on port ${serverWs.address().port} :)`);
});
*/

function generateToken(dataSession = {
    userId,
    email,
    primaryLastName,
    secondaryLastName,
    initials

}) {
    const token = jwt.sign({
        ...dataSession,
        avatar: dataSession.initials
    }, 'supersecretpassword', {
        expiresIn: '1d'
    });

    return token;
}

function generateTokenExpiration() {
    const aDate = new Date();
    aDate.setMinutes(aDate.getMinutes() + 10);
    const tokenExpiration = Cypress.moment(aDate).format('YYYY-MM-dd H:mm:ss');
    return tokenExpiration;
}
