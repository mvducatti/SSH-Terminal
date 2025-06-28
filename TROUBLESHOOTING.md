# 🔧 Railway Deployment Troubleshooting

## Common Crash Issues & Solutions

### 1. Missing Host Keys ❌
**Error**: `Host key not found! Run: npm run setup`
**Solution**: 
```bash
# Add keys to git (they're needed for deployment)
git add keys/host_key keys/host_key.pub
git commit -m "Add SSH host keys for deployment"
git push
```

### 2. Port Binding Issues ❌
**Error**: `EADDRINUSE` or `Port already in use`
**Solution**: Railway auto-assigns ports, make sure you use `process.env.PORT`
```javascript
const SSH_PORT = process.env.PORT || 2222;
```

### 3. Figlet Font Issues ❌
**Error**: `figlet` crashes or missing fonts
**Solution**: Add fallback in `generateWelcomeMessage()` (already implemented)

### 4. Uncaught Exceptions ❌
**Error**: Process crashes on client disconnect
**Solution**: Add global error handlers (already implemented)

### 5. Memory Issues ❌
**Error**: Out of memory on Railway free tier
**Solution**: 
- Remove unnecessary console.log in production
- Add memory monitoring
- Limit concurrent connections

## Railway-Specific Debugging

### Check Logs
```bash
# In Railway dashboard
railway logs --follow
```

### Environment Variables
Required env vars for Railway:
- `PORT` (auto-set by Railway)
- `NODE_ENV=production` (optional)

### Build Process
Railway builds with:
1. `npm install`
2. Runs `web: node start.js` from Procfile

### Health Checks
```bash
# Test locally
npm run health

# Test on Railway
railway run npm run health
```

## Connection Testing

### Test SSH Connection
```bash
# Replace with your Railway domain
ssh anyuser@yourapp.up.railway.app

# Or with custom domain
ssh anyuser@yourdomain.com
```

### Debug Connection Issues
1. **Check Railway logs** for startup errors
2. **Verify port binding** in logs
3. **Test with telnet** first: `telnet yourapp.up.railway.app 80`
4. **Check domain DNS** if using custom domain

## Performance Optimization

### Memory Usage
```javascript
// Add to server.js for monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log(`Memory: ${Math.round(used.rss / 1024 / 1024)} MB`);
}, 60000); // Every minute
```

### Connection Limits
```javascript
// Limit concurrent connections
let activeConnections = 0;
const MAX_CONNECTIONS = 10;

// In client handler
if (activeConnections >= MAX_CONNECTIONS) {
  client.end();
  return;
}
activeConnections++;

client.on('end', () => {
  activeConnections--;
});
```

## Deployment Checklist

- [ ] Host keys exist in `keys/` directory
- [ ] Keys are committed to git
- [ ] `Procfile` points to `start.js`
- [ ] `package.json` has correct start script
- [ ] Error handling implemented
- [ ] Railway project connected to GitHub
- [ ] Domain configured (if using custom)

## Emergency Recovery

If deployment fails completely:

1. **Check Railway logs**:
   ```bash
   railway logs
   ```

2. **Redeploy from scratch**:
   ```bash
   git add .
   git commit -m "Fix deployment"
   git push
   ```

3. **Test locally first**:
   ```bash
   npm start
   # Test with: ssh -p 2222 user@localhost
   ```

4. **Use Railway CLI for debugging**:
   ```bash
   railway shell
   node health-check.js
   ```

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **SSH2 Library**: https://github.com/mscdex/ssh2
- **This Project**: Check logs and error handling in `server.js`

## Quick Fixes

**Server won't start**: Check `start.js` logs
**Clients can't connect**: Check port and domain
**Random crashes**: Check error handlers
**Memory issues**: Add connection limits
**Build fails**: Check `package.json` and dependencies
