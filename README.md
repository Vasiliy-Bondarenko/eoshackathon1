## KYC
KYC providers checks the person's id and makes a json similar to this:
```
{
    expiring: "05-05-2019", // some time in the future
    person: {
        first_name: "John",
        second_name: "Malkovich",
        documents_provided: [
            {
                type: "Passport",
                number: "82348736487638",
                issued: "10-10-2017",
                expiring: "10-10-2027"
            },
            ...other docs...
        ],
        ...other data like confirmed address...
    },
    kyc_provider: {
        name: "Provider's name",
        website: "https://provider.com"
        country_of_jurisdiction: "UK",
        registered: "10-10-2019",
        ...other data...
    }
} 
```
Also providers creates a signature of the hash of this document.
(Hash is created for privacy reasons)
Signature and expiry date are stored on chain on the users's profile but the data 
itself is sent to the user through some secure channel and can be retrieved by
the user from the provider's website if it was lost.

When someone requests KYC for this user he/she can just send json 
file in email or any other method.

Receiver can check the data was not altered by recomputing the hash
and checking signature of it from trusted KYC provider.  

Also companies can be checked in the same way by some authorities 
resulting in a document like: 
```
{
    expiring: "05-05-2019", // some time in the future
    person: {
        company_name: "Tralala Ltd. Co.",
        jurisdiction: "UK",
        documents_provided: [
            {
                type: "Certificate of incorporation",
                date: "10-10-2017",
                content: "..." // ???
            },
            ...other docs...
        ],
        ...other data...
    },
    authority_provider: {
        name: "Provider's name",
        website: "https://provider.com"
        country_of_jurisdiction: "UK",
        registered: "10-10-2019",
        ...other data...
    }
} 
```
