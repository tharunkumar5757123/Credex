# PRICING_DATA

This file is the pricing source of truth for the Credex MVP audit engine. Values are modeled as monthly USD plan assumptions and should be re-verified before procurement decisions.

## Cursor
- Billing model: seat-based
- Hobby: $0/seat/month
- Pro: $20/seat/month
- Business: $40/seat/month
- Enterprise: $80/seat/month
- Seat thresholds: Hobby 1, Pro 3, Business 25, Enterprise 999
- Credit discount assumption: 25%

## GitHub Copilot
- Billing model: seat-based
- Individual: $10/seat/month
- Business: $19/seat/month
- Enterprise: $39/seat/month
- Seat thresholds: Individual 1, Business 50, Enterprise 999
- Credit discount assumption: 15%

## Claude
- Billing model: hybrid; API direct is usage-based, named plans are seat-based
- Free: $0/seat/month
- Pro: $20/seat/month
- Max: $100/seat/month
- Team: $30/seat/month
- Enterprise: $60/seat/month
- API direct: user-entered usage spend
- Seat thresholds: Free 1, Pro 2, Max 2, Team 50, Enterprise 999, API direct 999
- Credit discount assumption: 25%

## ChatGPT
- Billing model: hybrid; API direct is usage-based, named plans are seat-based
- Plus: $20/seat/month
- Team: $25/seat/month
- Enterprise: $60/seat/month
- API direct: user-entered usage spend
- Seat thresholds: Plus 2, Team 50, Enterprise 999, API direct 999
- Credit discount assumption: 25%

## Anthropic API
- Billing model: usage-based
- API direct: user-entered usage spend
- Seat thresholds: API direct 999
- Credit discount assumption: 25%

## OpenAI API
- Billing model: usage-based
- API direct: user-entered usage spend
- Seat thresholds: API direct 999
- Credit discount assumption: 25%

## Gemini
- Billing model: hybrid; API is usage-based, Pro and Ultra are flat plan benchmarks
- Pro: $100/month flat benchmark
- Ultra: $240/month flat benchmark
- API: user-entered usage spend
- Seat thresholds: API 999; Pro and Ultra do not use seat multiplication
- Credit discount assumption: 20%

## Windsurf
- Billing model: seat-based
- Free: $0/seat/month
- Pro: $15/seat/month
- Teams: $30/seat/month
- Enterprise: $60/seat/month
- Seat thresholds: Free 1, Pro 3, Teams 50, Enterprise 999
- Credit discount assumption: 15%

## Hugging Face
- Billing model: usage-based
- API direct: user-entered usage spend
- Seat thresholds: API direct 999
- Credit discount assumption: 20%
