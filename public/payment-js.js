
const appId = 'sq0idp-7OxEyTsDKwKFnMcZu_SFzg';
const locationId = 'EESJP8FE4016M';
const idempotency_key = uuidv4();
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}
async function initializeCard(payments) {
  const card = await payments.card();
  await card.attach('#card-container');

  return card;
}

async function createPayment(token) {
  var amount = document.getElementById('payment-amount').value;
  var name = document.getElementById('payment-name').value;
  var note = document.getElementById('payment-note').value;
  if(name === '' || name === undefined || name === null){
    alert('Please enter your Name.'); 
    throw new Error("Invalid Name error");
  }
  if(amount.length === 0 || amount === '' || amount === undefined || amount === null){
    alert('Please enter valid amount.');
    throw new Error("Invalid amount entered");
  }
  const body = JSON.stringify({
    name:name,
    amount:amount,
    note:note,
    idempotency_key: idempotency_key,
    location_id: `${locationId}`,
    locationId,
    sourceId: token,
  });

  const paymentResponse = await fetch('process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (paymentResponse.ok) {
    return paymentResponse.json();
  }

  const errorBody = await paymentResponse.text();
  throw new Error(errorBody);
}

async function tokenize(paymentMethod) {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === 'OK') {
    return tokenResult.token;
  } else {
    let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
    if (tokenResult.errors) {
      errorMessage += ` and errors: ${JSON.stringify(
        tokenResult.errors
      )}`;
    }

    throw new Error(errorMessage);
  }
}

// status is either SUCCESS or FAILURE;
function displayPaymentResults(status) {
  const statusContainer = document.getElementById(
    'payment-status-container'
  );
  if (status === 'SUCCESS') {
    statusContainer.classList.remove('is-failure');
    statusContainer.classList.add('is-success');
  } else {
    statusContainer.classList.remove('is-success');
    statusContainer.classList.add('is-failure');
  }

  statusContainer.style.visibility = 'visible';
}

document.addEventListener('DOMContentLoaded', async function () {
  if (!window.Square) {
    throw new Error('Square.js failed to load properly');
  }

  let payments;
  try {
    payments = window.Square.payments(appId, locationId);
  } catch {
    const statusContainer = document.getElementById(
      'payment-status-container'
    );
    statusContainer.className = 'missing-credentials';
    statusContainer.style.visibility = 'visible';
    return;
  }

  let card;
  try {
    card = await initializeCard(payments);
  } catch (e) {
    console.error('Initializing Card failed', e);
    return;
  }

  // Checkpoint 2.
  async function handlePaymentMethodSubmission(event, paymentMethod) {
    event.preventDefault();

    try {
      // disable the submit button as we await tokenization and make a payment request.
      cardButton.disabled = true;
      const token = await tokenize(paymentMethod);
      console.log("Token created ",token)
      const paymentResults = await createPayment(token);
      displayPaymentResults('SUCCESS');

      console.debug('Payment Success', paymentResults);
    } catch (e) {
      cardButton.disabled = false;
      displayPaymentResults('FAILURE');
      console.error(e.message);
    }
  }

  const cardButton = document.getElementById('card-button');
  cardButton.addEventListener('click', async function (event) {
    await handlePaymentMethodSubmission(event, card);
  });
});