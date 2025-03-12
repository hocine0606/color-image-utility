// Color Converter JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const colorPicker = document.getElementById('color-picker');
    const colorPreview = document.getElementById('color-preview');
    const inputType = document.getElementById('input-type');
    const colorInput = document.getElementById('color-input');
    const convertBtn = document.getElementById('convert-btn');
    const hexResult = document.getElementById('hex-result');
    const rgbResult = document.getElementById('rgb-result');
    const cmykResult = document.getElementById('cmyk-result');
    const saveColorForm = document.getElementById('save-color-form');
    const hexValueInput = document.getElementById('hex-value');
    const rgbValueInput = document.getElementById('rgb-value');
    const cmykValueInput = document.getElementById('cmyk-value');

    // Color Conversion Utilities
    const ColorConverter = {
        // Validate and convert input based on selected type
        convertColor(input, type) {
            try {
                switch(type) {
                    case 'hex':
                        return this.convertFromHex(input);
                    case 'rgb':
                        return this.convertFromRGB(input);
                    case 'cmyk':
                        return this.convertFromCMYK(input);
                    default:
                        throw new Error('Invalid input type');
                }
            } catch (error) {
                this.showError('Invalid color format');
                return null;
            }
        },

        // HEX to RGB and CMYK conversion
        convertFromHex(hex) {
            // Remove # if present
            hex = hex.replace(/^#/, '');
            
            // Validate hex
            if (!/^([0-9A-Fa-f]{3}){1,2}$/.test(hex)) {
                throw new Error('Invalid HEX format');
            }

            // Expand shorthand hex
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }

            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            return {
                hex: `#${hex}`,
                rgb: `rgb(${r}, ${g}, ${b})`,
                cmyk: this.rgbToCMYK(r, g, b)
            };
        },

        // RGB to HEX and CMYK conversion
        convertFromRGB(rgb) {
            // Parse RGB input
            const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (!match) {
                throw new Error('Invalid RGB format');
            }

            const [, r, g, b] = match.map(Number);

            // Validate RGB values
            if ([r, g, b].some(val => val < 0 || val > 255)) {
                throw new Error('RGB values must be between 0 and 255');
            }

            return {
                hex: this.rgbToHex(r, g, b),
                rgb: `rgb(${r}, ${g}, ${b})`,
                cmyk: this.rgbToCMYK(r, g, b)
            };
        },

        // CMYK to HEX and RGB conversion
        convertFromCMYK(cmyk) {
            // Parse CMYK input
            const match = cmyk.match(/cmyk\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);
            if (!match) {
                throw new Error('Invalid CMYK format');
            }

            const [, c, m, y, k] = match.map(Number);

            // Validate CMYK values
            if ([c, m, y, k].some(val => val < 0 || val > 100)) {
                throw new Error('CMYK values must be between 0 and 100');
            }

            const rgb = this.cmykToRGB(c, m, y, k);

            return {
                hex: this.rgbToHex(rgb[0], rgb[1], rgb[2]),
                rgb: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                cmyk: `cmyk(${c}, ${m}, ${y}, ${k})`
            };
        },

        // Helper conversion methods
        rgbToHex(r, g, b) {
            return `#${[r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('')}`;
        },

        rgbToCMYK(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;

            const k = 1 - Math.max(r, g, b);
            const c = k === 1 ? 0 : (1 - r - k) / (1 - k) * 100;
            const m = k === 1 ? 0 : (1 - g - k) / (1 - k) * 100;
            const y = k === 1 ? 0 : (1 - b - k) / (1 - k) * 100;

            return `cmyk(${Math.round(c)}, ${Math.round(m)}, ${Math.round(y)}, ${Math.round(k * 100)})`;
        },

        cmykToRGB(c, m, y, k) {
            c /= 100;
            m /= 100;
            y /= 100;
            k /= 100;

            const r = Math.round(255 * (1 - c) * (1 - k));
            const g = Math.round(255 * (1 - m) * (1 - k));
            const b = Math.round(255 * (1 - y) * (1 - k));

            return [r, g, b];
        },

        showError(message) {
            // Implement flash message or error display
            console.error(message);
        }
    };

    // UI Interaction Methods
    const UIManager = {
        // Update color preview and input placeholders
        updateColorPreview(color) {
            colorPreview.style.backgroundColor = color;
            colorInput.placeholder = this.getPlaceholderForType(inputType.value);
        },

        // Get appropriate placeholder based on input type
        getPlaceholderForType(type) {
            switch(type) {
                case 'hex': return 'e.g. #4287f5';
                case 'rgb': return 'e.g. rgb(66, 135, 245)';
                case 'cmyk': return 'e.g. cmyk(73, 45, 0, 4)';
            }
        },

        // Display conversion results
        displayResults(results) {
            if (!results) return;

            hexResult.textContent = results.hex;
            rgbResult.textContent = results.rgb;
            cmykResult.textContent = results.cmyk;

            // Update hidden inputs for saving
            hexValueInput.value = results.hex;
            rgbValueInput.value = results.rgb;
            cmykValueInput.value = results.cmyk;
        }
    };

    // Event Listeners
    colorPicker.addEventListener('input', function() {
        const hexColor = this.value;
        UIManager.updateColorPreview(hexColor);
        const results = ColorConverter.convertFromHex(hexColor);
        UIManager.displayResults(results);
    });

    inputType.addEventListener('change', function() {
        UIManager.updateColorPreview(colorPicker.value);
        colorInput.value = ''; // Clear previous input
        colorInput.placeholder = UIManager.getPlaceholderForType(this.value);
    });

    convertBtn.addEventListener('click', function() {
        const input = colorInput.value.trim();
        const type = inputType.value;

        if (!input) {
            ColorConverter.showError('Please enter a color value');
            return;
        }

        const results = ColorConverter.convertColor(input, type);
        UIManager.displayResults(results);
        
        if (results) {
            UIManager.updateColorPreview(results.hex);
            colorPicker.value = results.hex;
        }
    });

    // Copy to Clipboard
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const textToCopy = document.getElementById(targetId).textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Optional: Add visual feedback
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                }, 1000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });

    // Use Saved Color
    document.querySelectorAll('.use-color').forEach(btn => {
        btn.addEventListener('click', function() {
            const hex = this.getAttribute('data-hex');
            const rgb = this.getAttribute('data-rgb');
            const cmyk = this.getAttribute('data-cmyk');

            colorPicker.value = hex;
            UIManager.updateColorPreview(hex);
            UIManager.displayResults({ hex, rgb, cmyk });
        });
    });

    // Initial setup
    UIManager.updateColorPreview(colorPicker.value);
});
