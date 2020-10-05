const sgMail= require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name) =>{
  sgMail.send({
    to: email,
    from: 'jaya.nitp.cse@gmail.com',
    subject:'We are glad to have you with us!!',
    text: `Welcome to the app, ${name} . Let me Know About how you are getting along with the app`
  })
}

const sendCancellationEmail = (email,name) =>{
  sgMail.send({
    to: email,
    from: 'jaya.nitp.cse@gmail.com',
    subject:'GoodBye!!',
    text: `We are sad seeing you leaving us, ${name} . We still hope you will stay with us. If you are going, then please tell us the reason why you are leaving us. we will try to get better for you!!`
  })
}

module.exports ={
  sendWelcomeEmail,
  sendCancellationEmail
}
