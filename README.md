# Lambda stripe assign to custom attribute confirm signup trigger

Lambda function after user confirms account adds user to stripe and then updated custom cognito field.

### Dependancies

`npm i stripe`

### Prerequisites

 - Add custom user attribute under the cognito menu.
 - Set up trigger, Post Confirmation
 - Make sure to update your lambda permissions to include `cognito-idp:AdminUpdateUserAttributes`

### Add User to Stripe 
```javascript
async function createUserInStripe(data) {
  console.log("adding to stripe:", data);
  const { username, email, sub } = data;
  const createdUser = await stripe.customers
    .create({
      name: username,
      email: email,
      description: sub,
    })
    .then((result) => {
      console.log("result", result);
      return result;
    })
    .catch((err) => console.log("err", err));
  return createdUser;
}
```

### Add Stripe ID to Cognito user 
```javascript
const updateCognito = async ({ userPoolId, userName, attribute, value }) => {
  const updatedUser = await COGNITO.adminUpdateUserAttributes({
    UserAttributes: [
      {
        Name: `custom:${attribute}`,
        Value: value,
      },
    ],
    UserPoolId: userPoolId,
    Username: userName,
  }).promise();
  return updatedUser;
};
```

### Testing

Event example

```json
{
  "version": "1",
  "region": "ap-southeast-2",
  "userPoolId": "${your_userpool_here}",
  "userName": "${username_justcreated_here}",
  "callerContext": {
    "awsSdkVersion": "aws-sdk-java-console",
    "clientId": "12321321321321321"
  },
  "triggerSource": "PostConfirmation_ConfirmSignUp",
  "request": {
    "userAttributes": {
      "sub": "a2c21839-f9fc-49e3-be9a-16f5823d6705",
      "cognito:user_status": "CONFIRMED",
      "email_verified": "true",
      "email": "asdfsdfsgdfg@carbtc.net"
    }
  },
  "response": {}
}
```
