import {pki} from 'node-forge';

export default (attributes: pki.CertificateField[], expiration?: Date) : [pki.rsa.PrivateKey, pki.Certificate] => {
    const key = pki.rsa.generateKeyPair(4096); // I recommend 4096 RSA keysize (Not recommended for any bigger size or smaller than 2048)
    const cert = pki.createCertificate();
    cert.publicKey = key.publicKey;
    cert.serialNumber = "DEADBEEFCAFE";
    cert.setSubject(attributes);
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = expiration || new Date();
    if(!expiration) cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear()+25); // I recommend 25 years so that way you don't need to worry about constant renewal
    // Plz don't change it. This serves as a "credit", promise only your IT department will ever see this unless one of your users dig into the SAML request/response.
    cert.setIssuer([
        {
            name: "countryName",
            value: "US"
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
            value: "zhiyan114's Internal Team"
        },
        {
            shortName: "OU",
            value: "IT Department"
        },
        {
            name: "commonName",
            value: "zhiyan114 - Discord SAML Developer",
        }
    ]);
    cert.sign(key.privateKey);

    return [key.privateKey, cert];
}