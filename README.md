# 🏎️ Racing Game

A modern, feature-rich 2D racing game built with HTML5 Canvas, CSS3, and JavaScript. Experience arcade-style racing with stunning visual effects, power-ups, and progressive difficulty.

![Racing Game Screenshot](web/screenshot.png)

## 🎮 Features

### 🚗 **Advanced Car System**
- **PNG-style car sprites** with realistic metallic finishes
- **Dynamic lighting effects** - headlights for player, taillights for opponents
- **Chrome wheel effects** with radial gradients
- **Professional car design** with detailed windows and shadows
- **Multiple car colors** with unique sprite generation

### 🛣️ **Realistic Road Environment**
- **Animated sky background** with time-of-day color changes
- **Moving cloud systems** that drift across the sky
- **Professional asphalt texture** with realistic gradients
- **Enhanced grass borders** with 3D trees and trunks
- **Glowing lane dividers** with proper highway markings
- **Lane boundary constraints** - cars never leave their lanes

### ⭐ **Power-up System**
- **🪙 Coins** - Collect for bonus points (50 points each)
- **🛡️ Shields** - Temporary invincibility from collisions
- **⚡ Speed Boost** - Enhanced speed and maneuverability
- **Animated power-ups** with rotating symbols and sparkle effects
- **Dynamic collection effects** with particle explosions

### 💥 **Visual Effects System**
- **Advanced particle engine** with gravity and rotation
- **Multi-colored explosion effects** with sparks and debris
- **Enhanced exhaust trails** for all vehicles
- **Glowing shield and speed boost indicators**
- **Professional lighting and shadow effects**
- **Smooth gradient animations** throughout

### 🎵 **Audio System**
- **Dynamic sound generation** using Web Audio API
- **Lane change audio feedback** with directional tones
- **Collision impact sounds** with realistic effects
- **Power-up collection sounds** - unique for each type
- **Procedural audio** - no external sound files required

### 🏁 **Game Mechanics**
- **Progressive difficulty** - speed and spawn rate increase with levels
- **Lives system** with temporary invincibility after hits
- **Real-time HUD** showing lives, level, shields, and speed boost status
- **High score tracking** with browser localStorage persistence
- **Comprehensive collision detection** with pixel-perfect accuracy

## 🚀 Getting Started

### Prerequisites
- Modern web browser with HTML5 Canvas support
- Python 3.x (for local development server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ceyhun2056/Racing-game.git
   cd Racing-game
   ```

2. **Start local development server**
   ```bash
   cd web
   python -m http.server 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000` in your web browser

### Alternative Setup
You can also run the game by opening `web/index.html` directly in your browser, though some features work best with a local server.

## 🎮 How to Play

### Controls
- **A / Left Arrow** - Move left
- **D / Right Arrow** - Move right
- **W / Up Arrow** - Speed boost (when available)
- **S / Down Arrow** - Slow down

### Objective
- **Survive** as long as possible by avoiding enemy cars
- **Collect power-ups** to gain advantages and bonus points
- **Achieve high scores** by surviving longer and collecting coins
- **Progress through levels** with increasing difficulty

### Power-ups Guide
- **🪙 Coins** - Worth 50 points each, collect for high scores
- **🛡️ Shields** - Protects from one collision, lasts 5 seconds
- **⚡ Speed Boost** - Increases speed and maneuverability for 3 seconds

### Scoring System
- **+10 points** for each car avoided
- **+50 points** for each coin collected
- **+1 point per frame** while playing
- **Progressive multipliers** at higher levels

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas** - Core rendering engine
- **JavaScript ES6+** - Game logic and mechanics
- **CSS3** - UI styling with gradients and animations
- **Web Audio API** - Dynamic sound generation
- **Local Storage** - High score persistence

### Performance Features
- **Sprite caching system** - Pre-rendered car images for optimal performance
- **Efficient particle management** - Automatic cleanup and optimization
- **RequestAnimationFrame** - Smooth 60 FPS gameplay
- **Optimized collision detection** - Fast rectangular intersection algorithms

### Browser Compatibility
- **Chrome/Chromium** - Full support with all features
- **Firefox** - Full support with all features
- **Safari** - Full support (may require user interaction for audio)
- **Edge** - Full support with all features

## 📁 Project Structure

```
Racing-game/
├── web/
│   ├── index.html          # Main game HTML
│   ├── style.css           # Game styling and animations
│   ├── game.js             # Core game logic and mechanics
│   └── README.md           # This file
├── LICENSE                 # MIT License
└── README.md               # Project overview
```

## 🎨 Visual Design

### Color Palette
- **Primary**: Deep blues and purples for backgrounds
- **Accent**: Bright yellows and cyans for UI elements
- **Cars**: Vibrant colors with metallic finishes
- **Effects**: Dynamic gradients and glow effects

### Design Principles
- **Modern arcade aesthetic** with neon-like effects
- **Professional UI design** with smooth transitions
- **Accessibility-focused** with clear visual indicators
- **Mobile-responsive** design principles

## 🔧 Development

### Adding New Features
The code is structured modularly for easy extension:

- **Car mechanics** - Modify `drawCar()` and `createCarSprite()` functions
- **Power-ups** - Add new types to `POWER_UP_TYPES` object
- **Visual effects** - Extend the particle system in `createParticle()`
- **Audio** - Add new sounds in the `playSound()` function

### Code Organization
- **Game state management** - Clean separation of game logic
- **Modular functions** - Each feature in its own function
- **Configuration constants** - Easy tweaking of game parameters
- **Performance optimization** - Efficient algorithms and caching

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **HTML5 Canvas API** - For powerful 2D graphics capabilities
- **Web Audio API** - For dynamic sound generation
- **Modern CSS** - For beautiful styling and animations
- **Open source community** - For inspiration and best practices

## 🎯 Future Enhancements

- [ ] **Multiplayer support** with real-time competition
- [ ] **Track variations** with different environments
- [ ] **Car customization** with upgrades and modifications
- [ ] **Achievement system** with unlockable content
- [ ] **Mobile touch controls** for smartphone gameplay
- [ ] **Leaderboards** with online score sharing

---

**Enjoy the race! 🏁**

For questions, suggestions, or issues, please open an issue on GitHub or contact the development team.
