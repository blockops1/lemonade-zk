# Lemonade Stand Game

A modern web-based remake of the classic Apple II game "Lemonade Stand". Run your own virtual lemonade business while dealing with weather conditions, inventory management, and pricing strategies.

## Features

- Classic gameplay mechanics with modern improvements
- Dynamic weather system affecting sales
- Detailed financial reporting
- Multiple game states (win/bankruptcy conditions)
- ASCII art graphics
- Browser-based gameplay

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```
4. Open http://localhost:9000 in your browser

## Game Instructions

1. Each day you'll need to make three decisions:
   - How many glasses of lemonade to make (at $0.02 per glass)
   - How many advertising signs to make (at $0.15 per sign)
   - What price to charge per glass (in cents)

2. Weather conditions affect sales:
   - Sunny: Normal sales
   - Hot and Dry: Increased sales
   - Cloudy: Reduced sales

3. Win conditions:
   - Reach $100 in assets, or
   - Survive for 30 days

4. Lose condition:
   - Go bankrupt twice

## Technologies Used

- JavaScript (ES6+)
- Webpack
- Node.js

## License

MIT License 