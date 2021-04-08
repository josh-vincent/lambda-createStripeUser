const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-southeast-2" });

const COGNITO = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

const stripe = require("stripe")("sk_test_ubDVscDUXB04y842N53sxWjh00advqWqiU");

exports.handler = async (event) => {
  const { userName, userPoolId } = event;
  const {
    request: { userAttributes },
  } = event;

  const stripeUser = await createUserInStripe(userAttributes);
  let update = {
    userPoolId,
    userName,
    attribute: "stripe_id",
    value: stripeUser.id,
  };
  return await updateCognito(update);
};

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
