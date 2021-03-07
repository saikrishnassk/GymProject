//TODO: paste code from step 2.1.1
    const idempotency_key = uuidv4();
    // Create and initialize a payment form object
    const paymentForm = new SqPaymentForm({
    // Initialize the payment form elements
    
    //TODO: Replace with your sandbox application ID
    applicationId: "sandbox-sq0idb-oyi32pji49CBhaL8Q8w9LQ",
    inputClass: 'sq-input',
    autoBuild: false,
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
        // var amount = document.getElementById("Amount-custom").value;
        fetch('process-payment', {
method: 'POST',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json'
},
body: JSON.stringify({
// amount:amount,
nonce: nonce,
idempotency_key: idempotency_key,
location_id: "L8M4338DZF0SW"
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
console.log(data);
alert('Payment complete successfully!\nCheck browser developer console for more details');
})
.catch(err => {
console.error(err);
alert('Payment failed to complete!\nCheck browser developer console for more details');
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
