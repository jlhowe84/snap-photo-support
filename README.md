# SNAP Photo Support Page

A modern, responsive customer support page for SNAP Photo with FAQ search functionality and support ticket submission form.

## 📁 Project Structure

```
SNAP Customer Support/
├── index.html          # Main HTML file with Bootstrap 5 integration
├── css/
│   └── styles.css      # Custom CSS with responsive design
├── js/
│   └── scripts.js      # JavaScript functionality for FAQ search
├── assets/             # Directory for images and icons
├── faqs.md             # FAQ content in markdown format
├── favicon.svg         # Red camera favicon (SVG format)
├── favicon.ico         # Fallback favicon for older browsers
└── README.md           # Project documentation
```

## ✨ Features

### 🎨 Design & Layout
- **Bootstrap 5** integration via CDN
- **Mobile-first responsive design**
- **Semantic HTML5** elements (header, main, section, footer)
- **Modern gradient backgrounds** and smooth animations
- **Professional typography** and spacing

### 🔍 FAQ Section
- **Dynamic content loading** from `faqs.md` markdown file
- **Bootstrap accordion** with automatically generated Q&A pairs
- **Real-time search functionality** that filters questions instantly
- **Search term highlighting** in both questions and answers
- **Keyboard navigation** support (Escape to clear search)
- **Accessibility features** with ARIA attributes
- **Easy content management** - just edit the markdown file

### 📝 Support Ticket Form
- **Zapier Interface integration** for seamless form handling
- **Professional form design** with built-in validation
- **Automatic data processing** and workflow integration
- **Customizable fields** and submission handling
- **Responsive design** that works on all devices

### ♿ Accessibility Features
- **ARIA attributes** on all interactive elements
- **Keyboard navigation** support
- **Screen reader compatibility**
- **High contrast mode** support
- **Reduced motion** preferences respected
- **Skip links** for keyboard users
- **Focus indicators** for all interactive elements

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools required - runs directly in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. The page will load with all functionality ready to use

### Local Development
For local development, you can use any simple HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🛠️ Customization

### Adding FAQ Items
To add new FAQ items, simply edit the `faqs.md` file. The format is:

```markdown
## Your Question Here?
Your answer here. You can write multiple paragraphs.

## Another Question?
Another answer with multiple lines
if needed.
```

The JavaScript will automatically parse the markdown and create the accordion items. No HTML editing required!

### Modifying Form Fields
The support form can be customized by editing the form section in `index.html`. The JavaScript validation will automatically adapt to new required fields.

### Styling Changes
All custom styles are in `css/styles.css`. The file uses CSS custom properties (variables) for easy color scheme modifications:

```css
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    /* ... other colors */
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 576px
- **Tablet**: 576px - 768px
- **Desktop**: > 768px

The design is fully responsive and adapts to all screen sizes.

## 🔧 JavaScript API

The JavaScript functionality is exposed through the `window.SNAPSupport` object:

```javascript
// Initialize FAQ search
SNAPSupport.initFAQSearch();

// Initialize form validation
SNAPSupport.initFormValidation();

// Validate a specific field
SNAPSupport.validateField(fieldElement);

// Announce message to screen readers
SNAPSupport.announceToScreenReader('Message here');
```

## 🎯 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 📋 Form Validation Rules

- **Name**: Required, minimum 2 characters
- **Email**: Required, valid email format
- **Subject**: Required, must select from dropdown
- **Message**: Required, minimum 10 characters
- **Order Number**: Optional

## 🔒 Security Considerations

- Form validation is client-side only
- For production use, implement server-side validation
- Consider adding CSRF protection for form submissions
- Use HTTPS in production environments

## 📞 Support Information

The page includes placeholder contact information:
- **Phone**: 1-800-SNAP-PHOTO
- **Email**: support@snapphoto.com
- **Hours**: Mon-Fri 9AM-6PM EST

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across different browsers
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues

- None currently reported

## 🔄 Version History

- **v1.0.0**: Initial release with FAQ search and support form

---

**Built with ❤️ for SNAP Photo customer support** 