document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#reply').addEventListener('click', reply);
  


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#error-message').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

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
  document.querySelector('#email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      for (email of emails) {

        let emailContainer = document.createElement('div');
        if(email.read === true) {
          emailContainer.className = 'email-container read';
        } else {
          emailContainer.className = 'email-container';
        }
        

        let sender = document.createElement('div');
        sender.innerHTML = email.sender;
        sender.className = 'email-sender';
        sender.dataset.id = email.id;
        sender.addEventListener('click', load_email);
        emailContainer.append(sender)
        

        let subject = document.createElement('div');
        subject.innerHTML = email.subject;
        subject.className = 'email-subject';
        subject.dataset.id = email.id;
        subject.addEventListener('click', load_email);
        emailContainer.append(subject)

        let timestamp = document.createElement('div');
        timestamp.innerHTML = email.timestamp;
        timestamp.className = 'email-timestamp';
        emailContainer.append(timestamp)

        if (mailbox === 'inbox' || mailbox === 'archive') {
          let archive = document.createElement('input');
          archive.className = 'btn btn-primary archive';
          archive.type = 'submit';
          if (email.archived == false) {
            archive.value = 'Archive'
          } else {
            archive.value = 'Unarchive';
          }
          archive.dataset.id = email.id;
          archive.dataset.archived = email.archived;
          archive.onclick = archive_email;
          emailContainer.append(archive)
        }
        
        document.querySelector('#emails-view').append(emailContainer)
        
      }
  })
}

function load_email(event) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';

  let emailId = event.target.dataset.id;
  document.querySelector('#reply').dataset.id = emailId;

  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
    
    document.querySelector('.email-from').innerHTML = `From: ${email.sender}`;
    document.querySelector('.email-to').innerHTML = `To: ${email.recipients.join()}`;
    document.querySelector('.subject').innerHTML = `Subject: ${email.subject}`;
    document.querySelector('.timestamp').innerHTML = `Timestamp: ${email.timestamp}`;
    document.querySelector('.email-body').innerHTML = email.body;

  });

  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}

function archive_email(event) {
  let emailId = event.target.dataset.id;
  let status = event.target.dataset.archived;

  if (status == 'false') {
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(() => {
      load_mailbox('inbox')
    })
  } else {
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(() => {
      load_mailbox('inbox')
    })
  }
  
}

function reply(event) {
  let emailId = event.target.dataset.id;
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#error-message').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
    let subject = email.subject
    
    document.querySelector('#compose-recipients').value = email.sender;

    if (subject.search(/Re:/i) === 0) {
      document.querySelector('#compose-subject').value = `${email.subject}`;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    
    document.querySelector('#compose-body').value = `\n \n >>>>>>>> \n On ${email.timestamp} ${email.sender} wrote: ${email.body}` ;
    document.querySelector('#compose-body').focus()
    document.querySelector('#compose-body').selectionEnd = 0;
  });

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