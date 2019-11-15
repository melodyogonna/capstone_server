const app = require('express')();

const auth = require('./routes/auth');
const user = require('./routes/user');

const PORT = process.env.PORT || 5000;
app.set('port', PORT);

app.use('/api/v1/auth', auth);
app.use('/api/v1/user', user);

app.listen(app.get('port'), () => {
  console.log(`Listening on port ${app.get('port')}`);
});
