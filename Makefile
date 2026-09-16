.PHONY: install start stop restart status logs test

# Install dependencies
install:
	npm install

# Start server
start:
	@echo "Starting chatbot server..."
	@PORT=3458 nohup node server.js > /tmp/chatbot.log 2>&1 &
	@sleep 2
	@echo "Server started on port 3458"

# Stop server
stop:
	@echo "Stopping chatbot server..."
	@pkill -f "node server.js" || true
	@echo "Server stopped"

# Restart server
restart: stop start

# Show server status
status:
	@echo "=== Chatbot Server Status ==="
	@curl -s http://localhost:3458/health 2>/dev/null || echo "Server not running"
	@echo ""

# Show logs
logs:
	@tail -f /tmp/chatbot.log

# Run tests
test:
	@echo "=== Running Tests ==="
	@echo "1. Health check..."
	@curl -s http://localhost:3458/health | grep -q "ok" && echo "   ✓ Health OK" || echo "   ✗ Health FAILED"
	@echo "2. Config endpoint..."
	@curl -s http://localhost:3458/config | grep -q "botName" && echo "   ✓ Config OK" || echo "   ✗ Config FAILED"
	@echo "3. Chat endpoint..."
	@curl -s -X POST http://localhost:3458/chat -H "Content-Type: application/json" -d '{"message":"test","games":["snake"]}' | grep -q "jobId" && echo "   ✓ Chat OK" || echo "   ✗ Chat FAILED"
	@echo "=== Tests Complete ==="

# Deploy to server
deploy:
	@echo "Deploying to adlr.ir/apps/chatbot/..."
	@rsync -avz --exclude 'node_modules' --exclude '.env' . root@185.18.215.60:/root/nginx-certbot/websites/chatbot/
	@echo "Deploy complete! Restart nginx if needed."

# Clean
clean:
	@rm -rf node_modules
	@echo "Cleaned node_modules"