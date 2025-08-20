# Flashess - Chess Training Application

## Overview
Flashess is a comprehensive chess training application built with Next.js, React, and TypeScript. It features multiple training modes, custom exercise creation, and an advanced opening tree system.

## Features

### 🎯 Training Modes
- **Training Page**: Interactive chess training with move validation
- **Creation Page**: Create and manage custom chess exercises
- **Opening Tree**: Comprehensive opening theory with variations

### 🏗️ Creation Mode
- **Custom Exercise Builder**: Create exercises from PGN notation
- **Opening Tree Integration**: Real-time opening theory suggestions
- **Move History Management**: Track and analyze game progress
- **Vision Mode**: Enhanced board visualization

### 🌳 Opening Tree System
The opening tree provides:
- **Real-time Analysis**: Shows theoretical moves for any position
- **Variation Explorer**: Deep dive into opening variations
- **Statistics**: Win rates, draw rates, and evaluations
- **Main Line Highlighting**: Identifies principal variations
- **Configurable Depth**: Adjust tree depth (2-5 moves)

### 🎨 UI Components
- **Responsive Design**: Works on desktop and mobile
- **Modern Interface**: Clean, intuitive user experience
- **Custom Scrollbars**: Consistent styling across browsers
- **Interactive Elements**: Hover effects and transitions

## Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Chess Engine**: chess.js for game logic
- **Board Component**: react-chessboard for chess visualization
- **State Management**: React hooks and local storage

## Project Structure

```
Flashess/
├── app/                    # Next.js app directory
│   ├── creation-page/     # Exercise creation interface
│   ├── training-page/     # Training mode interface
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── OpeningTree.tsx   # Opening tree component
│   ├── TrainingBoard.tsx # Chess training board
│   └── ...               # Other components
├── utils/                 # Utility functions and data
│   ├── openings.json     # Opening database
│   ├── openings.ts       # Opening tree logic
│   └── ...               # Other utilities
└── public/               # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Flashess

# Install dependencies
npm install

# Run development server
npm run dev
```

### Usage

#### Creation Mode
1. Navigate to the Creation Page
2. Use the Opening Tree to explore theoretical moves
3. Create custom exercises from PGN or current position
4. Save and manage your exercises

#### Opening Tree
- **Tree Depth**: Adjust how many moves ahead to show
- **Main Lines**: Yellow badges indicate principal variations
- **Statistics**: View win rates and evaluations for each move
- **Expandable Nodes**: Click arrows to explore deeper variations

#### Custom Exercises
- **PGN Input**: Paste standard chess notation
- **Move History**: Track your analysis progress
- **Exercise Management**: Save, load, and delete custom exercises

## Opening Database

The application includes a comprehensive database of chess openings:
- **Main Openings**: e4, d4, Nf3, c4, g3, b3, f4
- **Variations**: Multiple sub-variations for each opening
- **Statistics**: Realistic win rates and evaluations
- **Depth**: Up to 10+ moves in complex variations

## Development

### Adding New Openings
1. Edit `utils/openings.json`
2. Follow the existing structure
3. Include win rates, draw rates, and evaluations
4. Add sub-variations as needed

### Customizing the UI
- Modify Tailwind classes in components
- Update color scheme in `app/global.css`
- Adjust component layouts as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- chess.js for chess logic
- react-chessboard for board visualization
- Tailwind CSS for styling framework 
