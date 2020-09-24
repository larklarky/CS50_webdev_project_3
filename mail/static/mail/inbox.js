document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#error-message').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = (event) => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => {
      response.json().then(result => {
        if (response.status == 201) {
          load_mailbox('sent');
        } else {
          document.querySelector('#error-message').style.display = 'block';
          document.querySelector('#error-message').innerHTML = result.error;

        }
      })
    })
    .catch(error => {
      console.log('Something went wrong', error)
    })
    event.preventDefault();

  }
  
  
  
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      for (email of emails) {

        let emailContainer = document.createElement('div');
        emailContainer.className = 'email-container';

        let sender = document.createElement('div');
        sender.innerHTML = email.sender;
        sender.className = 'email-sender';
        emailContainer.append(sender)

        let subject = document.createElement('div');
        subject.innerHTML = email.subject;
        subject.className = 'email-subject';
        emailContainer.append(subject)

        let timestamp = document.createElement('div');
        timestamp.innerHTML = email.timestamp;
        timestamp.className = 'email-timestamp';
        emailContainer.append(timestamp)

        document.querySelector('#emails-view').append(emailContainer)

      }
  });
}