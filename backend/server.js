const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const speakeasy = require('speakeasy');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(express.json());

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  const hash = await bcrypt.hash(password, 10);
  const otpSecret = speakeasy.generateSecret({ length: 20 }).base32;
  try {
    const user = await prisma.user.create({ data: { username, password: hash, otpSecret } });
    res.json({ id: user.id, username: user.username, otpSecret });
  } catch (err) {
    res.status(400).json({ error: 'User exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password, otp } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.otpSecret) {
    const verified = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: otp || '',
    });
    if (!verified) return res.status(401).json({ error: 'Invalid OTP' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });
  try {
    const { userId } = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username });
});

app.get('/api/products', async (req, res) => {
  const products = await prisma.product.findMany({ include: { user: true } });
  res.json(products);
});

app.post('/api/products', auth, async (req, res) => {
  const { name, price, description } = req.body;
  if (!name || typeof price !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }
  const product = await prisma.product.create({
    data: { name, price, description, userId: req.userId },
  });
  res.json(product);
});

app.get('/api/transactions', auth, async (req, res) => {
  const txs = await prisma.transaction.findMany({
    where: {
      OR: [{ fromUserId: req.userId }, { toUserId: req.userId }],
    },
    include: { from: true, to: true, product: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(txs);
});

app.post('/api/transactions', auth, async (req, res) => {
  const { toUserId, productId, amount } = req.body;
  if (!toUserId || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Invalid data' });
  }
  try {
    const tx = await prisma.transaction.create({
      data: {
        fromUserId: req.userId,
        toUserId,
        productId,
        amount,
      },
    });
    res.json(tx);
  } catch (err) {
    res.status(400).json({ error: 'Unable to create transaction' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
