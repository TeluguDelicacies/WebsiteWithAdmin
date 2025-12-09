# Telugu Delicacies Website

A modern, responsive website for Telugu Delicacies - an authentic South Indian food manufacturer specializing in ready-to-eat Parota, Chapathi, and traditional Telugu Podis.

## 🌟 Features

- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Product Showcase**: Interactive product catalog with detailed descriptions  
- **Contact Form**: Functional contact form with validation
- **News Ticker**: Continuous scrolling product showcase
- **Modern UI**: Clean, professional design with smooth animations
- **Accessibility**: Screen reader friendly with proper ARIA labels
- **Performance Optimized**: Lazy loading, debounced events, and optimized animations

## 🚀 Quick Start

### For GitHub Pages Deployment:

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Telugu Delicacies website"
   git branch -M main
   git remote add origin https://github.com/yourusername/telugu-delicacies-website.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "main" branch as source
   - Your site will be available at: `https://yourusername.github.io/telugu-delicacies-website`

### Local Development:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/telugu-delicacies-website.git
   cd telugu-delicacies-website
   ```

2. **Add Images**
   - Create the required folder structure as outlined in `image-requirements.md`
   - Add all product and category images to the respective folders
   - Ensure all image filenames match exactly as specified in the requirements

3. **Run Locally**
   
   To avoid CORS errors with `file://` protocol, you must use a local server. Choose one:

   **Option A: VS Code Live Server (Recommended)**
   - Install "Live Server" extension in VS Code
   - Right-click `index.html` > "Open with Live Server"

   **Option B: Node.js**
   - Install Node.js
   - Run `npx serve .` in the project folder

   **Option C: Python**
   - Run `python -m http.server 8000` in the project folder
   - Open `http://localhost:8000`

## 📁 File Structure

```
telugu-delicacies-website/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
├── README.md           # This file
└── .gitignore         # Git ignore rules
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup with proper accessibility
- **CSS3**: Modern responsive design with Grid and Flexbox
- **Vanilla JavaScript**: Interactive functionality without dependencies
- **Typography**: Montserrat (headers), Roboto (body text), Noto Sans Telugu (Telugu content)
- **Font Awesome**: Icons for better visual appeal
- **Google Fonts**: Comprehensive font system with responsive scaling

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px - 1439px
- **Large Desktop**: ≥ 1440px

## ✨ Key Components

### Header
- Fixed navigation with responsive logo and brand information
- Smooth scroll navigation buttons
- Dynamic background opacity on scroll

### Hero Section  
- Full-width background image with overlay
- Responsive typography and call-to-action
- Mobile-optimized content layout

### Product Showcase
- Infinite scrolling ticker animation
- Hover/touch controls to pause animation
- Responsive item sizing across devices

### Product Categories
- Interactive dropdown menus
- Detailed product descriptions with images
- Smooth fade-in animations

### Contact Form
- Real-time field validation
- Accessible form controls with proper labels
- Loading states and user feedback

### Footer
- Company information and location map
- Responsive grid layout
- Social media ready structure

## 🎨 Design Features

- **Color Scheme**: Green gradient theme reflecting natural/organic feel
- **Typography**: Montserrat for headers with rem-based responsive scaling, Roboto for body text, Noto Sans Telugu for bilingual content
- **Animations**: Smooth transitions and scroll-triggered animations
- **Accessibility**: High contrast support and keyboard navigation

## 🔧 Customization

### Colors
Main brand colors and responsive scaling are defined in CSS custom properties. Update these in `styles.css`:

```css
:root {
  font-size: 16px; /* Base font size for rem scaling */
  --primary-green: #228B22;
  --secondary-green: #32CD32;
  --accent-gold: #FFD700;
  --accent-orange: #FF6B35;
  --product-item-width: 10rem; /* Responsive product showcase sizing */
  --product-gap-width: 1.25rem;
}
```

### Content
- **Company Info**: Update contact details in the footer and contact section
- **Products**: Modify product lists in both the ticker and category sections
- **Images**: Replace image URLs with your own product photos

### Contact Form
The contact form currently shows a simulation. To make it functional:

1. **Formspree Integration**: Add action attribute
2. **EmailJS**: Implement client-side email sending
3. **Backend API**: Connect to your server endpoint

## 🌐 Browser Support

- **Chrome**: 60+
- **Firefox**: 60+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Safari**: iOS 12+
- **Chrome Mobile**: Android 8+

## 📈 Performance Features

- **Lazy Loading**: Images load only when needed
- **Debounced Events**: Scroll and resize events are optimized
- **Reduced Motion**: Respects user preference for animations
- **Intersection Observer**: Efficient scroll-triggered animations

## 🔍 SEO Features

- Semantic HTML structure
- Proper heading hierarchy
- Meta tags for description and keywords
- Alt text for all images
- Structured data ready

## 🚀 Deployment Options

### GitHub Pages (Recommended)
Free hosting with custom domain support

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

### Vercel
```bash
# Install Vercel CLI  
npm install -g vercel

# Deploy
vercel --prod
```

## 📞 Contact Information

**Telugu Delicacies**
- **Address**: II, Western Part, Plot No: 121/3, B N Reddy Nagar, Cherlapalli, Hyderabad, Telangana 500051
- **Phone**: +91 96767 12031, +91 96185 13131
- **Email**: info@telugudelicacies.com
- **FSSAI License**: 13623999000239

## 📄 License

This project is proprietary to Telugu Delicacies. All rights reserved.

## 🤝 Contributing

This is a private company website. For updates or modifications, please contact the development team.

---

**© 2024 Telugu Delicacies. All rights reserved.**
