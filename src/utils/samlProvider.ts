import {saml, branding} from '../../config.json'
import {IdentityProvider, ServiceProvider} from 'samlify';
import { baseURL } from '../express';
import fs from 'fs';
import { pki } from 'node-forge';
import genCert from '../utils/generateCertificate'
import syncreq from 'sync-request';

// Make Service Provider Data Folder if it doesn't exist
const SPFolder = __dirname + '/SPData/'
if(!fs.existsSync(SPFolder)) fs.mkdirSync(SPFolder);
// Check and create a signature certificate if it doesn't exist (Renewal is possible but don't feel like to support it yet)
if(!fs.existsSync(SPFolder+"Signature.pem") || !fs.existsSync(SPFolder+"Signature.key")) {
    const [key,cert] = genCert([
        {
            name: "countryName",
            value: "US",
        },
        {
            shortName: "ST",
            value: "Some State"
        },
        {
            name: "localityName",
            value: "Some City"
        },
        {
            name: "organizationName",
            value: branding.name
        },
        {
            name: "commonName",
            value: `${baseURL} - Signature Certificate`
        }
    ]);
    fs.writeFileSync(SPFolder+"Signature.key",pki.privateKeyToPem(key));
    fs.writeFileSync(SPFolder+"Signature.pem",pki.certificateToPem(cert));
}
// Check and create a encryption certificate if it doesn't exist (Renewal is possible but don't feel like to support it yet)
if(!fs.existsSync(SPFolder+"Encryption.pem") || !fs.existsSync(SPFolder+"Encryption.key")) {
    const [key,cert] = genCert([
        {
            name: "organizationName",
            value: branding.name
        },
        {
            name: "commonName",
            value: `${baseURL} - Encryption Certificate`
        }
    ])
    fs.writeFileSync(SPFolder+"Encryption.key",pki.privateKeyToPem(key));
    fs.writeFileSync(SPFolder+"Encryption.pem",pki.certificateToPem(cert));
}

export const SP = ServiceProvider({
    entityID: `${baseURL}sp`,
    authnRequestsSigned: false,
    wantAssertionsSigned: true,
    wantMessageSigned: true,
    wantLogoutRequestSigned: true,
    wantLogoutResponseSigned: true,
    signingCert: fs.readFileSync(SPFolder + 'Signature.pem', 'utf8'),
    privateKey: fs.readFileSync(SPFolder + 'Signature.key', 'utf8'),
    encryptCert: fs.readFileSync(SPFolder + 'Encryption.pem', 'utf8'),
    encPrivateKey: fs.readFileSync(SPFolder + 'Encryption.key', 'utf8'),
    nameIDFormat: [
        "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
    ],
    assertionConsumerService: [
        {
            isDefault: true,
            Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
            Location: `${baseURL}sp/acs`
        }
    ],
    singleLogoutService: [
        {
            isDefault: true,
            Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
            Location: `${baseURL}sp/slo`
        }
    ]
});

export const IdP = IdentityProvider(saml.idpConfig.metadataURL ? {
    metadata: syncreq('GET',saml.idpConfig.metadataURL).getBody(),
    isAssertionEncrypted: true,
} : saml.idpConfig.samlifyConfig);