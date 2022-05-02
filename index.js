import express from 'express'
import { recoverPersonalSignature } from 'eth-sig-util'

const app = express();
const USERS = [];

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/index.html');
});

app.post('/api/login/:address/nonce', function (req, res) {
  const { address } = req.params;
  let user = getUserByAddress(address);
  if (!user) {
    user = createUser(address);
  }
  res.send({ nonce: user.nonce });
});

app.post('/api/login/:address/verify/:sig', function (req, res) {
  const { address, sig } = req.params;
  const user = getUserByAddress(address);
  if (!user || !user.nonce) {
    return res.status(400).send();
  }
  const data = `Authorization nonce: ${user.nonce}`;
  const recoveredAddress = recoverPersonalSignature({ data, sig });
  res.send({ success: recoveredAddress === address });
});

app.listen(8080);


function getUserByAddress (address) {
  const user = USERS.find(item => item.address === address);
  console.log('getUserByAddress', address, user);
  return user;
}

function createUser (address) {
  const nonce = Math.round(Math.random() * 100000000);
  const user = { address, nonce };
  USERS.push(user);
  console.log('createUser', user);
  return user;
}
