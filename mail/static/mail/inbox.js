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
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  
  
  document.querySelector('#compose-form').onsubmit = (form) => {
    form.preventDefault();
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    
    // send email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      // load 'sent' mailbox.
      load_mailbox('sent');
    });
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><hr>`;
  
  if (mailbox === 'sent') {
    const emails = query_emails('sent');
  } else if (mailbox === 'inbox') {
    const emails = query_emails('inbox');
  } else if (mailbox === 'archive') {
    const emails = query_emails('archive');
  }
}

function query_emails(mailbox) {
  fetch_url = ('/emails/' + mailbox)
  console.log(fetch_url)
  fetch(fetch_url)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(add_email);
  });
}


function add_email(contents) {
  
  // Create anchor element
  const email_link = document.createElement('a');
  email_link.className = 'email-link'
  email_link.setAttribute('display', 'block');
  email_link.style.color = "BLACK";
  email_link.style.textDecoration = "none";
  
  email_pk = contents.id;
  
  // create child div element
  const email_div = document.createElement('div');
  email_div.className = 'email';
  email_link.appendChild(email_div);
  
  if (contents.read === false) {
    email_div.style.backgroundColor = "SEASHELL";
  }
  else {
    email_div.style.backgroundColor = "WHITE";
  }
  email_div.innerHTML = `From: ${contents.sender} <br> To: ${contents.recipients} <br> Subject: ${contents.subject} <br>Time: ${contents.timestamp}<hr>`;
  
  // create link destination in email link
  email_link.setAttribute("href", '#');
  email_link.onclick = () => {
    console.log(contents);
    load_email(contents);
    mark_as_read(contents);
  }
  
  document.querySelector('#emails-view').append(email_link);
}

// load individual email view
function load_email(contents) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  
  // Show the email's sender
  document.querySelector('#sender').innerHTML = `From: ${contents.sender}`;
  document.querySelector('#recipients').innerHTML = `To: ${contents.recipients}`;
  document.querySelector('#subject').innerHTML = `Subject: ${contents.subject}`;
  document.querySelector('#sent-time').innerHTML = `Time: ${contents.timestamp}`;
  document.querySelector('#body').innerHTML = `Body: ${contents.body}`;
  
  // Show archive-toggle button
  show_archive_button(contents);
  
  // Show reply button
  document.querySelector('#reply-button').onclick = () => {
    compose_email();
    add_reply_button();
  }
  
  // add reply button and functionality
  function add_reply_button() {
    document.querySelector('#compose-recipients').value = contents.sender;
    if (contents.subject.slice(0,4) !== 'Re: ') {
      const reply_subject = 'Re: ' + contents.subject;
      document.querySelector('#compose-subject').value = reply_subject;
    } else {
      document.querySelector('#compose-subject').value = contents.subject;
    }
    const body_string = `\n\n\n----------\nOn ${contents.timestamp} ${contents.sender} wrote: ${contents.body}`;
    document.querySelector('#compose-body').value = body_string;
  }
  
  function show_archive_button(contents) {
    const archive_me = document.querySelector('#archive-me');
    const unarchive_me = document.querySelector('#unarchive-me');
    archive_me.onclick = () => {
      toggle_archive_email(contents);
    }
    unarchive_me.onclick = () => {
      toggle_archive_email(contents);
    }
    if (contents.archived === false) {
      archive_me.style.display = 'block';
      unarchive_me.style.display = 'none';
    }
    else {
      archive_me.style.display = 'none';
      unarchive_me.style.display = 'block';
    }
  }
}

// Mark email as read
function mark_as_read(contents) {
  email_pk = contents.id;
  fetch(`/emails/${email_pk}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

// Toggle Archive property for email
function toggle_archive_email(contents) {
  email_pk = contents.id;
  fetch(`/emails/${email_pk}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !contents.archived
    })
  })
  .then( () => {
    load_mailbox('inbox');
  });
}


