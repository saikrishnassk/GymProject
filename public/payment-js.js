
//TODO: paste code from step 2.1.1
let sqaure_application_id='sq0idp-7OxEyTsDKwKFnMcZu_SFzg',square_location_id="EESJP8FE4016M";
    const idempotency_key = uuidv4();
    // Create and initialize a payment form object
    const paymentForm = new SqPaymentForm({
    // Initialize the payment form elements
    
    //TODO: Replace with your sandbox application ID
    applicationId: `${sqaure_application_id}`,
    locationId: `${square_location_id}`,
    inputClass: 'sq-input',
    autoBuild: false,
    applePay: {
        elementId: 'sq-apple-pay'
      },
    // Customize the CSS for SqPaymentForm iframe elements
    inputStyles: [{
        fontSize: '16px',
        lineHeight: '24px',
        padding: '16px',
        placeholderColor: '#a0a0a0',
        backgroundColor: 'transparent',
    }],
    // Initialize the credit card placeholders
    cardNumber: {
        elementId: 'sq-card-number',
        placeholder: 'Card Number'
    },
    cvv: {
        elementId: 'sq-cvv',
        placeholder: 'CVV'
    },
    expirationDate: {
        elementId: 'sq-expiration-date',
        placeholder: 'MM/YY'
    },
    postalCode: {
        elementId: 'sq-postal-code',
        placeholder: 'Postal'
    },
    // SqPaymentForm callback functions
    callbacks: {
        /*
        * callback function: cardNonceResponseReceived
        * Triggered when: SqPaymentForm completes a card nonce request
        */
       methodsSupported: function (methods, unsupportedReason) {
        // console.log(methods);
  
        var applePayBtn = document.getElementById('sq-apple-pay');
  
        // Only show the button if Apple Pay on the Web is enabled
        // Otherwise, display the wallet not enabled message.
        if (methods.applePay === true) {
          applePayBtn.style.display = 'inline-block';
        } else {
          console.log(unsupportedReason);
        }
      }
  ,
  createPaymentRequest: function () {
    console.log("Came to Apple pay");
    var paymentRequestJson = {
      requestShippingAddress: true,
      requestBillingInfo: true,
      shippingContact: {
        familyName: "CUSTOMER LAST NAME",
        givenName: "CUSTOMER FIRST NAME",
        email: "mycustomer@example.com",
        country: "USA",
        region: "CA",
        city: "San Francisco",
        addressLines: [
          "1455 Market St #600"
        ],
        postalCode: "94103",
        phone:"14255551212"
      },
      currencyCode: "USD",
      countryCode: "US",
      total: {
        label: "MERCHANT NAME",
        amount: "85.00",
        pending: false
      },
      lineItems: [
        {
          label: "Subtotal",
          amount: "60.00",
          pending: false
        },
        {
          label: "Shipping",
          amount: "19.50",
          pending: true
        },
        {
          label: "Tax",
          amount: "5.50",
          pending: false
        }
      ],
      shippingOptions: [
        {
          id: "1",
          label: "SHIPPING LABEL",
          amount: "SHIPPING COST"
        }
     ]
    };

    return paymentRequestJson;
},
        cardNonceResponseReceived: function (errors, nonce, cardData) {
        if (errors) {
            // Log errors from nonce generation to the browser developer console.
            console.error('Encountered errors:');
            errors.forEach(function (error) {
                console.error('  ' + error.message);
            });
            alert('Encountered errors, check browser developer console for more details');
                return;
        }
        //TODO: Replace alert with code in step 2.1
        //$('#Amount').val()
        var amount = document.getElementById("payment-amount").value;
        var name = document.getElementById("payment-name").value;
        fetch('process-payment', {
method: 'POST',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json'
},
body: JSON.stringify({
name:name,
amount:amount,
nonce: nonce,
idempotency_key: idempotency_key,
location_id: `${square_location_id}`
})   
})
.catch(err => {
alert('Network error: ' + err);
})
.then(response => {
if (!response.ok) {
return response.json().then(
    errorInfo => Promise.reject(errorInfo));
}
return response.json();
})
.then(data => {
// console.log(data);
alert('Payment complete successfully!');
window.location.replace("https://www.pushthelimitfit.com/");
})
.catch(err => {
console.error(err);
alert('Payment failed to complete!');
window.location.replace("https://www.pushthelimitfit.com/");
});

        // alert(`The generated nonce is:\n${nonce}`);
        }
    }
    });
    //TODO: paste code from step 1.1.4
    //TODO: paste code from step 1.1.5
// onGetCardNonce is triggered when the "Pay $1.00" button is clicked
function onGetCardNonce(event) {

// Don't submit the form until SqPaymentForm returns with a nonce
event.preventDefault();
// Request a nonce from the SqPaymentForm object
paymentForm.requestCardNonce();
}
paymentForm.build();
    
//TODO: paste code from step 2.1.2

//Generate a random UUID as an idempotency key for the payment request
// length of idempotency_key should be less than 45
function uuidv4() {
return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});
}
